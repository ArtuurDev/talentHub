import { User as PrismaUser, UserType as PrismaUserType } from '@prisma/client'
import { Injectable } from '@nestjs/common'
import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { User, UserType } from '../../../domain/enterprise/entities/user'
import { UserRepository } from '../../../domain/application/repositories/users-repository'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class PrismaUsersRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<void> {
    await this.prisma.user.create({ data: this.toPrisma(user) })
  }

  async update(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id.toString() },
      data: this.toPrisma(user),
    })
  }

  async delete(user: User): Promise<void> {
    await this.prisma.user.delete({ where: { id: user.id.toString() } })
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } })

    return user ? this.toDomain(user) : null
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } })

    return user ? this.toDomain(user) : null
  }

  private toPrisma(user: User) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      userType: UserType[user.userType] as PrismaUserType,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  private toDomain(user: PrismaUser): User {
    const domainUser = User.create({
      name: user.name,
      email: user.email,
      password: user.password,
      userType: UserType[user.userType],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }, new UniqueEntityId(user.id))

    if (!(domainUser instanceof User)) {
      throw new Error('Usuário persistido possui e-mail inválido')
    }

    return domainUser
  }
}
