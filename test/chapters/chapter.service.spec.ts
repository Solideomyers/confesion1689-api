import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/common';
import { ChapterService } from '../../src/modules/chapters/chapter.service';
import { ChapterRepository } from '../../src/modules/chapters/chapter.repository';
import { PrismaService } from '../../src/common/services/prisma.service';

describe('ChapterService', () => {
  let service: ChapterService;
  let repository: ChapterRepository;
  let cacheManager: any;

  const mockChapter = {
    id: 'ch_1',
    title: 'De las Santas Escrituras',
    chapterNumberArabic: 1,
    orderInConfession: 1,
    isIntroduction: false,
    isAppendix: false,
    confessionId: 'conf_1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChapterService,
        {
          provide: ChapterRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            findByIdWithParagraphs: jest.fn(),
            findByConfessionId: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ChapterService>(ChapterService);
    repository = module.get<ChapterRepository>(ChapterRepository);
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return chapters from cache if available', async () => {
      const cachedChapters = [mockChapter];
      mockCacheManager.get.mockResolvedValue(cachedChapters);

      const result = await service.findAll();

      expect(result).toEqual(cachedChapters);
      expect(mockCacheManager.get).toHaveBeenCalledWith('chapters:all');
      expect(repository.findAll).not.toHaveBeenCalled();
    });

    it('should fetch from repository and cache if not in cache', async () => {
      const chapters = [mockChapter];
      mockCacheManager.get.mockResolvedValue(null);
      jest.spyOn(repository, 'findAll').mockResolvedValue(chapters);

      const result = await service.findAll();

      expect(result).toEqual(chapters);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'chapters:all',
        chapters,
        300,
      );
    });
  });

  describe('findById', () => {
    it('should return chapter from cache if available', async () => {
      mockCacheManager.get.mockResolvedValue(mockChapter);

      const result = await service.findById('ch_1');

      expect(result).toEqual(mockChapter);
      expect(mockCacheManager.get).toHaveBeenCalledWith('chapter:ch_1');
    });

    it('should throw NotFoundException if chapter not found', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      jest.spyOn(repository, 'findById').mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(
        'Chapter with ID nonexistent not found',
      );
    });
  });

  describe('create', () => {
    it('should create chapter and invalidate cache', async () => {
      const createDto = {
        title: 'New Chapter',
        chapterNumberArabic: 9,
        orderInConfession: 9,
        confessionId: 'conf_1',
      };

      jest.spyOn(repository, 'findByConfessionId').mockResolvedValue([]);
      jest.spyOn(repository, 'create').mockResolvedValue(mockChapter);

      const result = await service.create(createDto);

      expect(result).toEqual(mockChapter);
      expect(mockCacheManager.del).toHaveBeenCalledWith('chapters:all');
    });

    it('should throw BadRequestException if order conflict exists', async () => {
      const createDto = {
        title: 'New Chapter',
        chapterNumberArabic: 9,
        orderInConfession: 1,
        confessionId: 'conf_1',
      };

      jest
        .spyOn(repository, 'findByConfessionId')
        .mockResolvedValue([mockChapter]);

      await expect(service.create(createDto)).rejects.toThrow(
        'Order 1 already exists in this confession',
      );
    });
  });
});
