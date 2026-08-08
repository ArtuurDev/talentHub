import { describe, expect, it } from 'vitest'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { User, UserType } from '../../enterprise/entities/user'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { GetUserProfileUseCase } from './get-user-profile.use-case'

describe('GetUserProfileUseCase', () => {
  it('returns the user profile without the password', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const sut = new GetUserProfileUseCase(usersRepository)
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
      createdAt,
      updatedAt: null,
    })
  })

  it('returns an error when the user does not exist', async () => {
    const sut = new GetUserProfileUseCase(new InMemoryUsersRepository())

    await expect(sut.execute({ userId: 'missing-user-id' })).resolves.toBeInstanceOf(UserNotFoundError)
  })
})
