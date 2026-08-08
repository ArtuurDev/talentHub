import { describe, expect, it } from 'vitest'
import { ConflictError } from '../../../core/errors/create-user.error'
import { InvalidEmailError } from '../../../core/errors/invalid-email.error'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { User, UserType } from '../../enterprise/entities/user'
import { InMemoryEncryptRepository } from '../../../test/cryptograpy/in-memory-encrypt-repository'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { UpdateUserUseCase } from './update-user.use-case'

describe('UpdateUserUseCase', () => {
  it('updates the supplied user fields and encrypts a new password', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const sut = new UpdateUserUseCase(usersRepository, new InMemoryEncryptRepository())
    const user = User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'old-password-encrypt',
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
      password: 'new-password-encrypt',
      userType: UserType.RECRUITER,
    })
    expect(usersRepository.items[0].updatedAt).toBeInstanceOf(Date)
  })

  it('does not update to an e-mail that belongs to another user', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const sut = new UpdateUserUseCase(usersRepository, new InMemoryEncryptRepository())
    const user = User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password-encrypt',
      userType: UserType.TALENT,
    }) as User
    const otherUser = User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password-encrypt',
      userType: UserType.TALENT,
    }) as User

    await usersRepository.create(user)
    await usersRepository.create(otherUser)

    await expect(sut.execute({ userId: user.id.toString(), email: otherUser.email })).resolves.toBeInstanceOf(ConflictError)
    expect(usersRepository.items[0].email).toBe('jane@example.com')
  })

  it('returns an invalid e-mail error without updating the user', async () => {
    const usersRepository = new InMemoryUsersRepository()
    const sut = new UpdateUserUseCase(usersRepository, new InMemoryEncryptRepository())
    const user = User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password-encrypt',
      userType: UserType.TALENT,
    }) as User

    await usersRepository.create(user)

    await expect(sut.execute({ userId: user.id.toString(), email: 'invalid-email' })).resolves.toBeInstanceOf(InvalidEmailError)
    expect(usersRepository.items[0].email).toBe('jane@example.com')
  })

  it('returns an error when the user does not exist', async () => {
    const sut = new UpdateUserUseCase(new InMemoryUsersRepository(), new InMemoryEncryptRepository())

    await expect(sut.execute({ userId: 'missing-user-id', name: 'Jane Doe' })).resolves.toBeInstanceOf(UserNotFoundError)
  })
})
