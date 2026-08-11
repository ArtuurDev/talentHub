import { UserSession } from "../../enterprise/entities/user-session"

export abstract class SessionsRepository {
  abstract create(session: UserSession): Promise<void>
  abstract update(session: UserSession): Promise<void>
  abstract delete(session: UserSession): Promise<void>
  abstract revokeManyByUser(user: string): Promise<void>
  abstract findById(id: string): Promise<UserSession | null>
  abstract findByRefreshToken(token: string): Promise<UserSession | null>
  abstract findByUserId(userId: string): Promise<UserSession | null>
}

