import { Encrypter, EncryptOptions } from '../../cryptography/encrypter'

export class FakeEncrypter implements Encrypter {
  public calls: Array<{ payload: Record<string, unknown>; options: EncryptOptions }> = []

  async encrypt(payload: Record<string, unknown>, options: EncryptOptions = {}): Promise<string> {
    this.calls.push({ payload, options })

    return `token-${payload.tokenType}-${payload.sub}`
  }
}
