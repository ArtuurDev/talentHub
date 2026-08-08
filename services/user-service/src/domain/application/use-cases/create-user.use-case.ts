import { ConflictError } from "../../../core/errors/create-user.error"
import { InvalidEmailError } from "../../../core/errors/invalid-email.error"
import { User, UserType } from "../../enterprise/entities/user"
import { CryptograpyRepository } from "../cryptograpy/cryptograpy-repository"
import { UsersRepository } from "../repositories/users-repository"

export interface CreateUserUseCaseRequest {
  name: string
  email: string
  password: string
  userType: 'TALENT' | 'RECRUITER'
  createdAt?: Date
}

export type CreateUserUseCaseResponseError = ConflictError | InvalidEmailError 
export type CreateUserUseCaseResponseSuccess = {message: string}
 
export class CreateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private cryptograpyRepository: CryptograpyRepository
  ) {}

  async execute({
    email,
    name,
    password,
    userType,
    createdAt
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponseError | CreateUserUseCaseResponseSuccess> {
    const user = await this.usersRepository.findByEmail(email)

    if(user) {
      return new ConflictError('Esse E-mail já existe')
    }

    const passwordHash = await this.cryptograpyRepository.hash(password, 8)
    const userInstance = User.create({
      email,
      name,
      password: passwordHash,
      userType: UserType[userType],
      createdAt,
    })

    if(userInstance instanceof InvalidEmailError) {
      return userInstance
    }

    return {
      message: 'Usuário criado com sucesso'
    }
  }
}