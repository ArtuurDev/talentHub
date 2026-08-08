import { CryptograpyRepository } from "../../domain/application/cryptograpy/cryptograpy-repository";

export class InMemoryEncryptRepository implements CryptograpyRepository {
  async hash(value: string, salt: number): Promise<string> {
    return `${value}-encrypt`
  }
  async compare(hash: string, currentValue: string): Promise<boolean> {
    return hash === currentValue
  }

}