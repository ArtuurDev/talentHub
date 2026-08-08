import { ConflictError } from '../../../core/errors/create-user.error'
import { InvalidEmailError } from '../../../core/errors/invalid-email.error'
import { UserNotFoundError } from '../../../core/errors/user-not-found.error'
import { User, UserType } from '../../enterprise/entities/user'
import { CryptograpyRepository } from '../cryptograpy/cryptograpy-repository'
import { UsersRepository } from '../repositories/users-repository'

export interface UpdateUserUseCaseRequest {
  userId: string
  name?: string
  email?: string
  password?: string
  userType?: 'TALENT' | 'RECRUITER'
}

export type UpdateUserUseCaseResponse =
  | { message: string }
  | ConflictError
  | InvalidEmailError
  | UserNotFoundError

export class UpdateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private cryptograpyRepository: CryptograpyRepository,
  ) {}

  async execute({ userId, name, email, password, userType }: UpdateUserUseCaseRequest): Promise<UpdateUserUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return new UserNotFoundError()
    }

    const passwordHash = password
      ? await this.cryptograpyRepository.hash(password, 8)
      : user.password
    const userInstance = User.create({
      name: name ?? user.name,
      email: email ?? user.email,
      password: passwordHash,
      userType: userType ? UserType[userType] : user.userType,
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
