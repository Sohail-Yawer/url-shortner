
import { Controller, Post, Body, Get, Delete, Param, Res, Put } from '@nestjs/common';
import { LinksService } from './links.service';
import { Response } from 'express';
import { CreateLinkDto } from './dto/create-link.dto';
import { LinkDto } from './dto/link.dto';

//http method definitions
@Controller()
export class LinksController {
  constructor(private linksService: LinksService) {}

  @Post('links')
  async createLink(@Body() createLinkDto: CreateLinkDto): Promise<LinkDto> {
    return this.linksService.createLink(createLinkDto);
  }

  @Get(':urlHash')
  redirectToOriginalUrl(@Param('urlHash') urlHash: string, @Res() res: Response): void {
    this.linksService.redirectToOriginalUrl(urlHash, res);
  }

  @Delete(':urlHash')
  async deleteShortUrl(@Param('urlHash') urlHash: string, @Res() res: Response): Promise<void> {
    return this.linksService.deleteShortUrl(urlHash, res);
  }

  @Put(':urlHash')
  async updateLink(@Param('urlHash') urlHash: string, @Body() updateLinkDto: CreateLinkDto): Promise<LinkDto> {
    return this.linksService.updateLink(urlHash, updateLinkDto);
  }
  
}
