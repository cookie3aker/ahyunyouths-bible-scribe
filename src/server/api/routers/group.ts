import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { group } from "~/server/db/schema";

export const groupRouter = createTRPCRouter({
  getGroups: publicProcedure.query(async ({ ctx }) => {
    const groups = await ctx.db.query.group.findMany({
      orderBy: (group, { asc }) => [asc(group.group_id)],
    });
    return groups;
  }),
})