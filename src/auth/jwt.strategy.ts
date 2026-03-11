import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret',
    });
  }

  async validate(payload: any) {
    const userId = payload.sub;
    const tenantId = payload.tenantId;

    if (!userId || !tenantId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // 🔒 Verify Membership
    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        userId,
        tenantId,
        deletedAt: null,
        isActive: true,
      },
      include: {
        tenant: true,
      },
    });

    if (!membership) {
      throw new UnauthorizedException('Membership not valid');
    }

    // 🔒 Tenant lifecycle enforcement (pre-Step 16 preview)
    if (membership.tenant.status === 'CLOSED') {
      throw new ForbiddenException('Tenant account closed');
    }

    return {
      userId,
      tenantId,
      role: membership.role,
      membershipId: membership.id,
    };
  }
}