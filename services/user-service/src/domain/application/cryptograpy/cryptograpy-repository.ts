export abstract class CryptograpyRepository {
  abstract hash(value: string, salt: number): Promise<string>
  abstract compare(hash: string, currentValue: string): Promise<boolean>
}