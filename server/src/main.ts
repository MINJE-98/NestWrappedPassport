import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as session from "express-session";
import * as passport from "passport";
import * as redis from "redis";
import * as connectRedis from "connect-redis";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 3000;
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
  await app.listen(PORT, () => console.log(`Running on Port ${PORT}`));
}
bootstrap();
