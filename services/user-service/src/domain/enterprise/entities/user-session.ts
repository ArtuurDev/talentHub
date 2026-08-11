import { AggregateRoot } from '../../../core/entities/aggregate-root'
import { UniqueEntityId } from '../../../core/entities/unique-entity-id'
import { Optional } from '../../../core/utility/optional'

export interface UserSessionProps {
  userId: string
  refreshToken: string
  createdAt: Date
  expiresAt: Date
  revoked: boolean
  lastAccessedAt?: Date | null
}

export class UserSession extends AggregateRoot<UserSessionProps> {
  private constructor(props: UserSessionProps, id?: UniqueEntityId) {
    super(props, id)
  }

  get userId() {
    return this.props.userId
  }

  get refreshToken() {
    return this.props.refreshToken
  }

  get createdAt() {
    return this.props.createdAt
  }

  get expiresAt() {
    return this.props.expiresAt
  }

  get revoked() {
    return this.props.revoked
  }

  get lastAccessedAt(): null | undefined | Date {
    return this.props.lastAccessedAt
  }

  set revoked(value: boolean) {
    this.props.revoked = value
    this.touch()
  }

  set lastAccessedAt(value: Date) {
    this.props.lastAccessedAt = value
    this.touch()
  } 

  static create(
    props: Optional<UserSessionProps, 'createdAt' | 'lastAccessedAt' | 'lastAccessedAt'>,
    id?: UniqueEntityId,
  ): UserSession {
    const session = new UserSession(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        lastAccessedAt: props.lastAccessedAt ?? null,
      },
      id,
    )

    return session
  }

  touch() {
    this.props.lastAccessedAt = new Date()
  }
}
