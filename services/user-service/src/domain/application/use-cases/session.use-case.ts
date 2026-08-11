import { randomBytes } from 'node:crypto'
import { InvalidRefreshTokenError } from '../../../core/errors/invalid-refresh-token.error'
import { RefreshTokenExpiredError } from '../../../core/errors/refresh-token-expired.error'
import { RefreshTokenSecurityViolationError } from '../../../core/errors/refresh-token-security-violation.error'
import { SessionNotFoundError } from '../../../core/errors/session-not-found'
import { Encrypter } from '../../../cryptography/encrypter'
import { HashComparer } from '../../../cryptography/hash-comparer'
import { HashGenerator } from '../../../cryptography/hash-generator'
import { UserSession } from '../../enterprise/entities/user-session'
import { SessionsRepository } from '../repositories/sessions-repository'

export interface SessionUseCaseRequest {
  sessionId: string
  refreshToken: string
}

export class SessionUseCase {
  constructor(
    private sessionRepository: SessionsRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({ refreshToken, sessionId }: SessionUseCaseRequest) {
    const session = await this.sessionRepository.findById(sessionId)

    if (!session) {
      return new SessionNotFoundError()
    }

    const isValidToken = await this.hashComparer.compare(refreshToken, session.refreshToken)

    if (!isValidToken) {
      return new InvalidRefreshTokenError()
    }

    if (session.revoked) {
      await this.sessionRepository.revokeManyByUser(session.userId)
      return new RefreshTokenSecurityViolationError()
    }

    if (new Date().getTime() > session.expiresAt.getTime()) {
      return new RefreshTokenExpiredError()
    }

    const createdRefreshToken = new Date()
    const expiresAtRefreshToken = new Date(createdRefreshToken)
    expiresAtRefreshToken.setDate(expiresAtRefreshToken.getDate() + 7)

    const newRefreshToken = randomBytes(32).toString('base64url')
    const hashRefreshToken = await this.hashGenerator.hash(newRefreshToken)
    const newSession = UserSession.create({
      revoked: false,
      expiresAt: expiresAtRefreshToken,
      userId: session.userId,
      refreshToken: hashRefreshToken,
    })
    const newAccessToken = await this.encrypter.encrypt({ sub: session.userId.toString() }, { expiresIn: '15m' })

    session.revoked = true
    session.lastAccessedAt = new Date()

    await Promise.all([
      this.sessionRepository.update(session), 
      this.sessionRepository.create(newSession)
    ])

    return { newAccessToken, newRefreshToken, sessionId: newSession.id.toString() }
  }
}
