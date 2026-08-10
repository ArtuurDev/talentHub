export class ConflictError extends Error {
  private code: number
  constructor(message: string, code?: 409) {
    super(message) 
    this.code = code ?? 409
  }

  toJson() {
    return {
      message: this.message,
      statusCode: this.code
    }
  }
}