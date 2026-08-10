import { ProgrammingSkill, UserSkill } from '../../domain/enterprise/entities/user-skill'
import { UserSkillsRepository } from '../../domain/application/repositories/user-skills-repository'

export class InMemoryUserSkillsRepository implements UserSkillsRepository {
  public items: UserSkill[] = []

  async create(userSkill: UserSkill): Promise<void> {
    this.items.push(userSkill)
  }

  async update(userSkill: UserSkill): Promise<void> {
    const itemIndex = this.items.findIndex((item) => item.id.equals(userSkill.id))

    if (itemIndex >= 0) {
      this.items[itemIndex] = userSkill
    }
  }

  async delete(userSkill: UserSkill): Promise<void> {
    this.items = this.items.filter((item) => !item.id.equals(userSkill.id))
  }

  async findById(id: string): Promise<UserSkill | null> {
    return this.items.find((item) => item.id.toString() === id) ?? null
  }

  async findByUserIdAndSkill(userId: string, skill: ProgrammingSkill): Promise<UserSkill | null> {
    return this.items.find((item) => item.userId === userId && item.skill === skill) ?? null
  }
}
