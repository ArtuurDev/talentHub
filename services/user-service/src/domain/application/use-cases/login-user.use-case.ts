import { Inject, Injectable } from '@nestjs/common'
import { InvalidCredentialsError } from '../../../core/errors/invalid-credentials.error'
import { Encrypter } from '../../../cryptography/encrypter'
import { HashComparer } from '../../../cryptography/hash-comparer'
import { UserType } from '../../enterprise/entities/user'
import { UsersRepository } from '../repositories/users-repository'

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
    const [accessToken, refreshToken] = await Promise.all([
      this.encrypter.encrypt({ ...payload, tokenType: 'access' }, { expiresIn: '15m' }),
      this.encrypter.encrypt({ ...payload, tokenType: 'refresh' }, { expiresIn: '7d' }),
    ])

    return { accessToken, refreshToken }
  }
}
