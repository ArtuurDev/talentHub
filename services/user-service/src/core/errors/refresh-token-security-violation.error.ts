export class RefreshTokenSecurityViolationError extends Error {
  constructor() {
    super('Todas as sessões foram encerradas por tentativa de violação')
    this.name = 'RefreshTokenSecurityViolationError'
  }
}
