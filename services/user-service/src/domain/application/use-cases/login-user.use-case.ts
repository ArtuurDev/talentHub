import { InvalidCredentialsError } from '../../../core/errors/invalid-credentials.error'
import { UserType } from '../../enterprise/entities/user'
import { CryptograpyRepository } from '../cryptograpy/cryptograpy-repository'
import { JwtRepository } from '../jwt/jwt-repository'
import { UsersRepository } from '../repositories/users-repository'

export interface LoginUserUseCaseRequest {
  email: string
  password: string
}

export type LoginUserUseCaseResponse = { accessToken: string } | InvalidCredentialsError

export class LoginUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private cryptograpyRepository: CryptograpyRepository,
    private jwtRepository: JwtRepository,
  ) {}

  async execute({ email, password }: LoginUserUseCaseRequest): Promise<LoginUserUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      return new InvalidCredentialsError()
    }

    const passwordMatches = await this.cryptograpyRepository.compare(user.password, password)

    if (!passwordMatches) {
      return new InvalidCredentialsError()
    }

    const accessToken = await this.jwtRepository.sign({
      sub: user.id.toString(),
      email: user.email,
      userType: UserType[user.userType],
    })

    return { accessToken }
  }
}
