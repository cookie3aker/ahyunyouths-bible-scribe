import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { bibleBook } from "~/server/db/schema";

export const bibleRouter = createTRPCRouter({
  getBooks: publicProcedure.query(async ({ ctx }) => {
    const books = await ctx.db.query.bibleBook.findMany({
      orderBy: (bibleBook, { asc }) => [asc(bibleBook.book_name)],
    });
    return books;
  }),
})