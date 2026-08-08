import { Injectable } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import { Encrypter, EncryptOptions } from '../../cryptography/encrypter'

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}

  encrypt(payload: Record<string, unknown>, options?: EncryptOptions): Promise<string> {
    return this.jwtService.signAsync(payload, options as JwtSignOptions)
  }
}
