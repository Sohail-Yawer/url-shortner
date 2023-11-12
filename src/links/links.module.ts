import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinksController } from './links.controller'
import { LinksService } from './links.service';
import { Link } from './link.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Link])],
  controllers: [LinksController],
  providers: [LinksService],
})
export class LinksModule {}