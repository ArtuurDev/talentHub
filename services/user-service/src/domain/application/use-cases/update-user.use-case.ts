import { Inject, Injectable } from '@nestjs/common'
import { ConflictError } from '../../../core/errors/create-user.error'
import { InvalidEmailError } from '../../../core/errors/invalid-email.error'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { HashGenerator } from '../../../cryptography/hash-generator'
import { User, UserType } from '../../enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'

export interface UpdateUserUseCaseRequest {
  userId: string
  name?: string
  email?: string
  password?: string
  userType?: 'TALENT' | 'RECRUITER'
  description?: string | null
}

export type UpdateUserUseCaseResponse =
  | { message: string }
  | ConflictError
  | InvalidEmailError
  | UserNotFoundError

@Injectable()
export class UpdateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({ userId, name, email, password, userType, description }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return new UserNotFoundError()
    }

    const passwordHash = password
      ? await this.hashGenerator.hash(password)
      : user.password
    const userInstance = User.create({
      name: name ?? user.name,
      email: email ?? user.email,
      password: passwordHash,
      userType: userType ? UserType[userType] : user.userType,
      description: description === undefined ? user.description : description,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    }, user.id)

    if (userInstance instanceof InvalidEmailError) {
      return userInstance
    }

    if (userInstance.email !== user.email) {
      const userWithSameEmail = await this.usersRepository.findByEmail(userInstance.email)

      if (userWithSameEmail && !userWithSameEmail.id.equals(user.id)) {
        return new ConflictError('Esse E-mail já existe')
      }
    }

    await this.usersRepository.update(userInstance)

    return { message: 'Usuário atualizado com sucesso' }
  }
}
