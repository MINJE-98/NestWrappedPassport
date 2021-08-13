import { PassportSerializer } from "@nestjs/passport";
import { Inject, Injectable } from "@nestjs/common";
import { User } from "../../typeorm";
import { AuthenticationProvider } from "../IAuth";
import { Done } from "src/utils/type";
import { AuthService } from "../auth.service";

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  // 직렬화
  // 유저 정보를 세션으로 저장합니다.
  serializeUser(user: User, done: Done) {
    console.log("serialize");
    done(null, user);
  }

  // 역직렬화
  // strategy에서 유저 정보를 done으로 넘겨주면 해당 유저 정보가DB에 있는지 확인을 합니다.
  // callbackUrl로 Request로 유저 정보를 넘겨 줍니다.
  async deserializeUser(user: User, done: Done) {
    console.log("deserializeUser");
    const userDB = await this.authService.findUser(user.nodeId);
    return userDB ? done(null, userDB) : done(null, null);
  }
}
