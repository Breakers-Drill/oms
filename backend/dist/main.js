import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
    // eslint-disable-next-line no-console
    console.log(`Backend listening on http://0.0.0.0:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map