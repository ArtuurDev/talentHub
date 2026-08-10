import { User as PrismaUser, UserType as PrismaUserType } from '@prisma/client'
import { UniqueEntityId } from '../../../../core/entities/unique-entity-id'
import { User, UserType } from '../../../../domain/enterprise/entities/user'

export class PrismaUserMapper {
  static toPrisma(user: User) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      password: user.password,
      userType: UserType[user.userType] as PrismaUserType,
      description: user.description,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  static toDomain(user: PrismaUser): User {
    const domainUser = User.create(
      {
        name: user.name,
        email: user.email,
        password: user.password,
        userType: UserType[user.userType],
        description: user.description,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      new UniqueEntityId(user.id),
    )

    if (!(domainUser instanceof User)) {
      throw new Error('Usuário persistido possui e-mail inválido')
    }

    return domainUser
  }
}
