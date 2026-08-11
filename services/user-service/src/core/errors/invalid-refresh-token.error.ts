export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Refresh token inválido')
    this.name = 'InvalidRefreshTokenError'
  }
}
