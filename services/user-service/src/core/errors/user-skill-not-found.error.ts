export class UserSkillNotFoundError extends Error {
  constructor() {
    super('Habilidade não encontrada')
    this.name = 'UserSkillNotFoundError'
  }
}
