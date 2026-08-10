import { Inject, Injectable } from '@nestjs/common'
import { UserIsNotTalentError } from '../../../core/errors/user-is-not-talent.error'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { UserSkillNotFoundError } from '../../../core/errors/user-skill-not-found.error'
import { UserType } from '../../enterprise/entities/user'
import { UserSkillsRepository } from '../repositories/user-skills-repository'
import { UsersRepository } from '../repositories/users-repository'

export interface DeleteUserSkillUseCaseRequest {
  userId: string
  userSkillId: string
}

export type DeleteUserSkillUseCaseResponse =
  | { message: string }
  | UserNotFoundError
  | UserIsNotTalentError
  | UserSkillNotFoundError

@Injectable()
export class DeleteUserSkillUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userSkillsRepository: UserSkillsRepository,
  ) {}

  async execute({ userId, userSkillId }: DeleteUserSkillUseCaseRequest): Promise<DeleteUserSkillUseCaseResponse> {
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

    await this.userSkillsRepository.delete(userSkill)

    return { message: 'Habilidade excluída com sucesso' }
  }
}
