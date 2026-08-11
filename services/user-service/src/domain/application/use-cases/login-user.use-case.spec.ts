import { beforeEach, describe, expect, it } from 'vitest'
import { InvalidCredentialsError } from '../../../core/errors/invalid-credentials.error'
import { User, UserType } from '../../enterprise/entities/user'
import { FakeEncrypter } from '../../../test/cryptography/fake-encrypter'
import { FakeHasher } from '../../../test/cryptography/fake-hasher'
import { InMemorySessionsRepository } from '../../../test/repositories/in-memory-sessions-repository'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { LoginUserUseCase } from './login-user.use-case'

let usersRepository: InMemoryUsersRepository
let sessionsRepository: InMemorySessionsRepository
let encrypter: FakeEncrypter
let sut: LoginUserUseCase

describe('Caso de uso: autenticar usuário', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sessionsRepository = new InMemorySessionsRepository()
    const hasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new LoginUserUseCase(usersRepository, hasher, encrypter, hasher, sessionsRepository)
  })

  it('autentica o usuário e cria um token de acesso', async () => {
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
          roles: ['RECRUITER'],
          sessionId: expect.any(String),
          tokenType: 'access',
        },
        options: { expiresIn: '15m' },
      },
    ])
  })

  it('retorna erro e não assina token com credenciais inválidas', async () => {
    await expect(sut.execute({ email: 'missing@example.com', password: 'password' })).resolves.toBeInstanceOf(InvalidCredentialsError)
    expect(encrypter.calls).toHaveLength(0)
  })
})
