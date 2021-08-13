import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";

import { entities } from "./typeorm";
import { PassportModule } from "@nestjs/passport";

console.log(`Running in ${process.env.NODE_ENV}`);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV == "development" ? ".env.development" : ".env",
    }),
    PassportModule.register({ session: true }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3306,
      username: "root",
      password: "whalswp77",
      database: "deadline",
      entities,
      synchronize: false,
    }),
    AuthModule,
  ],
})
export class AppModule {}
