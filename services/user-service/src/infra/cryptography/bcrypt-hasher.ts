import { Injectable } from '@nestjs/common'
import { compare, hash } from 'bcrypt'

import { HashComparer } from '../../cryptography/hash-comparer'
import { HashGenerator } from '../../cryptography/hash-generator'

@Injectable()
export class BcryptHasher implements HashGenerator, HashComparer {
  private readonly hashSaltLength = 8

  hash(plain: string): Promise<string> {
    return hash(plain, this.hashSaltLength)
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}
