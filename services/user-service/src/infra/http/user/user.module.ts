import { Module } from '@nestjs/common'
import { UserRepository } from '../../../domain/application/repositories/users-repository'
import { CreateUserUseCase } from '../../../domain/application/use-cases/create-user.use-case'
import { DeleteUserUseCase } from '../../../domain/application/use-cases/delete-user.use-case'
import { GetUserProfileUseCase } from '../../../domain/application/use-cases/get-user-profile.use-case'
import { LoginUserUseCase } from '../../../domain/application/use-cases/login-user.use-case'
import { UpdateUserUseCase } from '../../../domain/application/use-cases/update-user.use-case'
import { UserSkillsRepository } from '../../../domain/application/repositories/user-skills-repository'
import { AddUserSkillUseCase } from '../../../domain/application/use-cases/add-user-skill.use-case'
import { DeleteUserSkillUseCase } from '../../../domain/application/use-cases/delete-user-skill.use-case'
import { UpdateUserSkillUseCase } from '../../../domain/application/use-cases/update-user-skill.use-case'
import { ListUserSkillsUseCase } from '../../../domain/application/use-cases/list-user-skills.use-case'
import { CryptographyModule } from '../../cryptography/cryptography.module'
import { PrismaService } from '../../database/prisma/prisma.service'
import { PrismaUserSkillsRepository } from '../../database/repositories/prisma-user-skills-repository'
import { PrismaUsersRepository } from '../../database/repositories/prisma-users-repository'
import { AddUserSkillController } from './controllers/add-user-skill.controller'
import { CreateUserController } from './controllers/create-user.controller'
import { DeleteUserSkillController } from './controllers/delete-user-skill.controller'
import { DeleteUserController } from './controllers/delete-user.controller'
import { GetUserProfileController } from './controllers/get-user-profile.controller'
import { LoginUserController } from './controllers/login-user.controller'
import { UpdateUserController } from './controllers/update-user.controller'
import { UpdateUserSkillController } from './controllers/update-user-skill.controller'
import { ListUserSkillsController } from './controllers/list-user-skills.controller'
import { SessionsRepository } from '../../../domain/application/repositories/sessions-repository'
import { PrismaSessionsRepository } from '../../database/repositories/prisma-sessions-repository'

@Module({
  imports: [CryptographyModule],
  controllers: [
    CreateUserController,
    GetUserProfileController,
    LoginUserController,
    UpdateUserController,
    DeleteUserController,
    AddUserSkillController,
    UpdateUserSkillController,
    DeleteUserSkillController,
    ListUserSkillsController,
  ],
  providers: [
    PrismaService,
    { provide: UserRepository, useClass: PrismaUsersRepository },
    { provide: UserSkillsRepository, useClass: PrismaUserSkillsRepository },
    {provide: SessionsRepository, useClass: PrismaSessionsRepository},
    CreateUserUseCase,
    GetUserProfileUseCase,
    LoginUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    AddUserSkillUseCase,
    UpdateUserSkillUseCase,
    DeleteUserSkillUseCase,
    ListUserSkillsUseCase,
  ],
})
export class UserModule {}
