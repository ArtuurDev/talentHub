import { Inject, Injectable } from '@nestjs/common'
import { ConflictError } from "../../../core/errors/create-user.error"
import { InvalidEmailError } from "../../../core/errors/invalid-email.error"
import { HashGenerator } from '../../../cryptography/hash-generator'
import { User, UserType } from "../../enterprise/entities/user"
import { UsersRepository } from "../repositories/users-repository"

export interface CreateUserUseCaseRequest {
  name: string
  email: string
  password: string
  userType: 'TALENT' | 'RECRUITER'
  description?: string
  createdAt?: Date
}

export type CreateUserUseCaseResponseError = ConflictError | InvalidEmailError 
export type CreateUserUseCaseResponseSuccess = {message: string}
 
@Injectable()
export class CreateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashGenerator: HashGenerator
  ) {}

  async execute({
    email,
    name,
    password,
    userType,
    description,
    createdAt
  }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponseError | CreateUserUseCaseResponseSuccess> {
    const user = await this.usersRepository.findByEmail(email)

    if(user) {
      return new ConflictError('Esse E-mail já existe')
    }

    const passwordHash = await this.hashGenerator.hash(password)
    const userInstance = User.create({
      email,
      name,
      password: passwordHash,
      userType: UserType[userType],
      description,
      createdAt,
    })

    if(userInstance instanceof InvalidEmailError) {
      return userInstance
    }

    await this.usersRepository.create(userInstance)

    return {
      message: 'Usuário criado com sucesso'
    }
  }
}
