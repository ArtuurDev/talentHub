import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import helmet from "helmet";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(helmet())

  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
    allowedHeaders: ['Content-Type', 'Authorization']
  })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true
    })
  )

  const config = new DocumentBuilder()
    .setTitle("API GATEWAY - TALENT HUB")
    .setDescription("API GATEWAY DO TALENT HUB")
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(3000)
}

bootstrap()