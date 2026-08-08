import { describe, expect, it } from 'vitest'
import { InvalidCredentialsError } from '../../../core/errors/invalid-credentials.error'
import { User, UserType } from '../../enterprise/entities/user'
import { InMemoryEncryptRepository } from '../../../test/cryptograpy/in-memory-encrypt-repository'
import { InMemoryJwtRepository } from '../../../test/jwt/in-memory-jwt-repository'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { LoginUserUseCase } from './login-user.use-case'

describe('LoginUserUseCase', () => {
  it('authenticates the user and creates an access token', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const jwtRepository = new InMemoryJwtRepository()
    const sut = new LoginUserUseCase(usersRepository, new InMemoryEncryptRepository(), jwtRepository)
    const user = User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password-encrypt',
      userType: UserType.RECRUITER,
    }) as User

    await usersRepository.create(user)

    await expect(sut.execute({ email: 'jane@example.com', password: 'password' })).resolves.toEqual({
      accessToken: `token-${user.id.toString()}`,
    })
    expect(jwtRepository.payloads).toEqual([{
      sub: user.id.toString(),
      email: 'jane@example.com',
      userType: 'RECRUITER',
    }])
  })

  it('returns an error and does not sign a token with invalid credentials', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const jwtRepository = new InMemoryJwtRepository()
    const sut = new LoginUserUseCase(usersRepository, new InMemoryEncryptRepository(), jwtRepository)

    await expect(sut.execute({ email: 'missing@example.com', password: 'password' })).resolves.toBeInstanceOf(InvalidCredentialsError)
    expect(jwtRepository.payloads).toHaveLength(0)
  })
})
