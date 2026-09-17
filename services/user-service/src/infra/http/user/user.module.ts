import { Module } from '@nestjs/common'
import { CreateUserUseCase } from '../../../domain/application/use-cases/create-user.use-case'
import { DeleteUserUseCase } from '../../../domain/application/use-cases/delete-user.use-case'
import { GetUserProfileUseCase } from '../../../domain/application/use-cases/get-user-profile.use-case'
import { LoginUserUseCase } from '../../../domain/application/use-cases/login-user.use-case'
import { UpdateUserUseCase } from '../../../domain/application/use-cases/update-user.use-case'
import { AddUserSkillUseCase } from '../../../domain/application/use-cases/add-user-skill.use-case'
import { DeleteUserSkillUseCase } from '../../../domain/application/use-cases/delete-user-skill.use-case'
import { UpdateUserSkillUseCase } from '../../../domain/application/use-cases/update-user-skill.use-case'
import { ListUserSkillsUseCase } from '../../../domain/application/use-cases/list-user-skills.use-case'
import { CryptographyModule } from '../../cryptography/cryptography.module'
import { AddUserSkillController } from './controllers/add-user-skill.controller'
import { CreateUserController } from './controllers/create-user.controller'
import { DeleteUserSkillController } from './controllers/delete-user-skill.controller'
import { DeleteUserController } from './controllers/delete-user.controller'
import { GetUserProfileController } from './controllers/get-user-profile.controller'
import { LoginUserController } from './controllers/login-user.controller'
import { UpdateUserController } from './controllers/update-user.controller'
import { UpdateUserSkillController } from './controllers/update-user-skill.controller'
import { ListUserSkillsController } from './controllers/list-user-skills.controller'
import { DatabaseModule } from '../../database/database.module'

@Module({
  imports: [DatabaseModule, CryptographyModule],
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
