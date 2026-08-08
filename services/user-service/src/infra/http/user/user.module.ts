import { Module } from '@nestjs/common'
import { Encrypter } from '../../../cryptography/encrypter'
import { HashComparer } from '../../../cryptography/hash-comparer'
import { HashGenerator } from '../../../cryptography/hash-generator'
import { UserRepository } from '../../../domain/application/repositories/users-repository'
import { CreateUserUseCase } from '../../../domain/application/use-cases/create-user.use-case'
import { DeleteUserUseCase } from '../../../domain/application/use-cases/delete-user.use-case'
import { GetUserProfileUseCase } from '../../../domain/application/use-cases/get-user-profile.use-case'
import { LoginUserUseCase } from '../../../domain/application/use-cases/login-user.use-case'
import { UpdateUserUseCase } from '../../../domain/application/use-cases/update-user.use-case'
import { CryptographyModule } from '../../cryptography/cryptography.module'
import { PrismaService } from '../../database/prisma/prisma.service'
import { PrismaUsersRepository } from '../../database/repositories/prisma-users-repository'
import { CreateUserController } from './controllers/create-user.controller'
import { DeleteUserController } from './controllers/delete-user.controller'
import { GetUserProfileController } from './controllers/get-user-profile.controller'
import { LoginUserController } from './controllers/login-user.controller'
import { UpdateUserController } from './controllers/update-user.controller'

@Module({
  imports: [CryptographyModule],
  controllers: [
    CreateUserController,
    GetUserProfileController,
    LoginUserController,
    UpdateUserController,
    DeleteUserController,
  ],
  providers: [
    PrismaService,
    PrismaUsersRepository,
    { provide: UserRepository, useExisting: PrismaUsersRepository },
    {
      provide: CreateUserUseCase,
      inject: [UserRepository, HashGenerator],
      useFactory: (usersRepository: UserRepository, hashGenerator: HashGenerator) =>
        new CreateUserUseCase(usersRepository, hashGenerator),
    },
    {
      provide: GetUserProfileUseCase,
      inject: [UserRepository],
      useFactory: (usersRepository: UserRepository) => new GetUserProfileUseCase(usersRepository),
    },
    {
      provide: LoginUserUseCase,
      inject: [UserRepository, HashComparer, Encrypter],
      useFactory: (
        usersRepository: UserRepository,
        hashComparer: HashComparer,
        encrypter: Encrypter,
      ) => new LoginUserUseCase(usersRepository, hashComparer, encrypter),
    },
    {
      provide: UpdateUserUseCase,
      inject: [UserRepository, HashGenerator],
      useFactory: (usersRepository: UserRepository, hashGenerator: HashGenerator) =>
        new UpdateUserUseCase(usersRepository, hashGenerator),
    },
    {
      provide: DeleteUserUseCase,
      inject: [UserRepository],
      useFactory: (usersRepository: UserRepository) => new DeleteUserUseCase(usersRepository),
    },
  ],
})
export class UserModule {}
