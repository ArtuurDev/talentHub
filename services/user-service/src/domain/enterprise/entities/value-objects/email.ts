import { InvalidEmailError } from "../../../../core/errors/invalid-email.error"

export class Email {
  private static readonly pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  private constructor(private readonly email: string) {}

  static create(value: unknown): Email | InvalidEmailError {
    if (typeof value !== "string") {
      return new InvalidEmailError()
    }

    const normalizedEmail = value.trim().toLowerCase()

    if (!Email.isValid(normalizedEmail)) {
      return new InvalidEmailError()
    }

    return new Email(normalizedEmail)
  }

  static isValid(value: string): boolean {
    return Email.pattern.test(value)
  }

  get value(): string {
    return this.email
  }

  equals(other: Email): boolean {
    return this.email === other.email
  }

  toString(): string {
    return this.email
  }
}
