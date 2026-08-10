import { describe, expect, it } from 'vitest'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { User, UserType } from '../../enterprise/entities/user'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { DeleteUserUseCase } from './delete-user.use-case'

describe('DeleteUserUseCase', () => {
  it('deletes an existing user account', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const sut = new DeleteUserUseCase(usersRepository)
    const user = User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password-encrypt',
      userType: UserType.TALENT,
    }) as User

    await usersRepository.create(user)

    await expect(sut.execute({ userId: user.id.toString() })).resolves.toEqual({
      message: 'Conta excluída com sucesso',
    })
    expect(usersRepository.items).toHaveLength(0)
  })

  it('returns an error when the account does not exist', async () => {
    const sut = new DeleteUserUseCase(new InMemoryUsersRepository())

    await expect(sut.execute({ userId: 'missing-user-id' })).resolves.toBeInstanceOf(UserNotFoundError)
  })
})
