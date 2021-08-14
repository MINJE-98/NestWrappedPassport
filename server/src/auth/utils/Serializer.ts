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

  serializeUser(user: User, done: Done) {
    done(null, user);
  }

  async deserializeUser(user: User, done: Done) {
    const userDB = await this.authService.findUser(user.nodeId);
    return userDB ? done(null, userDB) : done(null, null);
  }
}
