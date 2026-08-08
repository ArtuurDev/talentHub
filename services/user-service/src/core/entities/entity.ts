import { UniqueEntityId } from "./unique-entity-id"

export class Entity<Props> {
  private _props: Props
  private _id: UniqueEntityId
  constructor(props: Props, id?: UniqueEntityId) {
    this._props = props
    this._id = id ?? new UniqueEntityId()
  }

  get props() {
    return this._props
  }

  get id() {
    return this._id
  }

  public equals(entity: Entity<unknown>) {
    if (entity === this) {
      return true
    }

    if (entity.id === this._id) {
      return true
    }

    return false
  }
} 