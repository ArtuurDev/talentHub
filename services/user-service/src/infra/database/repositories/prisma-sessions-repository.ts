import { Session as PrismaSession } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { UserSession } from '../../../domain/enterprise/entities/user-session'
import { SessionsRepository } from '../../../domain/application/repositories/sessions-repository'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PrismaSessionsRepository implements SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: UserSession): Promise<void> {
    await this.prisma.session.create({ data: this.toPrisma(session) })
  }

  async update(session: UserSession): Promise<void> {
    await this.prisma.session.update({
      where: { id: session.id.toString() },
      data: this.toPrisma(session),
    })
  }

  async delete(session: UserSession): Promise<void> {
    await this.prisma.session.delete({ where: { id: session.id.toString() } })
  }

  async findById(id: string): Promise<UserSession | null> {
    const session = await this.prisma.session.findUnique({ where: { id } })

    return session ? this.toDomain(session) : null
  }

  async findByRefreshToken(token: string): Promise<UserSession | null> {
    const session = await this.prisma.session.findFirst({ where: { refreshToken: token } })

    return session ? this.toDomain(session) : null
  }

  async findByUserId(userId: string): Promise<UserSession | null> {
    const session = await this.prisma.session.findFirst({ where: { userId } })

    return session ? this.toDomain(session) : null
  }

  private toPrisma(session: UserSession) {
    return {
      id: session.id.toString(),
      userId: session.userId,
      refreshToken: session.refreshToken,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      lastAccessedAt: session.lastAccessedAt,
    }
  }

  private toDomain(session: PrismaSession): UserSession {
    const domainSession = UserSession.create({
      userId: session.userId,
      refreshToken: session.refreshToken,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      lastAccessedAt: session.lastAccessedAt,
    }, new UniqueEntityId(session.id))

    return domainSession
  }
}
