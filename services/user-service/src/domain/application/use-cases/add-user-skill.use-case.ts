import { Inject, Injectable } from '@nestjs/common'
import { ConflictError } from '../../../core/errors/create-user.error'
import { UserIsNotTalentError } from '../../../core/errors/user-is-not-talent.error'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { UserSkill, ProgrammingSkill } from '../../enterprise/entities/user-skill'
import { UserType } from '../../enterprise/entities/user'
import { UserSkillsRepository } from '../repositories/user-skills-repository'
import { UsersRepository } from '../repositories/users-repository'

export interface AddUserSkillUseCaseRequest {
  userId: string
  skill: ProgrammingSkill
}

export type AddUserSkillUseCaseResponse =
  | { message: string; id: string }
  | UserNotFoundError
  | UserIsNotTalentError
  | ConflictError

@Injectable()
export class AddUserSkillUseCase {
  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: UsersRepository,
    @Inject(UserSkillsRepository)
    private readonly userSkillsRepository: UserSkillsRepository,
  ) {}

  async execute({ userId, skill }: AddUserSkillUseCaseRequest): Promise<AddUserSkillUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return new UserNotFoundError()
    }

    if (user.userType !== UserType.TALENT) {
      return new UserIsNotTalentError()
    }

    const existingUserSkill = await this.userSkillsRepository.findByUserIdAndSkill(userId, skill)

    if (existingUserSkill) {
      return new ConflictError('Esta habilidade já foi adicionada ao usuário')
    }

    const userSkill = UserSkill.create({ userId, skill })
    await this.userSkillsRepository.create(userSkill)

    return { message: 'Habilidade adicionada com sucesso', id: userSkill.id.toString() }
  }
}
