export class UserIsNotTalentError extends Error {
  constructor() {
    super('Apenas usuários do tipo TALENT podem gerenciar habilidades')
    this.name = 'UserIsNotTalentError'
  }
}
