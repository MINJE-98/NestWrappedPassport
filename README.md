이번 TILog 프로젝트에 여러 인증을 붙일 계획이라 Passport의 전략을 이용하여 조금 더 편하게 인증을 구현하기 위해 Passport를 사용하여 인증을 구현하기로 하였다.

[바닐라 Passport](https://tilog.io/MINJE-98/22)에서 처럼 Nest에 적용하면 된다.

# 설치

`@nestjs/passport` NestJS로 레핑되어있는 passport를 설치한다.

# 미들웨어(middleware)

Express에서 한 것 처럼 Main.ts에 Passport를 사용하기 위해 `app.use(passport.initialize());`를 추가해야한다.

또한 세션을 사용할 경우 `app.use(passport.session());`미들웨어도 사용합니다.

## 
```tsx
// Connect Local Redis
const client = redis.createClient({ url: `redis://${REDIS_HOST}:${REDIS_PORT}` });
// Redis Store Use Session
const redisStore = connectRedis(session);
// Redis Log
client.on('connect', () => console.log('Redis Connect Success'));
client.on('error', (error) => {
  throw new Error(error);
});
// Session Setting
app.use(
  session({
    cookie: {
      maxAge: parseInt(SESSION_COOKIE_MAXAGE),
    },
    secret: SESSION_SECRET,
    resave: SESSION_RESAVE,
    sameSite: 'none',
    saveUninitialized: SESSION_SAVEUNINITIALIZED,
    // 세션 스토어를 레지스로 설정합니다.
    store: new redisStore({ client }),
  }),
);
// 패스포트를 구동합니다.
app.use(passport.initialize());
// 세션을 연결합니다.
app.use(passport.session());
```

# 인증(Authenication)

NestJS에서는 AuthGuard에 확장할 전략을 매개변수로 주어 전략을 생성할 수 있다. 

## 구현

```jsx
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
//  Github Strategy에서 데이터 검증이 완료 된 후  super.login()메소드가 serializeUser를 호출하여 세션에 유저 정보를 저장 후 반환됩니다.
export class GithubGuard extends AuthGuard('github') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return activate;
  }
}
```

# 전략(Strategy)

NestJS에서 PassportStrategy를 확장하여 전략을 구현할 수 있다.

## 구현

```jsx
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-github2';
import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserInfo } from '../dto/userinfo.dto';
import Time from '../../utilities/time.utility';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['profile'],
    });
  }
  // 유저의 자격증명이 완료되면 유저의 정보를 받고, 유저 데이터를 검증 후 반환합니다.
  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { nodeId, username, photos, provider } = profile;
    const userinfo: UserInfo = {
      oAuthServiceId: nodeId,
      userName: username,
      proFileImageUrl: photos[0].value,
      oAuthType: provider,
      accessToken: accessToken,
      createdAt: Time.nowDate(),
    };
		if(!!userinfo) done(null, userinfo);
		else done(null, false);
  }
}
```

# 세션(Session)

PassportSerializer를 확장하여 sessionSerializer를 구현한다.

```tsx
import { PassportSerializer } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { Done } from '../dto/done.dto';
import { SessionInfo } from '../dto/session-info.dto';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  // Stretegy 에서 반환된 유저 정보를 세션에 저장합니다.
  serializeUser(users: SessionInfo, done: Done) {
    done(null, users);
  }

  // 클라이언트에서 인증이 필요한 요청을 할 때,  요청받은 세션의 유저정보가 DB에 유저 정보를 확인 후 done으로 유저 정보를 반환해줍니다.
  async deserializeUser(users: SessionInfo, done: Done) {
    const userDB = await this.usersService.findUser(users.oAuthServiceId);
    return userDB ? done(null, userDB) : done(null, null);
  }
}
```

# 인가(Authorization)

Nestjs에서는 req.isAuthenticated()를 Guard로 구현한다.

Guard로 구현한 인가(Authorization)는 Controller의 인가가 필요한 Router에 붙여서 사용할 수 있다.

## 구현

Guard

```jsx
import { CanActivate, ExecutionContext, HttpException, Injectable, Logger } from '@nestjs/common';
import { FailedAuthentication } from 'src/ExceptionFilters/Errors/Auth/Auth.error';

// 인증 유무를 반환합니다
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    if (!req.isAuthenticated()) {
      const errorResponse = new FailedAuthentication(`auth.guard.authentication.failedauthentication`);
      throw new HttpException(errorResponse, errorResponse.codeNumber);
    }
    return req.isAuthenticated();
  }
}
```

Auth Controller

```tsx
// 로그인한 유저 정보를 반환합니다.
  @Get('userinfo')
  @UseGuards(AuthenticatedGuard)
  status(@UserInfo() userInfo: SessionInfo) {
    return userInfo;
  }

  // 로그인한 유저의 세션을 파기시킵니다.
  @Get('logout')
  @UseGuards(AuthenticatedGuard)
  logout(@Session() session) {
    // 세션을 제거합니다.
    session.destroy((error) => {
      if (error) {
        return console.log(error);
      }
      return;
    });
  }
```

# 마무리

---

NestJS에서 제공해주는 Passport를 사용하면 손쉽게 NestJS에서 Passport를 구현하고 유저 인증을 할 수 있다.
