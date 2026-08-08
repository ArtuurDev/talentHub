import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { UsersRepository } from '../repositories/users-repository'

export interface DeleteUserUseCaseRequest {
  userId: string
}

export type DeleteUserUseCaseResponse = { message: string } | UserNotFoundError

export class DeleteUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId }: DeleteUserUseCaseRequest): Promise<DeleteUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return new UserNotFoundError()
    }

    await this.usersRepository.delete(user)

    return { message: 'Conta excluída com sucesso' }
  }
}
