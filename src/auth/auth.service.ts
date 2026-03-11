import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordService } from './password.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * STEP 1 — Identity Login
   * Returns list of memberships (workspaces)
   */
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        memberships: {
          where: {
            deletedAt: null,
            isActive: true,
          },
          include: {
            tenant: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await this.passwordService.compare(
      password,
      user.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update identity login analytics
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: {
          increment: 1,
        },
      },
    });

    return {
      userId: user.id,
      name: user.name,
      memberships: user.memberships.map((m) => ({
        tenantId: m.tenantId,
        tenantName: m.tenant.name,
        role: m.role,
      })),
    };
  }

  /**
   * STEP 2 — Workspace Selection
   * Issues tenant-scoped JWT
   */
  async selectTenant(userId: string, tenantId: string) {
    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        tenantId,
        userId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        tenant: true,
      },
    });

    if (!membership) {
      throw new UnauthorizedException('Not a member of this tenant');
    }

    // Update workspace login analytics
    await this.prisma.tenantMembership.update({
      where: { id: membership.id },
      data: {
        lastLoginAt: new Date(),
        loginCount: {
          increment: 1,
        },
      },
    });

    const payload = {
      sub: userId,
      tenantId: membership.tenantId,
      role: membership.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }

  /**
   * Tenant Bootstrap Signup
   * Creates:
   * - User identity
   * - Tenant
   * - OWNER membership
   * - Scoped JWT
   */
  async signup(data: SignupDto) {
    const passwordHash = await this.passwordService.hash(data.password);

    // Create User Identity
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
      },
    });

    // Create Tenant
    const tenant = await this.prisma.tenant.create({
      data: {
        name: data.tenantName,
        status: 'ACTIVE',
      },
    });

    // Create OWNER Membership
    const membership = await this.prisma.tenantMembership.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        role: 'OWNER',
        isActive: true,
      },
    });

    const payload = {
      sub: user.id,
      tenantId: tenant.id,
      role: membership.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }
}