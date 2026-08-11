import { beforeEach, describe, expect, it } from 'vitest'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { User, UserType } from '../../enterprise/entities/user'
import { InMemoryUsersRepository } from '../../../test/repositories/in-memory-users-repository'
import { DeleteUserUseCase } from './delete-user.use-case'

let usersRepository: InMemoryUsersRepository
let sut: DeleteUserUseCase

describe('Caso de uso: excluir usuário', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new DeleteUserUseCase(usersRepository)
  })

  it('exclui uma conta de usuário existente', async () => {
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

  it('retorna erro quando a conta não existe', async () => {
    await expect(sut.execute({ userId: 'missing-user-id' })).resolves.toBeInstanceOf(UserNotFoundError)
  })
})
