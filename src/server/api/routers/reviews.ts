import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { appRouter } from "../root";

export const reviewsRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  requestReviews: protectedProcedure
    .input(z.object({ description: z.string(), name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const product = await prisma.product.create({
        data: {
          name: input.name,
          description: input.description,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          isReviewsProcessing: true,
        },
      });

      reviewsRouter
        .createCaller({ prisma: ctx.prisma, session: ctx.session })
        .processReviews({
          id: product.id,
        });

      return {
        id: product.id,
      };
    }),

  processReviews: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async () => {
      console.log(123);
    }),

  getProductInProductPage: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.product.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
});
