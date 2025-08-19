import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1, "Content is required"),
        bookId: z.number().int().min(1, "Book ID is required"),
        chapterId: z.number().int().min(1, "Chapter ID is required"),
        verseId: z.number().int().min(1, "Verse ID is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        content: input.content,
        createdById: ctx.session.user.id,
        bookId: input.bookId,
        chapterId: input.chapterId,
        verseId: input.verseId,
      });
    }),

  like: protectedProcedure
    .input(
      z.object({
        postId: z.number().int().min(1, "Post ID must be a positive integer"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(posts)
        .set({ likes: sql`${posts.likes} + 1` })
        .where(eq(posts.id, input.postId));
    }),

  getAllPosts: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findMany({
      with: {
        createdBy: {
          columns: {
            name: true,
          },
        },
        book: {
          columns: {
            book_name: true,
          },
        },
        chapter: {
          columns: {
            chapter_number: true,
          },
        },
        verse: {
          columns: {
            verse_number: true,
          },
        },
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),
});
