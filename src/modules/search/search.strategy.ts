import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { SearchQuery, SearchResult } from '../../common/schemas/search.schema';

export interface SearchStrategy {
  search(query: SearchQuery): Promise<SearchResult>;
}

@Injectable()
export class FullTextSearch implements SearchStrategy {
  constructor(private prisma: PrismaService) {}

  async search(query: SearchQuery): Promise<SearchResult> {
    const { q, limit, offset, includeProofTexts } = query;

    const whereClause = {
      OR: [
        { text: { contains: q, mode: 'insensitive' as const } },
        { paragraphLabel: { contains: q, mode: 'insensitive' as const } },
        { chapter: { title: { contains: q, mode: 'insensitive' as const } } },
      ],
    };

    const includeClause = {
      chapter: {
        select: {
          id: true,
          title: true,
          chapterNumberArabic: true,
        },
      },
      ...(includeProofTexts && {
        proofTextAnchors: {
          include: {
            proofTextReferences: {
              include: {
                scriptureReference: {
                  select: {
                    fullReferenceString: true,
                  },
                },
              },
            },
          },
        },
      }),
    };

    const [paragraphs, total] = await Promise.all([
      this.prisma.paragraph.findMany({
        where: whereClause,
        include: includeClause,
        take: limit,
        skip: offset,
        orderBy: [
          { chapter: { orderInConfession: 'asc' } },
          { orderInChapter: 'asc' },
        ],
      }),
      this.prisma.paragraph.count({ where: whereClause }),
    ]);

    // Transform to match our schema
    const transformedParagraphs = paragraphs.map((paragraph) => ({
      id: paragraph.id,
      orderInChapter: paragraph.orderInChapter,
      text: paragraph.text,
      paragraphLabel: paragraph.paragraphLabel || undefined,
      chapter: {
        id: paragraph.chapter.id,
        title: paragraph.chapter.title,
        chapterNumberArabic: paragraph.chapter.chapterNumberArabic || undefined,
      },
    }));

    return {
      paragraphs: transformedParagraphs,
      total,
      limit,
      offset,
    };
  }
}

@Injectable()
export class ScriptureReferenceSearch implements SearchStrategy {
  constructor(private prisma: PrismaService) {}

  async search(query: SearchQuery): Promise<SearchResult> {
    const { q, limit, offset } = query;

    const whereClause = {
      proofTextAnchors: {
        some: {
          proofTextReferences: {
            some: {
              scriptureReference: {
                fullReferenceString: {
                  contains: q,
                  mode: 'insensitive' as const,
                },
              },
            },
          },
        },
      },
    };

    const includeClause = {
      chapter: {
        select: {
          id: true,
          title: true,
          chapterNumberArabic: true,
        },
      },
      proofTextAnchors: {
        include: {
          proofTextReferences: {
            include: {
              scriptureReference: {
                select: {
                  fullReferenceString: true,
                },
              },
            },
          },
        },
      },
    };

    const [paragraphs, total] = await Promise.all([
      this.prisma.paragraph.findMany({
        where: whereClause,
        include: includeClause,
        take: limit,
        skip: offset,
        orderBy: [
          { chapter: { orderInConfession: 'asc' } },
          { orderInChapter: 'asc' },
        ],
      }),
      this.prisma.paragraph.count({ where: whereClause }),
    ]);

    // Transform to match our schema
    const transformedParagraphs = paragraphs.map((paragraph) => ({
      id: paragraph.id,
      orderInChapter: paragraph.orderInChapter,
      text: paragraph.text,
      paragraphLabel: paragraph.paragraphLabel || undefined,
      chapter: {
        id: paragraph.chapter.id,
        title: paragraph.chapter.title,
        chapterNumberArabic: paragraph.chapter.chapterNumberArabic || undefined,
      },
    }));

    return {
      paragraphs: transformedParagraphs,
      total,
      limit,
      offset,
    };
  }
}
