import { ProgrammingSkill, UserSkill } from '../../enterprise/entities/user-skill'

export abstract class UserSkillsRepository {
  abstract create(userSkill: UserSkill): Promise<void>
  abstract update(userSkill: UserSkill): Promise<void>
  abstract delete(userSkill: UserSkill): Promise<void>
  abstract findById(id: string): Promise<UserSkill | null>
  abstract findManyByUserId(userId: string): Promise<UserSkill[]>
  abstract findByUserIdAndSkill(userId: string, skill: ProgrammingSkill): Promise<UserSkill | null>
}
