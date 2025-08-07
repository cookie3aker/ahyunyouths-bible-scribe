import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { group } from "~/server/db/schema";

export const groupRouter = createTRPCRouter({
  getGroups: protectedProcedure.query(async ({ ctx }) => {
    const groups = await ctx.db.query.group.findMany({
      orderBy: (group, { asc }) => [asc(group.group_id)],
    });
    return groups;
  }),
});
