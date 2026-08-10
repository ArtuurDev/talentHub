import { Inject, Injectable } from '@nestjs/common'
import { InvalidCredentialsError } from '../../../core/errors/invalid-credentials.error'
import { Encrypter } from '../../../cryptography/encrypter'
import { HashComparer } from '../../../cryptography/hash-comparer'
import { UserType } from '../../enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'
import { randomBytes } from 'node:crypto'
import { HashGenerator } from '../../../cryptography/hash-generator'
import { SessionsRepository } from '../repositories/sessions-repository'
import { UserSession } from '../../enterprise/entities/user-session'

export interface LoginUserUseCaseRequest {
  email: string
  password: string
}

export type LoginUserUseCaseResponse = { accessToken: string; refreshToken: string } | InvalidCredentialsError

@Injectable()
export class LoginUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
    private hashGenerator: HashGenerator,
    private sessionRepository: SessionsRepository
  ) {}

  async execute({ email, password }: LoginUserUseCaseRequest): Promise<LoginUserUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      return new InvalidCredentialsError()
    }

    const passwordMatches = await this.hashComparer.compare(password, user.password)

    if (!passwordMatches) {
      return new InvalidCredentialsError()
    }

    const payload = {
      sub: user.id.toString(),
      email: user.email,
      userType: UserType[user.userType],
    }

    const accessToken = await this.encrypter.encrypt({ ...payload, tokenType: 'access' }, { expiresIn: '15m' })
    const refreshToken = randomBytes(32).toString('base64url')
    const hashRefreshToken = await this.hashGenerator.hash(refreshToken)

    const createdRefreshToken = new Date()
    const expiresAtRefresToken = new Date(createdRefreshToken)
    const expiresAtRefresTokenDay = 7
    expiresAtRefresToken.setDate(expiresAtRefresToken.getDate() + expiresAtRefresTokenDay)
    
    const userSession = UserSession.create({
      refreshToken: hashRefreshToken,
      userId: user.id.toString(),
      createdAt: createdRefreshToken,
      expiresAt: expiresAtRefresToken
    })

    await this.sessionRepository.create(userSession)

    return { accessToken, refreshToken }
  }
}
