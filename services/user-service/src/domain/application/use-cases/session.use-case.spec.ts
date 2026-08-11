import { beforeEach, describe, expect, it } from 'vitest'
import { InvalidRefreshTokenError } from '../../../core/errors/invalid-refresh-token.error'
import { RefreshTokenExpiredError } from '../../../core/errors/refresh-token-expired.error'
import { RefreshTokenSecurityViolationError } from '../../../core/errors/refresh-token-security-violation.error'
import { SessionNotFoundError } from '../../../core/errors/session-not-found'
import { FakeEncrypter } from '../../../test/cryptography/fake-encrypter'
import { FakeHasher } from '../../../test/cryptography/fake-hasher'
import { InMemorySessionsRepository } from '../../../test/repositories/in-memory-sessions-repository'
import { UserSession } from '../../enterprise/entities/user-session'
import { SessionUseCase } from './session.use-case'

let sessionsRepository: InMemorySessionsRepository
let encrypter: FakeEncrypter
let sut: SessionUseCase

describe('Caso de uso: renovar sessão', () => {
  beforeEach(() => {
    sessionsRepository = new InMemorySessionsRepository()
    const hasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new SessionUseCase(sessionsRepository, hasher, encrypter, hasher)
  })

  const createSession = (overrides: Partial<{ expiresAt: Date; revoked: boolean }> = {}) =>
    UserSession.create({
      userId: 'user-1',
      refreshToken: 'refresh-token-hashed',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
      ...overrides,
  })

  it('rotaciona o refresh token, revoga a sessão anterior e gera um novo token de acesso', async () => {
    const session = createSession()
    await sessionsRepository.create(session)

    await expect(sut.execute({
      sessionId: session.id.toString(),
      refreshToken: 'refresh-token',
    })).resolves.toMatchObject({
      newAccessToken: 'token-undefined-user-1',
      newRefreshToken: expect.any(String),
      sessionId: expect.any(String),
    })

    expect(session.revoked).toBe(true)
    expect(session.lastAccessedAt).toBeInstanceOf(Date)
    expect(sessionsRepository.items).toHaveLength(2)
    expect(sessionsRepository.items[1]).toMatchObject({
      userId: 'user-1',
      refreshToken: expect.stringMatching(/-hashed$/),
      revoked: false,
    })
    expect(encrypter.calls).toEqual([
      {
        payload: { sub: 'user-1' },
        options: { expiresIn: '15m' },
      },
    ])
  })

  it('retorna erro quando a sessão não existe', async () => {
    await expect(sut.execute({ sessionId: 'missing-session', refreshToken: 'refresh-token' }))
      .resolves.toBeInstanceOf(SessionNotFoundError)
    expect(encrypter.calls).toHaveLength(0)
  })

  it('retorna erro quando o refresh token não corresponde à sessão', async () => {
    const session = createSession()
    await sessionsRepository.create(session)

    await expect(sut.execute({ sessionId: session.id.toString(), refreshToken: 'invalid-token' }))
      .resolves.toBeInstanceOf(InvalidRefreshTokenError)
    expect(session.revoked).toBe(false)
    expect(encrypter.calls).toHaveLength(0)
  })

  it('revoga todas as sessões do usuário quando uma sessão revogada é reutilizada', async () => {
    const revokedSession = createSession({ revoked: true })
    const activeSession = UserSession.create({
      userId: 'user-1',
      refreshToken: 'another-refresh-token-hashed',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
    })
    await sessionsRepository.create(revokedSession)
    await sessionsRepository.create(activeSession)

    await expect(sut.execute({
      sessionId: revokedSession.id.toString(),
      refreshToken: 'refresh-token',
    })).resolves.toBeInstanceOf(RefreshTokenSecurityViolationError)

    expect(sessionsRepository.items.every(session => session.revoked)).toBe(true)
    expect(encrypter.calls).toHaveLength(0)
  })

  it('retorna erro quando o refresh token expirou', async () => {
    const session = createSession({ expiresAt: new Date(Date.now() - 1_000) })
    await sessionsRepository.create(session)

    await expect(sut.execute({ sessionId: session.id.toString(), refreshToken: 'refresh-token' }))
      .resolves.toBeInstanceOf(RefreshTokenExpiredError)
    expect(session.revoked).toBe(false)
    expect(encrypter.calls).toHaveLength(0)
  })
})
