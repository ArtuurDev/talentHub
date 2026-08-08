export interface JwtPayload {
  sub: string
  email: string
  userType: string
}

export abstract class JwtRepository {
  abstract sign(payload: JwtPayload): Promise<string>
}
