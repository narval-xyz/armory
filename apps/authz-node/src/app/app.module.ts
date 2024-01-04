import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { load } from './app.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [load]
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
