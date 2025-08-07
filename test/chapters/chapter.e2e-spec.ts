import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/common/services/prisma.service';
import { SeedingService } from '../../src/common/services/seeding.service';

describe('ChapterController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let seedingService: SeedingService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    seedingService = moduleFixture.get<SeedingService>(SeedingService);

    await app.init();
  });

  beforeEach(async () => {
    // Clear database and seed with test data
    await seedingService.clear();
    await seedingService.seed();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('/api/v1/chapters (GET)', () => {
    it('should return all chapters', () => {
      return request(app.getHttpServer())
        .get('/api/v1/chapters')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('title');
          expect(res.body[0]).toHaveProperty('chapterNumberArabic');
        });
    });

    it('should return chapters ordered by orderInConfession', () => {
      return request(app.getHttpServer())
        .get('/api/v1/chapters')
        .expect(200)
        .expect((res) => {
          const chapters = res.body;
          for (let i = 1; i < chapters.length; i++) {
            expect(chapters[i].orderInConfession).toBeGreaterThanOrEqual(
              chapters[i - 1].orderInConfession,
            );
          }
        });
    });
  });

  describe('/api/v1/chapters/:id (GET)', () => {
    it('should return a specific chapter', async () => {
      // First get all chapters to find an ID
      const chaptersResponse = await request(app.getHttpServer())
        .get('/api/v1/chapters')
        .expect(200);

      const chapterId = chaptersResponse.body[0].id;

      return request(app.getHttpServer())
        .get(`/api/v1/chapters/${chapterId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', chapterId);
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('chapterNumberArabic');
        });
    });

    it('should return 404 for non-existent chapter', () => {
      return request(app.getHttpServer())
        .get('/api/v1/chapters/nonexistent-id')
        .expect(404);
    });
  });

  describe('/api/v1/chapters/:id/paragraphs (GET)', () => {
    it('should return chapter with paragraphs and proof texts', async () => {
      // First get all chapters to find an ID
      const chaptersResponse = await request(app.getHttpServer())
        .get('/api/v1/chapters')
        .expect(200);

      const chapterId = chaptersResponse.body[0].id;

      return request(app.getHttpServer())
        .get(`/api/v1/chapters/${chapterId}/paragraphs`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', chapterId);
          expect(res.body).toHaveProperty('paragraphs');
          expect(Array.isArray(res.body.paragraphs)).toBe(true);

          if (res.body.paragraphs.length > 0) {
            const paragraph = res.body.paragraphs[0];
            expect(paragraph).toHaveProperty('id');
            expect(paragraph).toHaveProperty('text');
            expect(paragraph).toHaveProperty('proofTextAnchors');
            expect(Array.isArray(paragraph.proofTextAnchors)).toBe(true);
          }
        });
    });

    it('should return 404 for non-existent chapter with paragraphs', () => {
      return request(app.getHttpServer())
        .get('/api/v1/chapters/nonexistent-id/paragraphs')
        .expect(404);
    });
  });

  describe('/api/v1/chapters/count (GET)', () => {
    it('should return total count of chapters', () => {
      return request(app.getHttpServer())
        .get('/api/v1/chapters/count')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('count');
          expect(typeof res.body.count).toBe('number');
          expect(res.body.count).toBeGreaterThan(0);
        });
    });
  });

  describe('/api/v1/chapters (POST)', () => {
    it('should create a new chapter', () => {
      const newChapter = {
        title: 'Test Chapter',
        chapterNumberArabic: 999,
        orderInConfession: 999,
        confessionId: 'conf_1', // This should exist from seeding
      };

      return request(app.getHttpServer())
        .post('/api/v1/chapters')
        .send(newChapter)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(newChapter.title);
          expect(res.body.chapterNumberArabic).toBe(
            newChapter.chapterNumberArabic,
          );
        });
    });

    it('should return 400 for invalid data', () => {
      const invalidChapter = {
        title: '', // Invalid: empty title
        chapterNumberArabic: -1, // Invalid: negative number
        orderInConfession: 999,
        confessionId: 'conf_1',
      };

      return request(app.getHttpServer())
        .post('/api/v1/chapters')
        .send(invalidChapter)
        .expect(400);
    });
  });
});
