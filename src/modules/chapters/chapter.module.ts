import { Module } from '@nestjs/common';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';
import { ChapterRepository } from './chapter.repository';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [ChapterController],
  providers: [ChapterService, ChapterRepository, PrismaService],
  exports: [ChapterService, ChapterRepository],
})
export class ChapterModule {}
