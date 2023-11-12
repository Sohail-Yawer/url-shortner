import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinksModule } from './links/links.module'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: "./data/mydatabase.db",
      synchronize: true,
      entities: ['dist/**/*.entity.js'],
      migrations: ['dist/migrations/*.js'],

    }),
    LinksModule,
    ConfigModule.forRoot(),
  ],
})
export class AppModule {}
