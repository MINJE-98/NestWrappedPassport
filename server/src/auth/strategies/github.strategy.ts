import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-github2";
import { Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(private authService: AuthService) {
    super({
      clientID: "",
      clientSecret: "",
      callbackURL: "http://localhost:3000/auth/github/callback",
      scope: ["name", "profile"],
    });
  }

  // callback 이후
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
    const { nodeId, username, profileUrl, provider } = profile;
    console.log("callback");
    const user = {
      nodeId,
      username,
      profileUrl,
      provider,
      accessToken,
    };
    return await this.authService.validateUser(user);
  }
}
