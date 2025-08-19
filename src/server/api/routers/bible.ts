import { z } from "zod";
import { sql } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  bibleBook,
  bookChapterCount,
  chapterVerseCount,
  bibleChapter,
  bibleVerse,
  bibleScribe,
  group,
  chapterGroupScribeCount,
} from "~/server/db/schema";
import { challenge } from "~/policy/challenge";

export const bibleRouter = createTRPCRouter({
  getBooks: protectedProcedure.query(async ({ ctx }) => {
    const books = await ctx.db.query.bibleBook.findMany({
      orderBy: (bibleBook, { asc }) => [asc(bibleBook.book_order)],
    });
    return books;
  }),

  // 모든 성경 통계 데이터를 한번에 조회 (도서별 챕터수 + 챕터별 벌스수 + 벌스 정보)
  getBibleStatistics: protectedProcedure.query(async ({ ctx }) => {
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

    // 모든 벌스 정보 조회
    const allVerses = await ctx.db.query.bibleVerse.findMany({
      columns: {
        verse_text: false,
      },
      orderBy: (verse, { asc }) => [
        asc(verse.chapter_id),
        asc(verse.verse_number),
      ],
    });

    // chapter_id별로 벌스 그룹핑
    const versesByChapterId: Record<string, typeof allVerses> = {};
    for (const verse of allVerses) {
      const chapterId = verse.chapter_id;
      versesByChapterId[chapterId] ??= [];
      versesByChapterId[chapterId].push(verse);
    }

    // 각 챕터에 벌스 정보 추가
    const chaptersWithVerses = allChaptersWithVerseCount.map((chapter) => ({
      ...chapter,
      verses: versesByChapterId[chapter.chapter_id] ?? [],
    }));

    // book_id별로 챕터 그룹핑
    const chaptersByBookId: Record<string, typeof chaptersWithVerses> = {};
    for (const chapter of chaptersWithVerses) {
      const bookId = chapter.book_id;
      chaptersByBookId[bookId] ??= [];
      chaptersByBookId[bookId].push(chapter);
    }

    // 각 book에 chaptersWithVerseCount 대신 chaptersWithVerses 추가
    const booksWithChapters = booksWithChapterCount.map((book) => ({
      ...book,
      chaptersWithVerses: chaptersByBookId[book.book_id] ?? [],
    }));

    return booksWithChapters;
  }),

  // book_id, chapter_id, verse_id로 특정 성경 구절 조회 (bibleBook, bibleChapter 조인)
  getVerse: protectedProcedure
    .input(
      z.object({
        book_id: z.number(),
        chapter_id: z.number(),
        verse_id: z.number(),
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
            eq(bv.verse_id, input.verse_id),
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

  // 성경 필사 데이터 저장
  saveScribe: protectedProcedure
    .input(
      z.object({
        user_id: z.string(),
        group_id: z.number(),
        book_id: z.number(),
        chapter_id: z.number(),
        verse_id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { user_id, group_id, book_id, chapter_id, verse_id } = input;

      // 이미 구독한 구절인지 확인
      const existingScribe = await ctx.db.query.bibleScribe.findFirst({
        where: (bs, { and, eq }) =>
          and(
            eq(bs.user_id, user_id),
            eq(bs.group_id, group_id),
            eq(bs.book_id, book_id),
            eq(bs.chapter_id, chapter_id),
            eq(bs.verse_id, verse_id),
          ),
      });

      if (existingScribe) {
        throw new Error("이미 구독한 구절입니다.");
      }

      // 구독 데이터 삽입
      await ctx.db.insert(bibleScribe).values({
        user_id,
        group_id,
        book_id,
        chapter_id,
        verse_id,
      });
    }),

  // user_id, group_id, book_id, chapter_id, verse_id로 필사 정보 조회
  getScribe: protectedProcedure
    .input(
      z.object({
        user_id: z.string(),
        group_id: z.number(),
        book_id: z.number(),
        chapter_id: z.number(),
        verse_id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const scribe = await ctx.db.query.bibleScribe.findFirst({
        where: (bs, { and, eq }) =>
          and(
            eq(bs.user_id, input.user_id),
            eq(bs.group_id, input.group_id),
            eq(bs.book_id, input.book_id),
            eq(bs.chapter_id, input.chapter_id),
            eq(bs.verse_id, input.verse_id),
          ),
      });
      return scribe;
    }),

  // get scribe data by group_id and book_id
  getScribeByGroup: protectedProcedure
    .input(
      z.object({
        group_id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const scribes = await ctx.db.query.bibleScribe.findMany({
        where: (bs, { eq }) => eq(bs.group_id, input.group_id),
        orderBy: (bs, { asc }) => [
          asc(bs.book_id),
          asc(bs.chapter_id),
          asc(bs.verse_id),
        ],
      });

      // Group scribes by book_id
      const scribesByBook: Record<number, typeof scribes> = {};
      for (const scribe of scribes) {
        const bookId = scribe.book_id;
        scribesByBook[bookId] ??= [];
        scribesByBook[bookId].push(scribe);
      }

      return scribesByBook;
    }),

  // 모든 groupId를 키값으로 하고 GroupId에 해당하는 레코드들의 count값을 객체로 반환
  getScribeCountByGroup: protectedProcedure.query(async ({ ctx }) => {
    // 모든 group 조회
    const allGroups = await ctx.db.query.group.findMany({
      columns: {
        group_id: true,
      },
    });

    // Convert to object with group_id as key
    const countByGroup: Record<
      number,
      {
        count: number;
        total: number;
      }
    > = {};

    // 모든 그룹에 대한 완료된 챕터 수를 한 번에 조회
    const result = await ctx.db
      .select({
        group_id: chapterGroupScribeCount.group_id,
        book_id: chapterGroupScribeCount.book_id,
        chapter_id: chapterGroupScribeCount.chapter_id,
      })
      .from(chapterGroupScribeCount)
      .where(
        sql`${chapterGroupScribeCount.verse_count} = ${chapterGroupScribeCount.total_verse_count} AND ${chapterGroupScribeCount.total_verse_count} > 0`,
      );

    // 각 그룹별로 처리
    for (const group of allGroups) {
      const groupId = group.group_id;
      const challengeBooks =
        (challenge as Record<number, { books: number[] }>)[groupId]?.books ??
        [];

      // 해당 그룹의 완료된 챕터 수 계산
      const completedCount = result.filter(
        (chapter: {
          group_id: number | null;
          book_id: number;
          chapter_id: number;
        }) =>
          chapter.group_id === groupId &&
          challengeBooks.includes(chapter.book_id),
      ).length;

      countByGroup[groupId] = {
        count: completedCount,
        total:
          (challenge as Record<number, { total: number }>)[groupId]?.total ?? 0,
      };
    }

    return countByGroup;
  }),
});
