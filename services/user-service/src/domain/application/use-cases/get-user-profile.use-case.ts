import { Inject, Injectable } from '@nestjs/common'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { UserType } from '../../enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'

export interface GetUserProfileUseCaseRequest {
  userId: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  userType: string
  description?: string | null
  createdAt: Date
  updatedAt?: Date | null
}

@Injectable()
export class GetUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId }: GetUserProfileUseCaseRequest): Promise<UserProfile | UserNotFoundError> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return new UserNotFoundError()
    }

    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      userType: UserType[user.userType],
      description: user.description,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
