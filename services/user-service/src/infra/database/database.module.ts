import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { UserRepository } from "../../domain/application/repositories/users-repository";
import { PrismaUsersRepository } from "./repositories/prisma-users-repository";
import { UserSkillsRepository } from "../../domain/application/repositories/user-skills-repository";
import { PrismaUserSkillsRepository } from "./repositories/prisma-user-skills-repository";
import { PrismaSessionsRepository } from "./repositories/prisma-sessions-repository";
import { SessionsRepository } from "../../domain/application/repositories/sessions-repository";

@Module({
  imports: [],
  providers: [PrismaService, 
  {provide: UserRepository, useClass: PrismaUsersRepository},
  {provide: UserSkillsRepository, useClass: PrismaUserSkillsRepository},
  {provide: SessionsRepository, useClass: PrismaSessionsRepository}
],
  exports: [PrismaService, UserRepository, UserSkillsRepository, SessionsRepository]
})
export class DatabaseModule {}