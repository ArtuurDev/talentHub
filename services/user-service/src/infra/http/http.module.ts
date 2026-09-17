import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { MessagingModule } from "../messaging/messaging.module";

@Module({
  imports: [MessagingModule, UserModule]
})
export class HttpModule {}