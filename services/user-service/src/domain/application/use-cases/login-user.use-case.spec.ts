import { describe, expect, it } from 'vitest'
import { InvalidCredentialsError } from '../../../core/errors/invalid-credentials.error'
import { User, UserType } from '../../enterprise/entities/user'
import { FakeEncrypter } from '../../../test/cryptography/fake-encrypter'
import { FakeHasher } from '../../../test/cryptography/fake-hasher'
import { InMemorySessionsRepository } from '../../../test/repositories/in-memory-sessions-repository'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { LoginUserUseCase } from './login-user.use-case'

describe('LoginUserUseCase', () => {
  it('authenticates the user and creates an access token', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const encrypter = new FakeEncrypter()
    const sessionsRepository = new InMemorySessionsRepository()
    const hasher = new FakeHasher()
    const sut = new LoginUserUseCase(usersRepository, hasher, encrypter, hasher, sessionsRepository)
    const user = User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password-hashed',
      userType: UserType.RECRUITER,
    }) as User

    await usersRepository.create(user)

    await expect(sut.execute({ email: 'jane@example.com', password: 'password' })).resolves.toMatchObject({
      accessToken: `token-access-${user.id.toString()}`,
      refreshToken: expect.any(String),
    })
    expect(sessionsRepository.items).toHaveLength(1)
    expect(sessionsRepository.items[0].refreshToken).toMatch(/-hashed$/)
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
    ])
  })

  it('returns an error and does not sign a token with invalid credentials', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const encrypter = new FakeEncrypter()
    const hasher = new FakeHasher()
    const sut = new LoginUserUseCase(usersRepository, hasher, encrypter, hasher, new InMemorySessionsRepository())

    await expect(sut.execute({ email: 'missing@example.com', password: 'password' })).resolves.toBeInstanceOf(InvalidCredentialsError)
    expect(encrypter.calls).toHaveLength(0)
  })
})
