import { UniqueEntityId } from "../../../core/entities/unique-entity-id";
import { DomainEvent } from "../../../core/events/domain-event";
import { User } from "../entities/user";

export class UserCreatedEvent implements DomainEvent {
  public ocurredAt: Date
  public user: User

  constructor(entity: User) {
    this.ocurredAt = new Date()
    this.user = entity
  }

  getAggregateId(): UniqueEntityId {
    return this.user.id
  }

}