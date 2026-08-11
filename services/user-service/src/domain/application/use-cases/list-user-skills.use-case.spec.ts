import { beforeEach, describe, expect, it } from 'vitest'
import { UserIsNotTalentError } from '../../../core/errors/user-is-not-talent.error'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { InMemoryUserSkillsRepository } from '../../../test/repositories/in-memory-user-skills-repository'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { User, UserType } from '../../enterprise/entities/user'
import { ProgrammingSkill, UserSkill } from '../../enterprise/entities/user-skill'
import { ListUserSkillsUseCase } from './list-user-skills.use-case'

let usersRepository: InMemoryUsersRepository
let userSkillsRepository: InMemoryUserSkillsRepository
let sut: ListUserSkillsUseCase

describe('Caso de uso: listar habilidades do usuário', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    userSkillsRepository = new InMemoryUserSkillsRepository()
    sut = new ListUserSkillsUseCase(usersRepository, userSkillsRepository)
  })

  it('lista somente as habilidades do usuário TALENT', async () => {
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

  it('retorna uma lista vazia quando o TALENT não possui habilidades', async () => {
    const talent = User.create({ name: 'Jane Doe', email: 'jane@example.com', password: 'hash', userType: UserType.TALENT }) as User
    await usersRepository.create(talent)

    await expect(sut.execute({ userId: talent.id.toString() })).resolves.toEqual([])
  })

  it('retorna erro quando o usuário não existe ou não é TALENT', async () => {
    const recruiter = User.create({ name: 'John Doe', email: 'john@example.com', password: 'hash', userType: UserType.RECRUITER }) as User
    await usersRepository.create(recruiter)

    await expect(sut.execute({ userId: 'missing-user-id' })).resolves.toBeInstanceOf(UserNotFoundError)
    await expect(sut.execute({ userId: recruiter.id.toString() })).resolves.toBeInstanceOf(UserIsNotTalentError)
  })
})
