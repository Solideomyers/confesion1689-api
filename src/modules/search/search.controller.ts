import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { SearchService } from './search.service';
import {
  SearchQuery,
  SearchResult,
  SearchResultSchema,
} from '../../common/schemas/search.schema';

@ApiTags('Search')
@Controller('search')
@UseInterceptors(CacheInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search paragraphs by text content',
    description:
      'Search through paragraphs, chapter titles, and paragraph labels using full-text search',
  })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiQuery({
    name: 'limit',
    description: 'Number of results to return (max 100)',
    required: false,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Number of results to skip',
    required: false,
  })
  @ApiQuery({
    name: 'includeProofTexts',
    description: 'Include proof texts in results',
    required: false,
  })
  @ApiQuery({
    name: 'strategy',
    description: 'Search strategy (fulltext or scripture)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    schema: {
      type: 'object',
      properties: {
        paragraphs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              orderInChapter: { type: 'number' },
              paragraphLabel: { type: 'string' },
              text: { type: 'string' },
              chapter: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  title: { type: 'string' },
                  chapterNumberArabic: { type: 'number' },
                },
              },
            },
          },
        },
        total: { type: 'number' },
        limit: { type: 'number' },
        offset: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid query parameters',
  })
  async search(
    @Query() query: any,
    @Query('strategy') strategy?: string,
  ): Promise<SearchResult> {
    return this.searchService.search(query, strategy);
  }

  @Get('strategies')
  @ApiOperation({ summary: 'Get available search strategies' })
  @ApiResponse({
    status: 200,
    description: 'Available search strategies',
    schema: {
      type: 'object',
      properties: {
        strategies: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  async getStrategies(): Promise<{ strategies: string[] }> {
    const strategies = await this.searchService.getAvailableStrategies();
    return { strategies };
  }
}
