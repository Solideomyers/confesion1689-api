import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ChapterRepository } from './chapter.repository';
import {
  Chapter,
  ChapterWithParagraphs,
  CreateChapterDto,
  UpdateChapterDto,
} from '../../common/schemas/chapter.schema';

@Injectable()
export class ChapterService {
  constructor(
    private chapterRepository: ChapterRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(): Promise<Chapter[]> {
    const cacheKey = 'chapters:all';
    const cached = await this.cacheManager.get<Chapter[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const chapters = await this.chapterRepository.findAll();
    await this.cacheManager.set(cacheKey, chapters, 300); // 5 minutes cache

    return chapters;
  }

  async findById(id: string): Promise<Chapter> {
    const cacheKey = `chapter:${id}`;
    const cached = await this.cacheManager.get<Chapter>(cacheKey);

    if (cached) {
      return cached;
    }

    const chapter = await this.chapterRepository.findById(id);
    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, chapter, 300);
    return chapter;
  }

  async findByIdWithParagraphs(id: string): Promise<ChapterWithParagraphs> {
    const cacheKey = `chapter:${id}:with-paragraphs`;
    const cached = await this.cacheManager.get<ChapterWithParagraphs>(cacheKey);

    if (cached) {
      return cached;
    }

    const chapter = await this.chapterRepository.findByIdWithParagraphs(id);
    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    await this.cacheManager.set(cacheKey, chapter, 300);
    return chapter;
  }

  async create(createChapterDto: CreateChapterDto): Promise<Chapter> {
    // Validate that the order is unique within the confession
    const existingChapter = await this.chapterRepository.findByConfessionId(
      createChapterDto.confessionId,
    );
    const hasOrderConflict = existingChapter.some(
      (chapter) =>
        chapter.orderInConfession === createChapterDto.orderInConfession,
    );

    if (hasOrderConflict) {
      throw new BadRequestException(
        `Order ${createChapterDto.orderInConfession} already exists in this confession`,
      );
    }

    const chapter = await this.chapterRepository.create(createChapterDto);

    // Invalidate cache
    await this.cacheManager.del('chapters:all');

    return chapter;
  }

  async update(
    id: string,
    updateChapterDto: UpdateChapterDto,
  ): Promise<Chapter> {
    const existingChapter = await this.chapterRepository.findById(id);
    if (!existingChapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    // If order is being updated, check for conflicts
    if (
      updateChapterDto.orderInConfession &&
      updateChapterDto.orderInConfession !== existingChapter.orderInConfession
    ) {
      const existingChapterWithOrder =
        await this.chapterRepository.findByConfessionId(
          existingChapter.confessionId,
        );
      const hasOrderConflict = existingChapterWithOrder.some(
        (chapter) =>
          chapter.id !== id &&
          chapter.orderInConfession === updateChapterDto.orderInConfession,
      );

      if (hasOrderConflict) {
        throw new BadRequestException(
          `Order ${updateChapterDto.orderInConfession} already exists in this confession`,
        );
      }
    }

    const chapter = await this.chapterRepository.update(id, updateChapterDto);

    // Invalidate cache
    await this.cacheManager.del(`chapter:${id}`);
    await this.cacheManager.del(`chapter:${id}:with-paragraphs`);
    await this.cacheManager.del('chapters:all');

    return chapter;
  }

  async delete(id: string): Promise<void> {
    const chapter = await this.chapterRepository.findById(id);
    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    await this.chapterRepository.delete(id);

    // Invalidate cache
    await this.cacheManager.del(`chapter:${id}`);
    await this.cacheManager.del(`chapter:${id}:with-paragraphs`);
    await this.cacheManager.del('chapters:all');
  }

  async count(): Promise<number> {
    const cacheKey = 'chapters:count';
    const cached = await this.cacheManager.get<number>(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    const count = await this.chapterRepository.count();
    await this.cacheManager.set(cacheKey, count, 600); // 10 minutes cache

    return count;
  }
}
