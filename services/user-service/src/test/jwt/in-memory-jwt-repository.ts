import { JwtPayload, JwtRepository } from '../../domain/application/jwt/jwt-repository'

export class InMemoryJwtRepository implements JwtRepository {
  public payloads: JwtPayload[] = []

  async sign(payload: JwtPayload): Promise<string> {
    this.payloads.push(payload)

    return `token-${payload.sub}`
  }
}
