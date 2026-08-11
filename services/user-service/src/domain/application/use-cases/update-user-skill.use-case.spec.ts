import { beforeEach, describe, expect, it } from 'vitest'
import { ConflictError } from '../../../core/errors/create-user.error'
import { UserIsNotTalentError } from '../../../core/errors/user-is-not-talent.error'
import { UserSkillNotFoundError } from '../../../core/errors/user-skill-not-found.error'
import { User, UserType } from '../../enterprise/entities/user'
import { ProgrammingSkill, UserSkill } from '../../enterprise/entities/user-skill'
import { InMemoryUserSkillsRepository } from '../../../test/repositories/in-memory-user-skills-repository'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { UpdateUserSkillUseCase } from './update-user-skill.use-case'

let usersRepository: InMemoryUsersRepository
let userSkillsRepository: InMemoryUserSkillsRepository
let sut: UpdateUserSkillUseCase

describe('Caso de uso: atualizar habilidade do usuário', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    userSkillsRepository = new InMemoryUserSkillsRepository()
    sut = new UpdateUserSkillUseCase(usersRepository, userSkillsRepository)
  })

  it('atualiza uma habilidade pertencente a um usuário do tipo TALENT', async () => {
    const user = User.create({ name: 'Jane Doe', email: 'jane@example.com', password: 'hash', userType: UserType.TALENT }) as User
    const userSkill = UserSkill.create({ userId: user.id.toString(), skill: ProgrammingSkill.JAVASCRIPT })
    await usersRepository.create(user)
    await userSkillsRepository.create(userSkill)

    await expect(sut.execute({ userId: user.id.toString(), userSkillId: userSkill.id.toString(), skill: ProgrammingSkill.TYPESCRIPT })).resolves.toEqual({
      message: 'Habilidade atualizada com sucesso',
    })
    expect(userSkillsRepository.items[0].skill).toBe(ProgrammingSkill.TYPESCRIPT)
    expect(userSkillsRepository.items[0].updatedAt).toBeInstanceOf(Date)
  })

  it('rejeita uma atualização que duplicaria outra habilidade', async () => {
    const user = User.create({ name: 'Jane Doe', email: 'jane@example.com', password: 'hash', userType: UserType.TALENT }) as User
    const firstSkill = UserSkill.create({ userId: user.id.toString(), skill: ProgrammingSkill.JAVASCRIPT })
    const secondSkill = UserSkill.create({ userId: user.id.toString(), skill: ProgrammingSkill.TYPESCRIPT })
    await usersRepository.create(user)
    await userSkillsRepository.create(firstSkill)
    await userSkillsRepository.create(secondSkill)

    await expect(sut.execute({ userId: user.id.toString(), userSkillId: firstSkill.id.toString(), skill: ProgrammingSkill.TYPESCRIPT })).resolves.toBeInstanceOf(ConflictError)
  })

  it('rejeita habilidades que não pertencem ao usuário e recrutadores', async () => {
    const talent = User.create({ name: 'Jane Doe', email: 'jane@example.com', password: 'hash', userType: UserType.TALENT }) as User
    const recruiter = User.create({ name: 'John Doe', email: 'john@example.com', password: 'hash', userType: UserType.RECRUITER }) as User
    const userSkill = UserSkill.create({ userId: talent.id.toString(), skill: ProgrammingSkill.JAVASCRIPT })
    await usersRepository.create(talent)
    await usersRepository.create(recruiter)
    await userSkillsRepository.create(userSkill)

    await expect(sut.execute({ userId: recruiter.id.toString(), userSkillId: userSkill.id.toString(), skill: ProgrammingSkill.TYPESCRIPT })).resolves.toBeInstanceOf(UserIsNotTalentError)
    await expect(sut.execute({ userId: talent.id.toString(), userSkillId: 'missing-skill-id', skill: ProgrammingSkill.TYPESCRIPT })).resolves.toBeInstanceOf(UserSkillNotFoundError)
  })
})
