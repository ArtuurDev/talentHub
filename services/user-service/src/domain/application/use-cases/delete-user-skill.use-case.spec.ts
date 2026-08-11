import { beforeEach, describe, expect, it } from 'vitest'
import { UserIsNotTalentError } from '../../../core/errors/user-is-not-talent.error'
import { UserSkillNotFoundError } from '../../../core/errors/user-skill-not-found.error'
import { User, UserType } from '../../enterprise/entities/user'
import { ProgrammingSkill, UserSkill } from '../../enterprise/entities/user-skill'
import { InMemoryUserSkillsRepository } from '../../../test/repositories/in-memory-user-skills-repository'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { DeleteUserSkillUseCase } from './delete-user-skill.use-case'

let usersRepository: InMemoryUsersRepository
let userSkillsRepository: InMemoryUserSkillsRepository
let sut: DeleteUserSkillUseCase

describe('Caso de uso: excluir habilidade do usuário', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    userSkillsRepository = new InMemoryUserSkillsRepository()
    sut = new DeleteUserSkillUseCase(usersRepository, userSkillsRepository)
  })

  it('exclui uma habilidade pertencente a um usuário do tipo TALENT', async () => {
    const user = User.create({ name: 'Jane Doe', email: 'jane@example.com', password: 'hash', userType: UserType.TALENT }) as User
    const userSkill = UserSkill.create({ userId: user.id.toString(), skill: ProgrammingSkill.TYPESCRIPT })
    await usersRepository.create(user)
    await userSkillsRepository.create(userSkill)

    await expect(sut.execute({ userId: user.id.toString(), userSkillId: userSkill.id.toString() })).resolves.toEqual({
      message: 'Habilidade excluída com sucesso',
    })
    expect(userSkillsRepository.items).toHaveLength(0)
  })

  it('não exclui a habilidade de outro usuário', async () => {
    const owner = User.create({ name: 'Jane Doe', email: 'jane@example.com', password: 'hash', userType: UserType.TALENT }) as User
    const otherTalent = User.create({ name: 'John Doe', email: 'john@example.com', password: 'hash', userType: UserType.TALENT }) as User
    const userSkill = UserSkill.create({ userId: owner.id.toString(), skill: ProgrammingSkill.TYPESCRIPT })
    await usersRepository.create(owner)
    await usersRepository.create(otherTalent)
    await userSkillsRepository.create(userSkill)

    await expect(sut.execute({ userId: otherTalent.id.toString(), userSkillId: userSkill.id.toString() })).resolves.toBeInstanceOf(UserSkillNotFoundError)
    expect(userSkillsRepository.items).toHaveLength(1)
  })

  it('rejeita recrutadores', async () => {
    const recruiter = User.create({ name: 'John Doe', email: 'john@example.com', password: 'hash', userType: UserType.RECRUITER }) as User
    await usersRepository.create(recruiter)

    await expect(sut.execute({ userId: recruiter.id.toString(), userSkillId: 'missing-skill-id' })).resolves.toBeInstanceOf(UserIsNotTalentError)
  })
})
