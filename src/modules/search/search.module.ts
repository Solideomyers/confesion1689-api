import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { FullTextSearch, ScriptureReferenceSearch } from './search.strategy';
import { PrismaService } from '../../common/services/prisma.service';

@Module({
  controllers: [SearchController],
  providers: [
    SearchService,
    FullTextSearch,
    ScriptureReferenceSearch,
    PrismaService,
  ],
  exports: [SearchService],
})
export class SearchModule {}
