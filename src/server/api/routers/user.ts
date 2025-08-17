import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const userRouter = createTRPCRouter({
  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").optional(),
        groupId: z
          .number()
          .int()
          .min(1, "Group ID must be a positive integer")
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: Partial<typeof input> = {};
      if (input.name) updateData.name = input.name;
      if (input.groupId) updateData.groupId = input.groupId;

      await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.session.user.id));

      return { success: true };
    }),
});
