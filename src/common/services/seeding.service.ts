import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { faker } from '@faker-js/faker';

@Injectable()
export class SeedingService {
  constructor(private prisma: PrismaService) {}

  async seed() {
    console.log('🌱 Starting database seeding...');

    // Create confession
    const confession = await this.prisma.confession.upsert({
      where: { title: 'Segunda Confesión de Fe de Londres (1689)' },
      update: {},
      create: {
        title: 'Segunda Confesión de Fe de Londres (1689)',
        year: 1689,
        language: 'es',
      },
    });

    console.log('✅ Confession created:', confession.title);

    // Create chapter groups
    const chapterGroups = await this.createChapterGroups(confession.id);

    // Create chapters with sample data
    const chapters = await this.createChapters(confession.id, chapterGroups);

    // Create paragraphs with proof texts
    await this.createParagraphs(chapters);

    console.log('✅ Database seeding completed successfully!');
  }

  private async createChapterGroups(confessionId: string) {
    const groups = [
      {
        name: 'Doctrina de Dios',
        order: 1,
        description: 'Capítulos sobre la naturaleza y obra de Dios',
      },
      {
        name: 'Doctrina del Hombre',
        order: 2,
        description: 'Capítulos sobre la naturaleza humana y el pecado',
      },
      {
        name: 'Doctrina de Cristo',
        order: 3,
        description: 'Capítulos sobre la persona y obra de Cristo',
      },
      {
        name: 'Doctrina de la Salvación',
        order: 4,
        description: 'Capítulos sobre la aplicación de la salvación',
      },
      {
        name: 'Doctrina de la Iglesia',
        order: 5,
        description: 'Capítulos sobre la naturaleza y gobierno de la iglesia',
      },
    ];

    const createdGroups: any[] = [];
    for (const group of groups) {
      const created = await this.prisma.chapterGroup.upsert({
        where: {
          confessionId_name: {
            confessionId,
            name: group.name,
          },
        },
        update: {},
        create: {
          ...group,
          confessionId,
        },
      });
      createdGroups.push(created);
    }

    console.log('✅ Chapter groups created');
    return createdGroups;
  }

  private async createChapters(confessionId: string, chapterGroups: any[]) {
    const chapters = [
      {
        title: 'De las Santas Escrituras',
        chapterNumberArabic: 1,
        orderInConfession: 1,
        groupIndex: 0,
      },
      {
        title: 'De Dios y de la Santa Trinidad',
        chapterNumberArabic: 2,
        orderInConfession: 2,
        groupIndex: 0,
      },
      {
        title: 'Del Decreto Eterno de Dios',
        chapterNumberArabic: 3,
        orderInConfession: 3,
        groupIndex: 0,
      },
      {
        title: 'De la Creación',
        chapterNumberArabic: 4,
        orderInConfession: 4,
        groupIndex: 1,
      },
      {
        title: 'De la Divina Providencia',
        chapterNumberArabic: 5,
        orderInConfession: 5,
        groupIndex: 1,
      },
      {
        title: 'De la Caída del Hombre, del Pecado y de su Castigo',
        chapterNumberArabic: 6,
        orderInConfession: 6,
        groupIndex: 1,
      },
      {
        title: 'Del Pacto de Dios',
        chapterNumberArabic: 7,
        orderInConfession: 7,
        groupIndex: 2,
      },
      {
        title: 'De Cristo el Mediador',
        chapterNumberArabic: 8,
        orderInConfession: 8,
        groupIndex: 2,
      },
    ];

    const createdChapters: any[] = [];
    for (const chapter of chapters) {
      const created = await this.prisma.chapter.upsert({
        where: {
          confessionId_orderInConfession: {
            confessionId,
            orderInConfession: chapter.orderInConfession,
          },
        },
        update: {},
        create: {
          title: chapter.title,
          chapterNumberArabic: chapter.chapterNumberArabic,
          orderInConfession: chapter.orderInConfession,
          confessionId,
          chapterGroupId: chapterGroups[chapter.groupIndex]?.id,
        },
      });
      createdChapters.push(created);
    }

    console.log('✅ Chapters created');
    return createdChapters;
  }

  private async createParagraphs(chapters: any[]) {
    const sampleParagraphs = [
      {
        chapterIndex: 0,
        paragraphs: [
          {
            orderInChapter: 1,
            paragraphLabel: '1.1',
            text: 'La Santa Escritura es la única regla suficiente, segura e infalible de todo conocimiento, fe y obediencia salvadora. Aunque la luz de la naturaleza y las obras de creación y providencia manifiestan la bondad, sabiduría y poder de Dios de tal manera que los hombres quedan sin excusa, sin embargo no son suficientes para dar aquel conocimiento de Dios y de su voluntad que es necesario para la salvación.',
          },
          {
            orderInChapter: 2,
            paragraphLabel: '1.2',
            text: 'Bajo el nombre de Santa Escritura, o Palabra de Dios escrita, se comprenden ahora todos los libros del Antiguo y Nuevo Testamento, que son estos:',
          },
        ],
      },
      {
        chapterIndex: 1,
        paragraphs: [
          {
            orderInChapter: 1,
            paragraphLabel: '2.1',
            text: 'El Señor nuestro Dios es un solo Dios vivo y verdadero, cuya subsistencia está en sí mismo y es de sí mismo, infinito en su ser y perfección; su esencia no puede ser comprendida por nadie sino por él mismo; es espíritu purísimo, invisible, sin cuerpo, miembros o pasiones, inmutable, inmenso, eterno, incomprensible, todopoderoso, sapientísimo, santísimo, libre y absoluto, que hace todas las cosas según el consejo de su propia voluntad inmutable y justísima, para su propia gloria.',
          },
        ],
      },
      {
        chapterIndex: 2,
        paragraphs: [
          {
            orderInChapter: 1,
            paragraphLabel: '3.1',
            text: 'Dios desde toda la eternidad, por el sabio y santo consejo de su propia voluntad, ordenó libre e inmutadamente todo lo que sucede; sin embargo, de tal manera que ni Dios es autor del pecado, ni hace violencia a la voluntad de las criaturas, ni quita la libertad o contingencia de las causas secundarias, sino que las establece.',
          },
        ],
      },
    ];

    for (const chapterData of sampleParagraphs) {
      const chapter = chapters[chapterData.chapterIndex];
      if (!chapter) continue;

      for (const paragraphData of chapterData.paragraphs) {
        const paragraph = await this.prisma.paragraph.upsert({
          where: {
            chapterId_orderInChapter: {
              chapterId: chapter.id,
              orderInChapter: paragraphData.orderInChapter,
            },
          },
          update: {},
          create: {
            ...paragraphData,
            chapterId: chapter.id,
          },
        });

        // Create sample proof text anchors and references
        await this.createProofTexts(paragraph.id);
      }
    }

    console.log('✅ Paragraphs and proof texts created');
  }

  private async createProofTexts(paragraphId: string) {
    const sampleProofTexts = [
      {
        anchorMarker: 'a',
        relevantTextSnippet: 'La Santa Escritura es la única regla suficiente',
        orderInParagraph: 1,
        references: [
          {
            reference: '2 Tim. 3:15-17',
            notes: 'La Escritura es útil para enseñanza',
          },
          { reference: 'Isa. 8:20', notes: 'A la ley y al testimonio' },
        ],
      },
      {
        anchorMarker: 'b',
        relevantTextSnippet: 'la luz de la naturaleza y las obras de creación',
        orderInParagraph: 2,
        references: [
          { reference: 'Rom. 1:19-20', notes: 'Lo que de Dios se conoce' },
          {
            reference: 'Rom. 2:14-15',
            notes: 'Los gentiles que no tienen ley',
          },
        ],
      },
    ];

    for (const proofTextData of sampleProofTexts) {
      const anchor = await this.prisma.proofTextAnchor.upsert({
        where: {
          paragraphId_orderInParagraph: {
            paragraphId,
            orderInParagraph: proofTextData.orderInParagraph,
          },
        },
        update: {},
        create: {
          paragraphId,
          anchorMarker: proofTextData.anchorMarker,
          relevantTextSnippet: proofTextData.relevantTextSnippet,
          orderInParagraph: proofTextData.orderInParagraph,
        },
      });

      for (const refData of proofTextData.references) {
        // Create or find scripture reference
        const scriptureRef = await this.prisma.scriptureReference.upsert({
          where: { fullReferenceString: refData.reference },
          update: {},
          create: {
            book: refData.reference.split(':')[0].split(' ')[0],
            chapterNumber: parseInt(
              refData.reference.split(':')[0].split(' ')[1],
            ),
            startVerse: parseInt(refData.reference.split(':')[1]),
            fullReferenceString: refData.reference,
          },
        });

        // Create proof text reference
        await this.prisma.proofTextReference.upsert({
          where: {
            proofTextAnchorId_scriptureReferenceId_orderForAnchor: {
              proofTextAnchorId: anchor.id,
              scriptureReferenceId: scriptureRef.id,
              orderForAnchor: 1,
            },
          },
          update: {},
          create: {
            proofTextAnchorId: anchor.id,
            scriptureReferenceId: scriptureRef.id,
            orderForAnchor: 1,
            contextualNotes: refData.notes,
          },
        });
      }
    }
  }

  async clear() {
    console.log('🗑️ Clearing database...');

    await this.prisma.proofTextReference.deleteMany();
    await this.prisma.proofTextAnchor.deleteMany();
    await this.prisma.paragraph.deleteMany();
    await this.prisma.chapter.deleteMany();
    await this.prisma.chapterGroup.deleteMany();
    await this.prisma.confession.deleteMany();
    await this.prisma.scriptureReference.deleteMany();

    console.log('✅ Database cleared');
  }
}
