import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  bibleBook,
  bookChapterCount,
  chapterVerseCount,
  bibleChapter,
  bibleVerse,
} from "~/server/db/schema";

export const bibleRouter = createTRPCRouter({
  getBooks: publicProcedure.query(async ({ ctx }) => {
    const books = await ctx.db.query.bibleBook.findMany({
      orderBy: (bibleBook, { asc }) => [asc(bibleBook.book_order)],
    });
    return books;
  }),

  // 모든 성경 통계 데이터를 한번에 조회 (도서별 챕터수 + 챕터별 벌스수)
  getBibleStatistics: publicProcedure.query(async ({ ctx }) => {
    // 도서별 총 챕터수 조회
    const booksWithChapterCount = await ctx.db
      .select()
      .from(bookChapterCount)
      .orderBy(bookChapterCount.book_order);

    // 모든 챕터별 총 벌스수 조회
    const allChaptersWithVerseCount = await ctx.db
      .select()
      .from(chapterVerseCount)
      .orderBy(chapterVerseCount.book_id, chapterVerseCount.chapter_number);

    // book_id별로 챕터별 벌스수 그룹핑
    const chaptersByBookId: Record<string, typeof allChaptersWithVerseCount> =
      {};

    for (const chapter of allChaptersWithVerseCount) {
      const bookId = chapter.book_id;
      chaptersByBookId[bookId] ??= [];
      chaptersByBookId[bookId].push(chapter);
    }

    // 각 book에 chaptersWithVerseCount 추가
    const booksWithChapters = booksWithChapterCount.map((book) => ({
      ...book,
      chaptersWithVerseCount: chaptersByBookId[book.book_id] ?? [],
    }));

    return booksWithChapters;
  }),

  // book_id, chapter_number, verse_number로 특정 성경 구절 조회 (bibleBook, bibleChapter 조인)
  getVerse: publicProcedure
    .input(
      z.object({
        book_id: z.number(),
        chapter_id: z.number(),
        verse_number: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // 1. 해당 book/chapter 찾기
      const chapter = await ctx.db.query.bibleChapter.findFirst({
        where: (bc, { eq, and }) =>
          and(
            eq(bc.book_id, input.book_id),
            eq(bc.chapter_id, input.chapter_id),
          ),
      });
      if (!chapter) return null;

      // 2. 해당 verse 찾기
      const verse = await ctx.db.query.bibleVerse.findFirst({
        where: (bv, { eq, and }) =>
          and(
            eq(bv.chapter_id, chapter.chapter_id),
            eq(bv.verse_number, input.verse_number),
          ),
      });
      if (!verse) return null;

      // 3. book 정보
      const book = await ctx.db.query.bibleBook.findFirst({
        where: (bb, { eq }) => eq(bb.book_id, input.book_id),
      });

      return {
        book,
        chapter,
        verse,
      };
    }),
});
