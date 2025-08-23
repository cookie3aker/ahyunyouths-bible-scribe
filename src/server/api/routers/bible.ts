import { z } from "zod";
import { sql, inArray } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  bookChapterCount,
  chapterVerseCount,
  bibleScribe,
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
  // optional: 특정 book_ids만 필터링하여 반환
  getBibleStatistics: protectedProcedure
    .input(
      z
        .object({
          book_ids: z.array(z.number()).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const filterBookIds = input?.book_ids?.length
        ? new Set(input.book_ids)
        : null;
      // 빈 배열이 들어온 경우 바로 반환
      if (input?.book_ids?.length === 0) return [];

      // 도서별 총 챕터수 조회 (필터 적용)
      const booksWithChapterCount = await ctx.db
        .select()
        .from(bookChapterCount)
        .where(
          filterBookIds
            ? inArray(bookChapterCount.book_id, Array.from(filterBookIds))
            : undefined,
        )
        .orderBy(bookChapterCount.book_order);

      // 모든(or filtered) 챕터별 총 벌스수 조회
      const allChaptersWithVerseCount = await ctx.db
        .select()
        .from(chapterVerseCount)
        .where(
          filterBookIds
            ? inArray(chapterVerseCount.book_id, Array.from(filterBookIds))
            : undefined,
        )
        .orderBy(chapterVerseCount.book_id, chapterVerseCount.chapter_number);

      // 필요한 챕터 id 집합 (필터가 있는 경우 제한된 범위만)
      const neededChapterIds = new Set(
        allChaptersWithVerseCount.map((c) => c.chapter_id),
      );

      // 벌스 정보 (필터 있으면 관련 챕터만 조회)
      const allVerses = await ctx.db.query.bibleVerse.findMany({
        where: (bv, { inArray: inArr }) =>
          neededChapterIds.size
            ? inArr(bv.chapter_id, Array.from(neededChapterIds))
            : undefined,
        columns: { verse_text: false },
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
      let booksWithChapters = booksWithChapterCount.map((book) => ({
        ...book,
        chaptersWithVerses: chaptersByBookId[book.book_id] ?? [],
      }));

      // 필터 적용 (optional)
      if (filterBookIds) {
        booksWithChapters = booksWithChapters.filter((b) =>
          filterBookIds.has(b.book_id),
        );
      }
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

  // 모든 챕터/벌스가 필사된 book_id 리스트 반환
  getScribeCompletedBooks: protectedProcedure.query(async ({ ctx }) => {
    // 1. 각 책의 모든 챕터/벌스 조합 개수 집계
    const bookVerseCounts = await ctx.db
      .select({
        book_id: sql<number>`c.book_id`,
        total: sql<number>`COUNT(v.verse_id)`,
      })
      .from(sql`bible_chapter c`)
      .leftJoin(sql`bible_verse v`, sql`c.chapter_id = v.chapter_id`)
      .groupBy(sql`c.book_id`);

    // 2. bible_scribe에 저장된 챕터/벌스 조합 개수 집계
    const scribeVerseCounts = await ctx.db
      .select({
        book_id: sql<number>`book_id`,
        count: sql<number>`COUNT(*)`,
      })
      .from(sql`bible_scribe`)
      .groupBy(sql`book_id`);

    // 3. 모두 일치하는 book_id만 반환
    const completedBookIds = bookVerseCounts
      .filter((book) => {
        const scribe = scribeVerseCounts.find(
          (s) => s.book_id === book.book_id,
        );
        return scribe && scribe.count === book.total;
      })
      .map((book) => book.book_id);

    return completedBookIds;
  }),

  // chapter_id로 해당 챕터의 모든 verse_id 리스트 반환
  getVerseIdsByChapterId: protectedProcedure
    .input(
      z.object({
        chapter_id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const verses = await ctx.db.query.bibleVerse.findMany({
        where: (bv, { eq }) => eq(bv.chapter_id, input.chapter_id),
        columns: { verse_id: true },
        orderBy: (bv, { asc }) => [asc(bv.verse_number)],
      });
      return verses.map((v) => v.verse_id);
    }),
});
