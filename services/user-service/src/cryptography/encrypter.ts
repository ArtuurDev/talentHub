export interface EncryptOptions {
  expiresIn?: string | number
  issuer?: string
  audience?: string | string[]
  notBefore?: string | number
}

export abstract class Encrypter {
  abstract encrypt(payload: Record<string, unknown>, options?: EncryptOptions): Promise<string>
}
