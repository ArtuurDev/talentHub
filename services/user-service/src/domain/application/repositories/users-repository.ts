import { User } from "../../enterprise/entities/user";

export abstract class UserRepository {
  abstract create(user: User): Promise<void>
  abstract update(user: User): Promise<void>
  abstract delete(user: User): Promise<void>
  abstract findByEmail(email: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
}

export { UserRepository as UsersRepository }
