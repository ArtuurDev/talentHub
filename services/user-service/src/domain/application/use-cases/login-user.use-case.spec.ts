import { describe, expect, it } from 'vitest'
import { InvalidCredentialsError } from '../../../core/errors/invalid-credentials.error'
import { User, UserType } from '../../enterprise/entities/user'
import { FakeEncrypter } from '../../../test/cryptography/fake-encrypter'
import { FakeHasher } from '../../../test/cryptography/fake-hasher'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { LoginUserUseCase } from './login-user.use-case'

describe('LoginUserUseCase', () => {
  it('authenticates the user and creates an access token', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const encrypter = new FakeEncrypter()
    const sut = new LoginUserUseCase(usersRepository, new FakeHasher(), encrypter)
    const user = User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password-hashed',
      userType: UserType.RECRUITER,
    }) as User

    await usersRepository.create(user)

    await expect(sut.execute({ email: 'jane@example.com', password: 'password' })).resolves.toEqual({
      accessToken: `token-access-${user.id.toString()}`,
      refreshToken: `token-refresh-${user.id.toString()}`,
    })
    expect(encrypter.calls).toEqual([
      {
        payload: {
          sub: user.id.toString(),
          email: 'jane@example.com',
          userType: 'RECRUITER',
          tokenType: 'access',
        },
        options: { expiresIn: '15m' },
      },
      {
        payload: {
          sub: user.id.toString(),
          email: 'jane@example.com',
          userType: 'RECRUITER',
          tokenType: 'refresh',
        },
        options: { expiresIn: '7d' },
      },
    ])
  })

  it('returns an error and does not sign a token with invalid credentials', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const encrypter = new FakeEncrypter()
    const sut = new LoginUserUseCase(usersRepository, new FakeHasher(), encrypter)

    await expect(sut.execute({ email: 'missing@example.com', password: 'password' })).resolves.toBeInstanceOf(InvalidCredentialsError)
    expect(encrypter.calls).toHaveLength(0)
  })
})
