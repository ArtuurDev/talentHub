export class PersistedUserInvalidEmailError extends Error {
  constructor() {
    super('Usuário persistido possui e-mail inválido')
    this.name = 'PersistedUserInvalidEmailError'
  }
}
