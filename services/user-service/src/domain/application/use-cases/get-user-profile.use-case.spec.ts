import { beforeEach, describe, expect, it } from 'vitest'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { User, UserType } from '../../enterprise/entities/user'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { GetUserProfileUseCase } from './get-user-profile.use-case'

let usersRepository: InMemoryUsersRepository
let sut: GetUserProfileUseCase

describe('Caso de uso: obter perfil do usuário', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new GetUserProfileUseCase(usersRepository)
  })

  it('retorna o perfil do usuário sem a senha', async () => {
    const createdAt = new Date('2026-08-08T00:00:00.000Z')
    const user = User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password-encrypt',
      userType: UserType.TALENT,
      createdAt,
    }) as User

    await usersRepository.create(user)

    await expect(sut.execute({ userId: user.id.toString() })).resolves.toEqual({
      id: user.id.toString(),
      name: 'Jane Doe',
      email: 'jane@example.com',
      userType: 'TALENT',
      description: null,
      createdAt,
      updatedAt: null,
    })
  })

  it('retorna erro quando o usuário não existe', async () => {
    await expect(sut.execute({ userId: 'missing-user-id' })).resolves.toBeInstanceOf(UserNotFoundError)
  })
})
