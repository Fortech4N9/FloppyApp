import { NestFactory } from '@nestjs/core';
import { ComponentsModule } from './components.module';
import {ConfigService} from "@nestjs/config";
import {SharedService} from "@app/shared";

async function bootstrap() {
  const app = await NestFactory.create(ComponentsModule);
  app.enableCors();
  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);

  const queue = configService.get('RABBITMQ_COMPONENTS_QUEUE');

  app.connectMicroservice(sharedService.getRmqOptions(queue));
  await app.startAllMicroservices();

  await app.listen(9000);
}
bootstrap();
