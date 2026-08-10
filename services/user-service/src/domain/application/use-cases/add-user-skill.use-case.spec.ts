import { describe, expect, it } from 'vitest'
import { ConflictError } from '../../../core/errors/create-user.error'
import { UserIsNotTalentError } from '../../../core/errors/user-is-not-talent.error'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { User, UserType } from '../../enterprise/entities/user'
import { ProgrammingSkill } from '../../enterprise/entities/user-skill'
import { InMemoryUserSkillsRepository } from '../../../test/repositories/in-memory-user-skills-repository'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { AddUserSkillUseCase } from './add-user-skill.use-case'

describe('Caso de uso: adicionar habilidade ao usuário', () => {
  it('adiciona uma habilidade a um usuário do tipo TALENT', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const userSkillsRepository = new InMemoryUserSkillsRepository()
    const sut = new AddUserSkillUseCase(usersRepository, userSkillsRepository)
    const user = User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password-hashed',
      userType: UserType.TALENT,
    }) as User
    await usersRepository.create(user)

    await expect(sut.execute({ userId: user.id.toString(), skill: ProgrammingSkill.TYPESCRIPT })).resolves.toMatchObject({
      message: 'Habilidade adicionada com sucesso',
    })
    expect(userSkillsRepository.items).toHaveLength(1)
    expect(userSkillsRepository.items[0].skill).toBe(ProgrammingSkill.TYPESCRIPT)
  })

  it('não adiciona uma habilidade duplicada', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const userSkillsRepository = new InMemoryUserSkillsRepository()
    const sut = new AddUserSkillUseCase(usersRepository, userSkillsRepository)
    const user = User.create({ name: 'Jane Doe', email: 'jane@example.com', password: 'hash', userType: UserType.TALENT }) as User
    await usersRepository.create(user)
    await sut.execute({ userId: user.id.toString(), skill: ProgrammingSkill.TYPESCRIPT })

    await expect(sut.execute({ userId: user.id.toString(), skill: ProgrammingSkill.TYPESCRIPT })).resolves.toBeInstanceOf(ConflictError)
  })

  it('rejeita um recrutador e um usuário inexistente', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const sut = new AddUserSkillUseCase(usersRepository, new InMemoryUserSkillsRepository())
    const recruiter = User.create({ name: 'John Doe', email: 'john@example.com', password: 'hash', userType: UserType.RECRUITER }) as User
    await usersRepository.create(recruiter)

    await expect(sut.execute({ userId: recruiter.id.toString(), skill: ProgrammingSkill.JAVA })).resolves.toBeInstanceOf(UserIsNotTalentError)
    await expect(sut.execute({ userId: 'missing-user-id', skill: ProgrammingSkill.JAVA })).resolves.toBeInstanceOf(UserNotFoundError)
  })
})
