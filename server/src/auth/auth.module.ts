import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { GithubStrategy } from "./strategies/github.strategy";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/typeorm";
import { SessionSerializer } from "./utils/Serializer";

@Module({
  imports: [PassportModule, TypeOrmModule.forFeature([User])],
  providers: [AuthService, SessionSerializer, GithubStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
