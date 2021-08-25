import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoffeesModule } from './coffees/coffees.module';

@Module({
  imports: [CoffeesModule],
  controllers: [AppController],
  providers: [AppService], //Main idea of providers is that it can inject dependencies
})
export class AppModule {}
