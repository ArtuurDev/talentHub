import { beforeEach, describe, expect, it } from 'vitest'
import { ConflictError } from '../../../core/errors/create-user.error'
import { InvalidEmailError } from '../../../core/errors/invalid-email.error'
import { FakeHasher } from '../../../test/cryptography/fake-hasher'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { CreateUserUseCase } from './create-user.use-case'

describe('CreateUserUseCase', () => {
  let usersRepository: InMemoryUsersRepository
  let hashGenerator: FakeHasher
  let sut: CreateUserUseCase

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    hashGenerator = new FakeHasher()
    sut = new CreateUserUseCase(usersRepository, hashGenerator)
  })

  it('Deve ser possivel criar um usuário', async () => {
    const result = await sut.execute({
      name: 'user',
      email: 'user@example.com',
      password: 'password',
      userType: 'TALENT',
    })

    expect(result).toEqual({ message: 'Usuário criado com sucesso' })
    expect(usersRepository.items).toHaveLength(1)
    expect(usersRepository.items[0]).toMatchObject({
      name: 'user',
      email: 'user@example.com',
      password: 'password-hashed',
    })
  })

  it('Não deve ser possivel cadastrar usuário se E-mail for duplicado', async () => {
    await sut.execute({
      name: 'user',
      email: 'user@example.com',
      password: 'password',
      userType: 'TALENT',
    })

    const result = await sut.execute({
      name: 'user2',
      email: 'user@example.com',
      password: 'password',
      userType: 'RECRUITER',
    })

    expect(result).toBeInstanceOf(ConflictError)
    expect(usersRepository.items).toHaveLength(1)
  })

  it('Deve retornar InvalidEmailError ao criar usuário com email inválido', async () => {
    const result = await sut.execute({
      name: 'user',
      email: 'invalid-email',
      password: 'password',
      userType: 'TALENT',
    })

    expect(result).toBeInstanceOf(InvalidEmailError)
    expect(usersRepository.items).toHaveLength(0)
  })
})
