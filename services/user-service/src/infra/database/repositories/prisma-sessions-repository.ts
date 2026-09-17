import { Injectable } from '@nestjs/common';
import { UserSession } from '../../../domain/enterprise/entities/user-session';
import { SessionsRepository } from '../../../domain/application/repositories/sessions-repository';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaSessionMapper } from './mappers/prisma-session-mapper';

@Injectable()
export class PrismaSessionsRepository implements SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: UserSession): Promise<void> {
    await this.prisma.session.create({
      data: PrismaSessionMapper.toPrisma(session),
    });
  }

  async update(session: UserSession): Promise<void> {
    await this.prisma.session.update({
      where: { id: session.id.toString() },
      data: PrismaSessionMapper.toPrisma(session),
    });
  }

  async delete(session: UserSession): Promise<void> {
    await this.prisma.session.delete({ where: { id: session.id.toString() } });
  }

  async findById(id: string): Promise<UserSession | null> {
    const session = await this.prisma.session.findUnique({ where: { id } });

    return session ? PrismaSessionMapper.toDomain(session) : null;
  }

  async findByRefreshToken(token: string): Promise<UserSession | null> {
    const session = await this.prisma.session.findFirst({
      where: { refreshToken: token },
    });

    return session ? PrismaSessionMapper.toDomain(session) : null;
  }

  async findByUserId(userId: string): Promise<UserSession | null> {
    const session = await this.prisma.session.findFirst({ where: { userId } });

    return session ? PrismaSessionMapper.toDomain(session) : null;
  }

  async revokeManyByUser(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId },
      data: {
        revoked: true,
        lastAccessedAt: new Date(),
      },
    });
  }
}
