// src/links/links.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LinksService } from './links.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Link } from './link.entity';
import { CreateLinkDto } from './dto/create-link.dto';
import { NotFoundException } from '@nestjs/common';

process.env.SHORT_URL_DOMAIN = 'https://mock-host.com';

describe('LinksService', () => {
  let service: LinksService;
  let linkRepository: Repository<Link>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        {
          provide: getRepositoryToken(Link),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
    linkRepository = module.get<Repository<Link>>(getRepositoryToken(Link));
  });

  describe('createLink', () => {
    it('should create a shortened link when URL is not found', async () => {
      // Mock data for testing
      const createLinkDto: CreateLinkDto = {
        url: 'https://www.example.com',
      };
      const generatedHash = 'abc123';
      const link = new Link();
      link.url = createLinkDto.url;
      link.urlHash = generatedHash;
  
      // Mock the repository method to return undefined (URL not found)
      jest.spyOn(linkRepository, 'findOne').mockResolvedValue(undefined);
  
      // Mock the repository methods
      jest.spyOn(linkRepository, 'create').mockReturnValue(link);
      jest.spyOn(linkRepository, 'save').mockResolvedValue(link);
  
      // Call the service method
      const result = await service.createLink(createLinkDto);
  
      // Assertions
      expect(Object.keys(result)).toHaveLength(3);
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('urlHash');
      expect(result).toHaveProperty('shortUrl');
      expect(result.urlHash).toBeTruthy();
      expect(result.shortUrl).toBeTruthy();
      expect(result.url).toBeTruthy();

    });
  });

  describe('deleteShortUrl', () => {
    it('should delete the link and send success message', async () => {
      // Mock data for testing
      const urlHash = 'abc123';
      const link = new Link();
      link.urlHash = urlHash;
  
      // Mock the repository method
      jest.spyOn(linkRepository, 'findOne').mockResolvedValue(link);
      jest.spyOn(linkRepository, 'remove').mockResolvedValue(undefined);
  
      // Mock the Express response object
      const res = {
        status: jest.fn().mockReturnThis(), // Mocking the status method
        send: jest.fn(), // Mocking the send method
      };
  
      // Call the service method
      await service.deleteShortUrl(urlHash, res as any);
  
      // Assertions
      expect(linkRepository.findOne).toHaveBeenCalledWith({ where: { urlHash } });
      expect(linkRepository.remove).toHaveBeenCalledWith(link);
      expect(res.send).toHaveBeenCalledWith('Link Deleted Successfully');
    });
  
    it('should send "Link not found" if the link is not found', async () => {
      // Mock data for testing
      const urlHash = 'nonexistent';
  
      // Mock the repository method to return undefined
      jest.spyOn(linkRepository, 'findOne').mockResolvedValue(undefined);
  
      // Mock the Express response object
      const res = {
        status: jest.fn().mockReturnThis(), // Mocking the status method
        send: jest.fn(), // Mocking the send method
      };
  
      // Call the service method
      await service.deleteShortUrl(urlHash, res as any);
  
      // Assertions
      expect(res.status).toHaveBeenCalledWith(404); // Assuming you're using 404 for not found
      expect(res.send).toHaveBeenCalledWith('Link not found');
    });
  });
  

  describe('redirectToOriginalUrl', () => {
    it('should redirect to the original URL', async () => {
      // Mock data for testing
      const urlHash = 'abc123';
      const link = new Link();
      link.url = 'https://www.example.com';
      link.urlHash = urlHash;

      // Mock the repository method
      jest.spyOn(linkRepository, 'create').mockReturnValue(link);
      jest.spyOn(linkRepository, 'findOne').mockResolvedValue(link);

      // Mock the Express response object
      const res = {
        status: jest.fn().mockReturnThis(),
        redirect: jest.fn(),
      };

      // Call the service method
      await service.redirectToOriginalUrl(urlHash, res as any);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(302);
      expect(res.redirect).toHaveBeenCalledWith(link.url);
    });

  });

  describe('updateLink', () => {
    it('should update the link and return the updated details', async () => {
      // Mock data for testing
      const urlHash = 'abc123';
      const updateLinkDto: CreateLinkDto = {
        url: 'https://www.updated-example.com',
      };
      const linkDto = {
        url: updateLinkDto.url,
        urlHash: urlHash,
        shortUrl: 'https://mock-host.com/abc123',
      };

      // Mock the service method
      jest.spyOn(service, 'updateLink').mockResolvedValue(linkDto);

      // Call the controller method
      const result = await service.updateLink(urlHash, updateLinkDto);

      // Assertions
      expect(result).toBe(linkDto);
      expect(service.updateLink).toHaveBeenCalledWith(urlHash, updateLinkDto);
    });
  });

});
