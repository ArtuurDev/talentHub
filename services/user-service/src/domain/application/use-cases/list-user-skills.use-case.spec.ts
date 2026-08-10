import { describe, expect, it } from 'vitest'
import { UserIsNotTalentError } from '../../../core/errors/user-is-not-talent.error'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { InMemoryUserSkillsRepository } from '../../../test/repositories/in-memory-user-skills-repository'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { User, UserType } from '../../enterprise/entities/user'
import { ProgrammingSkill, UserSkill } from '../../enterprise/entities/user-skill'
import { ListUserSkillsUseCase } from './list-user-skills.use-case'

describe('Caso de uso: listar habilidades do usu\u00e1rio', () => {
  it('lista somente as habilidades do usu\u00e1rio TALENT', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const userSkillsRepository = new InMemoryUserSkillsRepository()
    const sut = new ListUserSkillsUseCase(usersRepository, userSkillsRepository)
    const talent = User.create({ name: 'Jane Doe', email: 'jane@example.com', password: 'hash', userType: UserType.TALENT }) as User
    const otherTalent = User.create({ name: 'John Doe', email: 'john@example.com', password: 'hash', userType: UserType.TALENT }) as User
    const javascript = UserSkill.create({ userId: talent.id.toString(), skill: ProgrammingSkill.JAVASCRIPT })
    const typescript = UserSkill.create({ userId: talent.id.toString(), skill: ProgrammingSkill.TYPESCRIPT })

    await usersRepository.create(talent)
    await usersRepository.create(otherTalent)
    await userSkillsRepository.create(javascript)
    await userSkillsRepository.create(typescript)
    await userSkillsRepository.create(UserSkill.create({ userId: otherTalent.id.toString(), skill: ProgrammingSkill.PYTHON }))

    await expect(sut.execute({ userId: talent.id.toString() })).resolves.toEqual([
      { id: javascript.id.toString(), skill: ProgrammingSkill.JAVASCRIPT, createdAt: javascript.createdAt, updatedAt: null },
      { id: typescript.id.toString(), skill: ProgrammingSkill.TYPESCRIPT, createdAt: typescript.createdAt, updatedAt: null },
    ])
  })

  it('retorna uma lista vazia quando o TALENT n\u00e3o possui habilidades', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const talent = User.create({ name: 'Jane Doe', email: 'jane@example.com', password: 'hash', userType: UserType.TALENT }) as User
    await usersRepository.create(talent)

    await expect(new ListUserSkillsUseCase(usersRepository, new InMemoryUserSkillsRepository()).execute({ userId: talent.id.toString() })).resolves.toEqual([])
  })

  it('retorna erro quando o usu\u00e1rio n\u00e3o existe ou n\u00e3o \u00e9 TALENT', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const sut = new ListUserSkillsUseCase(usersRepository, new InMemoryUserSkillsRepository())
    const recruiter = User.create({ name: 'John Doe', email: 'john@example.com', password: 'hash', userType: UserType.RECRUITER }) as User
    await usersRepository.create(recruiter)

    await expect(sut.execute({ userId: 'missing-user-id' })).resolves.toBeInstanceOf(UserNotFoundError)
    await expect(sut.execute({ userId: recruiter.id.toString() })).resolves.toBeInstanceOf(UserIsNotTalentError)
  })
})
