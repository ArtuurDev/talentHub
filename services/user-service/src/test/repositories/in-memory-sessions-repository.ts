import { SessionsRepository } from "../../domain/application/repositories/sessions-repository"
import { UserSession } from "../../domain/enterprise/entities/user-session"

export class InMemorySessionsRepository implements SessionsRepository {
  public items: UserSession[] = []

  async create(session: UserSession): Promise<void> {
    this.items.push(session)
  }

  async update(session: UserSession): Promise<void> {
    const itemIndex = this.items.findIndex(item => item.id.equals(session.id))

    if (itemIndex >= 0) {
      this.items[itemIndex] = session
    }
  }

  async delete(session: UserSession): Promise<void> {
    this.items = this.items.filter(item => !item.id.equals(session.id))
  }

  async revokeManyByUser(userId: string): Promise<void> {
    this.items
      .filter(session => session.userId === userId)
      .forEach(session => {
        session.revoked = true
      })
  }

  async findById(id: string): Promise<UserSession | null> {
    return this.items.find(item => item.id.toString() === id) ?? null
  }

  async findByRefreshToken(token: string): Promise<UserSession | null> {
    return this.items.find(item => item.refreshToken === token) ?? null
  }

  async findByUserId(userId: string): Promise<UserSession | null> {
    return this.items.find(item => item.userId === userId) ?? null
  }
}
