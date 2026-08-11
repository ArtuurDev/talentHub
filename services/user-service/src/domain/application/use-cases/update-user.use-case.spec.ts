import { beforeEach, describe, expect, it } from 'vitest'
import { ConflictError } from '../../../core/errors/create-user.error'
import { InvalidEmailError } from '../../../core/errors/invalid-email.error'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { User, UserType } from '../../enterprise/entities/user'
import { FakeHasher } from '../../../test/cryptography/fake-hasher'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { UpdateUserUseCase } from './update-user.use-case'

let usersRepository: InMemoryUsersRepository
let sut: UpdateUserUseCase

describe('Caso de uso: atualizar usuário', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new UpdateUserUseCase(usersRepository, new FakeHasher())
  })

  it('atualiza os campos informados e criptografa a nova senha', async () => {
    const user = User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'old-password-hashed',
      userType: UserType.TALENT,
    }) as User

    await usersRepository.create(user)

    await expect(sut.execute({
      userId: user.id.toString(),
      name: 'Jane Smith',
      password: 'new-password',
      userType: 'RECRUITER',
    })).resolves.toEqual({ message: 'Usuário atualizado com sucesso' })

    expect(usersRepository.items[0]).toMatchObject({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'new-password-hashed',
      userType: UserType.RECRUITER,
    })
    expect(usersRepository.items[0].updatedAt).toBeInstanceOf(Date)
  })

  it('não atualiza para um e-mail que pertence a outro usuário', async () => {
    const user = User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password-hashed',
      userType: UserType.TALENT,
    }) as User
    const otherUser = User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password-hashed',
      userType: UserType.TALENT,
    }) as User

    await usersRepository.create(user)
    await usersRepository.create(otherUser)

    await expect(sut.execute({ userId: user.id.toString(), email: otherUser.email })).resolves.toBeInstanceOf(ConflictError)
    expect(usersRepository.items[0].email).toBe('jane@example.com')
  })

  it('retorna erro de e-mail inválido sem atualizar o usuário', async () => {
    const user = User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password-hashed',
      userType: UserType.TALENT,
    }) as User

    await usersRepository.create(user)

    await expect(sut.execute({ userId: user.id.toString(), email: 'invalid-email' })).resolves.toBeInstanceOf(InvalidEmailError)
    expect(usersRepository.items[0].email).toBe('jane@example.com')
  })

  it('retorna erro quando o usuário não existe', async () => {
    await expect(sut.execute({ userId: 'missing-user-id', name: 'Jane Doe' })).resolves.toBeInstanceOf(UserNotFoundError)
  })
})
