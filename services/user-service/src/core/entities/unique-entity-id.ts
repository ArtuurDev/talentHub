import { randomUUID } from "node:crypto"

export class UniqueEntityId {
  private _value: string
  constructor(id?: string) {
    this._value = id ?? randomUUID()
  }

  toString() {
    return this._value
  }

  public equals(id: UniqueEntityId) {
    return id.toString() === this._value
  }
}