import { Entity } from "../../../core/entities/entity";
import { InvalidEmailError } from "../../../core/errors/invalid-email.error";
import { UniqueEntityId } from "../../../core/entities/unique-entity-id";
import { Optional } from "../../../core/utility/optional";
import { Email } from "./value-objects/email";
import { AggregateRoot } from "../../../core/entities/aggregate-root";
import { UserCreatedEvent } from "../events/user-created-event";

export enum UserType {
  'TALENT',
  'RECRUITER'
}

export interface UserProps {
  name: string
  email: string
  password: string
  userType: UserType

  createdAt: Date
  updatedAt?: Date | null
}

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: UniqueEntityId) {
    super(props, id)
  }

  get name() {
    return this.props.name
  }

  get email() {
    return this.props.email
  }

  get password() {
    return this.props.password
  }

  get userType() {
    return this.userType
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.updatedAt
  }


  static create(props: Optional<UserProps, 'createdAt' | 'updatedAt'>, id?: UniqueEntityId): User | InvalidEmailError {
    const email = Email.create(props.email)

    if (email instanceof InvalidEmailError) {
      return email
    }

    const user = new User({
      ...props,
      email: email.value,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? null
    }, id)

    const isNewUser = !id

    if(isNewUser) {
      user.addDomainEvent(new UserCreatedEvent(user))
    }

    return user
  }

}
