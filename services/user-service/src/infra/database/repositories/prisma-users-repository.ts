import { Injectable } from '@nestjs/common'
import { User } from '../../../domain/enterprise/entities/user'
import { UserRepository } from '../../../domain/application/repositories/users-repository'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaUserMapper } from './mappers/prisma-user-mapper'

@Injectable()
export class PrismaUsersRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<void> {
    await this.prisma.user.create({ data: PrismaUserMapper.toPrisma(user) })
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id.toString() },
      data: PrismaUserMapper.toPrisma(user),
    })
  }

  async delete(user: User): Promise<void> {
    await this.prisma.user.delete({ where: { id: user.id.toString() } })
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    return user ? PrismaUserMapper.toDomain(user) : null
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } })

    return user ? PrismaUserMapper.toDomain(user) : null
  }

}
