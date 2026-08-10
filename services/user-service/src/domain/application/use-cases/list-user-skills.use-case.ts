import { Inject, Injectable } from '@nestjs/common'
import { UserIsNotTalentError } from '../../../core/errors/user-is-not-talent.error'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { UserType } from '../../enterprise/entities/user'
import { ProgrammingSkill } from '../../enterprise/entities/user-skill'
import { UserSkillsRepository } from '../repositories/user-skills-repository'
import { UsersRepository } from '../repositories/users-repository'

export interface ListUserSkillsUseCaseRequest {
  userId: string
}

export interface UserSkillOutput {
  id: string
  skill: ProgrammingSkill
  createdAt: Date
  updatedAt: Date | null | undefined
}

export type ListUserSkillsUseCaseResponse = UserSkillOutput[] | UserNotFoundError | UserIsNotTalentError

@Injectable()
export class ListUserSkillsUseCase {
  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
    @Inject(UserSkillsRepository)
    private readonly userSkillsRepository: UserSkillsRepository,
  ) {}

  async execute({ userId }: ListUserSkillsUseCaseRequest): Promise<ListUserSkillsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return new UserNotFoundError()
    }

    if (user.userType !== UserType.TALENT) {
      return new UserIsNotTalentError()
    }

    const userSkills = await this.userSkillsRepository.findManyByUserId(userId)

    return userSkills.map((userSkill) => ({
      id: userSkill.id.toString(),
      skill: userSkill.skill,
      createdAt: userSkill.createdAt,
      updatedAt: userSkill.updatedAt,
    }))
  }
}
