import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { postLikes, posts } from "~/server/db/schema";

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
      // Check if the user has already liked the post
      const existingLike = await ctx.db
        .select()
        .from(postLikes)
        .where(
          and(
            eq(postLikes.userId, ctx.session.user.id),
            eq(postLikes.postId, input.postId),
          ),
        )
        .limit(1);

      // If the user hasn't liked the post yet
      if (existingLike.length === 0) {
        // Insert into postLikes table
        await ctx.db.insert(postLikes).values({
          userId: ctx.session.user.id,
          postId: input.postId,
        });

        // Increment the likes count
        await ctx.db
          .update(posts)
          .set({ likes: sql`${posts.likes} + 1` })
          .where(eq(posts.id, input.postId));
      }
    }),

  getAllPosts: protectedProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.query.posts.findMany({
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

    if (!posts) return null;

    // Get all likes for the current user
    const userLikes = await ctx.db
      .select()
      .from(postLikes)
      .where(eq(postLikes.userId, ctx.session.user.id));

    // Create a Set of post IDs that the user has liked for O(1) lookup
    const userLikedPostIds = new Set(userLikes.map((like) => like.postId));

    // Add hasLiked field to each post
    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      hasLiked: userLikedPostIds.has(post.id),
    }));

    return postsWithLikeStatus;
  }),

  // 무한스크롤용 페이지네이션 (cursor 방식)
  getPostsInfinite: protectedProcedure
    .input(
      z.object({
        cursor: z.number().optional(), // 마지막 post id
        limit: z.number().optional().default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      // 최신순, cursor 이후 post만
      const posts = await ctx.db.query.posts.findMany({
        where: cursor ? (posts, { lt }) => lt(posts.id, cursor) : undefined,
        with: {
          createdBy: { columns: { name: true } },
          book: { columns: { book_name: true } },
          chapter: { columns: { chapter_number: true } },
          verse: { columns: { verse_number: true } },
        },
        orderBy: (posts, { desc }) => [desc(posts.id)],
        limit: limit + 1, // 다음 페이지 여부 확인용
      });

      if (!posts) return { posts: [], nextCursor: undefined };

      // Get all likes for the current user
      const userLikes = await ctx.db
        .select()
        .from(postLikes)
        .where(eq(postLikes.userId, ctx.session.user.id));
      const userLikedPostIds = new Set(userLikes.map((like) => like.postId));

      // Add hasLiked field to each post
      let postsWithLikeStatus = posts.map((post) => ({
        ...post,
        hasLiked: userLikedPostIds.has(post.id),
      }));

      let nextCursor: number | undefined = undefined;
      if (postsWithLikeStatus.length > limit) {
        nextCursor = postsWithLikeStatus[limit - 1]?.id;
        postsWithLikeStatus = postsWithLikeStatus.slice(0, limit);
      }

      return { posts: postsWithLikeStatus, nextCursor };
    }),
});
