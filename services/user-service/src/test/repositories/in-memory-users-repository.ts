import { UsersRepository } from "../../domain/application/repositories/users-repository";
import { User } from "../../domain/enterprise/entities/user";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async create(user: User): Promise<void> {
    this.items.push(user)
  }

  async update(user: User): Promise<void> {
    const itemIndex = this.items.findIndex(item => item.id.equals(user.id))

    if (itemIndex >= 0) {
      this.items[itemIndex] = user
    }
  }

  async delete(user: User): Promise<void> {
    this.items = this.items.filter(item => !item.id.equals(user.id))
  }

  async findById(id: string): Promise<User | null> {
    return this.items.find(item => item.id.toString() === id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find(item => item.email === email) ?? null
  }
}
