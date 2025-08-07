import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        groupId: z.number().int().min(1, "Group ID must be a positive integer"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, groupId } = input;

      await ctx.db
        .update(users)
        .set({ name, groupId })
        .where(eq(users.id, ctx.session.user.id));

      return { success: true };
    }),
});
