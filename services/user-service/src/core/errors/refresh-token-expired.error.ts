export class RefreshTokenExpiredError extends Error {
  constructor() {
    super('Refresh token expirou, faça login novamente')
    this.name = 'RefreshTokenExpiredError'
  }
}
