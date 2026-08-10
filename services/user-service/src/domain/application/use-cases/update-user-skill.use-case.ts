import { Inject, Injectable } from '@nestjs/common'
import { ConflictError } from '../../../core/errors/create-user.error'
import { UserIsNotTalentError } from '../../../core/errors/user-is-not-talent.error'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { UserSkillNotFoundError } from '../../../core/errors/user-skill-not-found.error'
import { UserType } from '../../enterprise/entities/user'
import { ProgrammingSkill } from '../../enterprise/entities/user-skill'
import { UserSkillsRepository } from '../repositories/user-skills-repository'
import { UsersRepository } from '../repositories/users-repository'

export interface UpdateUserSkillUseCaseRequest {
  userId: string
  userSkillId: string
  skill: ProgrammingSkill
}

export type UpdateUserSkillUseCaseResponse =
  | { message: string }
  | UserNotFoundError
  | UserIsNotTalentError
  | UserSkillNotFoundError
  | ConflictError

@Injectable()
export class UpdateUserSkillUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userSkillsRepository: UserSkillsRepository,
  ) {}

  async execute({ userId, userSkillId, skill }: UpdateUserSkillUseCaseRequest): Promise<UpdateUserSkillUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return new UserNotFoundError()
    }

    if (user.userType !== UserType.TALENT) {
      return new UserIsNotTalentError()
    }

    const userSkill = await this.userSkillsRepository.findById(userSkillId)

    if (!userSkill || userSkill.userId !== userId) {
      return new UserSkillNotFoundError()
    }

    const existingUserSkill = await this.userSkillsRepository.findByUserIdAndSkill(userId, skill)

    if (existingUserSkill && !existingUserSkill.id.equals(userSkill.id)) {
      return new ConflictError('Esta habilidade já foi adicionada ao usuário')
    }

    userSkill.updateSkill(skill)
    await this.userSkillsRepository.update(userSkill)

    return { message: 'Habilidade atualizada com sucesso' }
  }
}
