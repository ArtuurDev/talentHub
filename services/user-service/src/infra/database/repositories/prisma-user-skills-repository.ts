import { Injectable } from '@nestjs/common'
import { ProgrammingSkill, UserSkill } from '../../../domain/enterprise/entities/user-skill'
import { UserSkillsRepository } from '../../../domain/application/repositories/user-skills-repository'
import { PrismaService } from '../prisma/prisma.service'
import { PrismaUserSkillMapper } from './mappers/prisma-user-skill-mapper'

@Injectable()
export class PrismaUserSkillsRepository implements UserSkillsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userSkill: UserSkill): Promise<void> {
    await this.prisma.userSkill.create({ data: PrismaUserSkillMapper.toPrisma(userSkill) })
  }

  async update(userSkill: UserSkill): Promise<void> {
    await this.prisma.userSkill.update({
      where: { id: userSkill.id.toString() },
      data: PrismaUserSkillMapper.toPrisma(userSkill),
    })
  }

  async delete(userSkill: UserSkill): Promise<void> {
    await this.prisma.userSkill.delete({ where: { id: userSkill.id.toString() } })
  }

  async findById(id: string): Promise<UserSkill | null> {
    const userSkill = await this.prisma.userSkill.findUnique({ where: { id } })

    return userSkill ? PrismaUserSkillMapper.toDomain(userSkill) : null
  }

  async findManyByUserId(userId: string): Promise<UserSkill[]> {
    const userSkills = await this.prisma.userSkill.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    })

    return userSkills.map(PrismaUserSkillMapper.toDomain)
  }

  async findByUserIdAndSkill(userId: string, skill: ProgrammingSkill): Promise<UserSkill | null> {
    const userSkill = await this.prisma.userSkill.findUnique({
      where: { userId_skill: { userId, skill } },
    })

    return userSkill ? PrismaUserSkillMapper.toDomain(userSkill) : null
  }
}
