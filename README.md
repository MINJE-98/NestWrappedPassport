# 소개

Passport는 각 응용 프로그램에 고유한 인증 요구 사항이 있음을 인식합니다. 

전략 이라고 하는 인증 메커니즘 은 개별 모듈로 패키징됩니다. 

애플리케이션은 불필요한 종속성을 생성하지 않고 사용할 전략을 선택할 수 있습니다.

# 사용 이유

여러 전략으로 로그인을 구현하기 위해.

세션과 쿠키 처리 등의 복잡한 작업이 많기 때문에 검증된 모듈을 사용하는 장점.

# 바닐라 passport 동작 방식
1. 해당 전략에 특정한 옵션 집합입니다. 예를 들어 JWT 전략에서 토큰에 서명하기 위한 비밀을 제공할 수 있습니다.
2. Passport에게 사용자 저장소(사용자 계정을 관리하는 곳)와 상호 작용하는 방법을 알려주는 "확인 콜백"입니다. 여기에서 사용자의 존재 여부(및/또는 새 사용자 생성)와 자격 증명이 유효한지 확인합니다. Passport 라이브러리는 이 콜백이 유효성 검사가 성공하면 전체 사용자를 반환하거나 실패하면 null을 반환할 것으로 예상합니다(실패는 사용자를 찾을 수 없거나 Passport-local의 경우 비밀번호가 일치하지 않는 것으로 정의됨). .

# 설치

먼저 `@nestjs/passport` 바닐라 passport를 nest에서 사용하기 위해 nest로 래핑된 passport를 설치해줍니다.

# 구성(Configure)
1. 전략(Strategy)
2. 미들웨어(middleware)
3. 세션(session)

## 전략(Strategy)

**Passport**구현을 위해 전략을 사용하는데 전략은 여러가지가 있습니다.

1. 로컬
2. Oauth
3. OpenID

**Passport**인증을 구현하기 위해서는 전략을 구현해야 합니다.

> 이글은 깃허브 전략을 구현한 글입니다.

### ExpressJS

```jsx
passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ githubId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

### NestJS

```jsx
export class GithubStrategy extends PassportStrategy(Strategy, "github") {
  constructor(private authService: AuthService) {
    super({
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://127.0.0.1:3000/auth/github/callback",
      scope: ["name", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ): Promise<any> {
		if(!profile) done(null, false)
		done(null, prodile.username)
  }
}
```

### 콜백 확인

전략에는 확인 콜백이라는 것이 필요합니다. 확인 콜백의 목적은 자격 증명 집합을 소유한 사용자를 찾는 것입니다.

**Passport**는 요청을 인증할 때 요청에 포함된 자격 증명을 구문 분석합니다.

해당 자격 증명을 인수로 사용하여 확인 콜백을 호출합니다. 

```jsx
return done(null, user)
```

자격 증명이 유효하지 않는다면 인증 실패를 나타낼 수 있습니다.

```jsx
return done(null, false)
```

실패 이유를 제공할 수 도있습니다.

```jsx
return done(null, false, { message: 'Incorrect password.' });
```

예외가 발생한다면 오류와 함께 호출이 가능합니다.

```jsx
return done(err)
```

## 인증

### ExpressJS

인증이 실패하면 `401 Unauthorized` 상태로 응답합니다.

인증에 성공하면 **redirect**합니다.

```jsx
app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

### NestJS

Nest에서는 가드를 사용하여 인증을 구현합니다.

인증이 실패하면 `401 notfound`상태로 응답합니다.

요청한 사용자의 인증상태를 반환해줍니다.

```jsx
export class GithubGuard extends AuthGuard("github") {
  async canActivate(context: ExecutionContext) {
    const activate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();
    await super.logIn(request);
    return activate;
  }
}
```

```jsx
@Get("github")
  @UseGuards(GithubGuard)
  login() {
    return;
  }

  @Get("github/callback")
  @UseGuards(GithubGuard)
  callback(@Res() res) {
    res.redirect("/");
  }
```

## 미들웨어(middleware)

### Session 설정 및 Redis 추가

Redis에 대한 추가정보는 [이곳](https://www.notion.so/redis-a9136695eb5c4ab2a96d4fd7e48eea93)을 클릭해 주세요

Redis에 세션을 저장할 것이기 때문에 session 미들웨어에 store옵션에 Redis를 추가해줍니다.

```jsx
const client = redis.createClient({ url: "redis://127.0.0.1:6379" });
const RedisStore = connectRedis(session);
client.on("connect", () => console.log("conecct"));
app.use(
  session({
    cookie: {
      maxAge: 10000 * 2, // 2시간
    },
    secret: "dahdgasdjhsadgsajhdsagdhjd",
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({ client }),
  })
);
```

### Passport 초기화, 세션 사용

Passport를 초기화 하는 미들웨어가 사용하며, 선택적으로 세션을 사용한다면 세션 미들웨어를 사용합니다.

```jsx
app.use(passport.initialize());
app.use(passport.session());
```

- 전체 코드

    ```jsx
    const client = redis.createClient({ url: "redis://127.0.0.1:6379" });
      const RedisStore = connectRedis(session);
      client.on("connect", () => console.log("conecct"));
      app.enableCors({
        origin: true,
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        credentials: true,
      });
      app.use(
        session({
          cookie: {
            maxAge: 10000 * 2, // 2시간
          },
          secret: "dahdgasdjhsadgsajhdsagdhjd",
          resave: false,
          saveUninitialized: false,
          store: new RedisStore({ client }),
        })
      );
      app.use(passport.initialize());
      app.use(passport.session());
    ```

## 유저 인증

req.isAuthenticated()를 통해 유저의 인증 유무를 판별할 수 있습니다.

### ExpressJS

```jsx
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/login');
};

router.get('/myinfo', isAuthenticated, function (req, res) {
	return req.myinfo;
});
```

### NestJS

```jsx
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log("AuthenticatedGuard");

    return req.isAuthenticated();
  }
```

```jsx
@Get("myinfo")
  @UseGuards(AuthenticatedGuard)
  status(@Req() req) {
    return req.myinfo;
  }
```

## 세션(Session)

세션은 일반적으로 웹 애플리케이션에서 사용자를 인증하는 데 사용합니다.

사용자를 인증하는 데 사용되는 자격증명은 로그인 요청 중에만 전송 때문에 클라이언트는 인증이 완료 되면 브라우저의 쿠키를 통해 세션이 설정되고 유지됩니다. 

로그인 세션을 지원하기 위해 Passport는 세션에서 `user` 인스턴스를 직렬화 및 역직렬화를 합니다.

### 직렬화(S**erialize)**

세션에 저장될 객체를 결정하는 역할을 합니다.

### 역직렬화(**deserialize)**

세션에 저장된 객체를 DB에 찾아 응답해줍니다.

### ExpressJS

```jsx
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
```

### NestJS

```jsx
  serializeUser(user: User, done: Done) {
    done(null, user);
  }
  async deserializeUser(user: User, done: Done) {
    const userDB = await this.authService.findUser(user.nodeId);
    return userDB ? done(null, userDB) : done(null, null);
  }
```

> 참고

[Documentation: Configure](http://www.passportjs.org/docs/configure/)
