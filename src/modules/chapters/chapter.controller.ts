import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { ChapterService } from './chapter.service';
import {
  Chapter,
  CreateChapterDto,
  UpdateChapterDto,
  ChapterWithParagraphs,
} from '../../common/schemas/chapter.schema';

@ApiTags('Chapters')
@Controller('chapters')
@UseInterceptors(CacheInterceptor)
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chapter' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        chapterNumberArabic: { type: 'number' },
        orderInConfession: { type: 'number' },
        confessionId: { type: 'string' },
      },
      required: ['title', 'orderInConfession', 'confessionId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Chapter created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        chapterNumberArabic: { type: 'number' },
        orderInConfession: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or order conflict',
  })
  async create(@Body() createChapterDto: any): Promise<any> {
    return this.chapterService.create(createChapterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all chapters' })
  @ApiResponse({
    status: 200,
    description: 'List of all chapters',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          chapterNumberArabic: { type: 'number' },
          orderInConfession: { type: 'number' },
        },
      },
    },
  })
  async findAll(): Promise<Chapter[]> {
    return this.chapterService.findAll();
  }

  @Get('count')
  @ApiOperation({ summary: 'Get total number of chapters' })
  @ApiResponse({
    status: 200,
    description: 'Total count of chapters',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
      },
    },
  })
  async count(): Promise<{ count: number }> {
    const count = await this.chapterService.count();
    return { count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a chapter by ID' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  @ApiResponse({
    status: 200,
    description: 'Chapter found',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        chapterNumberArabic: { type: 'number' },
        orderInConfession: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Chapter not found',
  })
  async findOne(@Param('id') id: string): Promise<Chapter> {
    return this.chapterService.findById(id);
  }

  @Get(':id/paragraphs')
  @ApiOperation({
    summary: 'Get a chapter with all its paragraphs and proof texts',
  })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  @ApiResponse({
    status: 200,
    description: 'Chapter with paragraphs and proof texts',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        chapterNumberArabic: { type: 'number' },
        orderInConfession: { type: 'number' },
        paragraphs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              text: { type: 'string' },
              paragraphLabel: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Chapter not found',
  })
  async findOneWithParagraphs(
    @Param('id') id: string,
  ): Promise<ChapterWithParagraphs> {
    return this.chapterService.findByIdWithParagraphs(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a chapter' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        chapterNumberArabic: { type: 'number' },
        orderInConfession: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Chapter updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        chapterNumberArabic: { type: 'number' },
        orderInConfession: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Chapter not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or order conflict',
  })
  async update(
    @Param('id') id: string,
    @Body() updateChapterDto: any,
  ): Promise<any> {
    return this.chapterService.update(id, updateChapterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a chapter' })
  @ApiParam({ name: 'id', description: 'Chapter ID' })
  @ApiResponse({
    status: 204,
    description: 'Chapter deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Chapter not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.chapterService.delete(id);
  }
}
