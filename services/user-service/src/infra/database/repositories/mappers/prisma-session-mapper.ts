import { Session as PrismaSession } from '@prisma/client';
import { UniqueEntityId } from '../../../../core/entities/unique-entity-id';
import { UserSession } from '../../../../domain/enterprise/entities/user-session';

export class PrismaSessionMapper {
  static toPrisma(session: UserSession) {
    return {
      id: session.id.toString(),
      userId: session.userId,
      refreshToken: session.refreshToken,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      lastAccessedAt: session.lastAccessedAt,
      revoked: session.revoked,
    };
  }

  static toDomain(session: PrismaSession): UserSession {
    return UserSession.create(
      {
        userId: session.userId,
        refreshToken: session.refreshToken,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        lastAccessedAt: session.lastAccessedAt,
        revoked: session.revoked,
      },
      new UniqueEntityId(session.id),
    );
  }
}
