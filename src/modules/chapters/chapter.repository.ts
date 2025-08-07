import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import {
  Chapter,
  ChapterWithParagraphs,
} from '../../common/schemas/chapter.schema';

@Injectable()
export class ChapterRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Chapter[]> {
    const results = await this.prisma.chapter.findMany({
      orderBy: { orderInConfession: 'asc' },
    });

    return results.map((result) => ({
      ...result,
      isIntroduction: result.isINtroduction,
    })) as Chapter[];
  }

  async findById(id: string): Promise<Chapter | null> {
    const result = await this.prisma.chapter.findUnique({
      where: { id },
    });

    if (!result) return null;

    return {
      ...result,
      isIntroduction: result.isINtroduction,
    } as Chapter;
  }

  async findByIdWithParagraphs(
    id: string,
  ): Promise<ChapterWithParagraphs | null> {
    const result = await this.prisma.chapter.findUnique({
      where: { id },
      include: {
        paragraphs: {
          orderBy: { orderInChapter: 'asc' },
          include: {
            proofTextAnchors: {
              orderBy: { orderInParagraph: 'asc' },
              include: {
                proofTextReferences: {
                  orderBy: { orderForAnchor: 'asc' },
                  include: {
                    scriptureReference: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!result) return null;

    // Transform to match our schema
    return {
      ...result,
      isIntroduction: result.isINtroduction,
    } as ChapterWithParagraphs;
  }

  async findByConfessionId(confessionId: string): Promise<Chapter[]> {
    const results = await this.prisma.chapter.findMany({
      where: { confessionId },
      orderBy: { orderInConfession: 'asc' },
    });

    return results.map((result) => ({
      ...result,
      isIntroduction: result.isINtroduction,
    })) as Chapter[];
  }

  async create(
    data: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Chapter> {
    const result = await this.prisma.chapter.create({
      data: {
        ...data,
        isINtroduction: (data as any).isIntroduction || false,
      },
    });

    return {
      ...result,
      isIntroduction: result.isINtroduction,
    } as Chapter;
  }

  async update(
    id: string,
    data: Partial<Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Chapter> {
    const updateData: any = { ...data };
    if ((data as any).isIntroduction !== undefined) {
      updateData.isINtroduction = (data as any).isIntroduction;
      delete updateData.isIntroduction;
    }

    const result = await this.prisma.chapter.update({
      where: { id },
      data: updateData,
    });

    return {
      ...result,
      isIntroduction: result.isINtroduction,
    } as Chapter;
  }

  async delete(id: string): Promise<Chapter> {
    const result = await this.prisma.chapter.delete({
      where: { id },
    });

    return {
      ...result,
      isIntroduction: result.isINtroduction,
    } as Chapter;
  }

  async count(): Promise<number> {
    return this.prisma.chapter.count();
  }
}
