// src/links/links.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './link.entity';
import { LinkDto } from './dto/link.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { generate } from 'short-uuid';
import { Response } from 'express';

@Injectable()
export class LinksService {
  constructor(
    @InjectRepository(Link)
    private readonly linkRepository: Repository<Link>,
  ) {}

  // Creates a shortened link based on the provided DTO
  async createLink(createLinkDto: CreateLinkDto): Promise<LinkDto> {
    // Check if a link with the same URL already exists in the database
    let link = await this.linkRepository.findOne({ where: { url: createLinkDto.url } });
  
    // If the link doesn't exist, create a new one
    if (!link) {
      const urlHash = generate(); // Generate a unique short URL hash
      link = this.linkRepository.create({ ...createLinkDto, urlHash });
      await this.linkRepository.save(link); // Save the link to the database
    }
  
    // Construct the short URL and return link details
    const shortUrl = `${process.env.SHORT_URL_DOMAIN}/${link.urlHash}`;
    return { url: link.url, urlHash: link.urlHash, shortUrl };
  }

  // Redirects to the original URL based on the provided short URL hash
  async redirectToOriginalUrl(urlHash: string, res: Response): Promise<void> {
    const link = await this.linkRepository.findOne({ where: { urlHash } });

    // If the link doesn't exist, send a response indicating that the link was not found
    if (!link) {
      res.status(404);
      res.send('Link not found');
      return;
    }

    // Redirect to the original URL with a 302 Found status
    res.status(302);
    res.redirect(link.url);
  }

  // Deletes a shortened link based on the provided short URL hash
  async deleteShortUrl(urlHash: string, res: Response): Promise<void> {
    const link = await this.linkRepository.findOne({ where: { urlHash } });

    // If the link doesn't exist, send a response indicating that the link was not found
    if (!link) {
      res.status(404);
      res.send('Link not found');
      return;
    }
    // Remove the link from the database and send a success response
    await this.linkRepository.remove(link);
    res.send('Link Deleted Successfully');
  }
  
  // Updates a shortened link based on the provided short URL hash and DTO
  async updateLink(urlHash: string, updateLinkDto: CreateLinkDto): Promise<LinkDto> {
    const link = await this.linkRepository.findOne({ where: { urlHash } });

    // If the link doesn't exist, return early (no update possible)
    if (!link) {
      return;
    }

    // Update the link with the new data
    link.url = updateLinkDto.url || link.url; // Update URL if provided, otherwise keep the existing one

    // Save the updated link to the database
    const updatedLink = await this.linkRepository.save(link);

    // Construct the short URL and return the updated link details
    const shortUrl = `${process.env.SHORT_URL_DOMAIN}/${link.urlHash}`;
    return { url: updatedLink.url, urlHash: updatedLink.urlHash, shortUrl };
  }
}
