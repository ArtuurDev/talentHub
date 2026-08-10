import { ProgrammingSkill as PrismaProgrammingSkill, UserSkill as PrismaUserSkill } from '@prisma/client'
import { UniqueEntityId } from '../../../../core/entities/unique-entity-id'
import { ProgrammingSkill, UserSkill } from '../../../../domain/enterprise/entities/user-skill'

export class PrismaUserSkillMapper {
  static toPrisma(userSkill: UserSkill) {
    return {
      id: userSkill.id.toString(),
      userId: userSkill.userId,
      skill: userSkill.skill as PrismaProgrammingSkill,
      createdAt: userSkill.createdAt,
      updatedAt: userSkill.updatedAt,
    }
  }

  static toDomain(userSkill: PrismaUserSkill): UserSkill {
    return UserSkill.create(
      {
        userId: userSkill.userId,
        skill: userSkill.skill as ProgrammingSkill,
        createdAt: userSkill.createdAt,
        updatedAt: userSkill.updatedAt,
      },
      new UniqueEntityId(userSkill.id),
    )
  }
}
