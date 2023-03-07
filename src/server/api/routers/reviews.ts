import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { Configuration, OpenAIApi } from "openai";
import { env } from "~/env.mjs";
import { TRPCError } from "@trpc/server";
import mountSpecificPrompt from "~/utils/mountSpecificPromp";
import mountGenericPrompt from "~/utils/mountGenericPrompt";

interface OpenAIReviewsResponse {
  reviews: string[];
}

export const reviewsRouter = createTRPCRouter({
  requestReviews: protectedProcedure
    .input(
      z.object({
        description: z.string(),
        name: z.string(),
        reviewRequests: z.array(
          z.object({
            type: z.enum(["specific", "generic"]),
            amount: z.number(),
            lowerCase: z.boolean(),
            emojis: z.boolean(),
            hashtags: z.boolean(),
          })
        ),
      })
    )
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

      void reviewsRouter
        .createCaller({ prisma: ctx.prisma, session: ctx.session })
        .processReviews({
          id: product.id,
          reviewRequests: input.reviewRequests,
        });

      return {
        id: product.id,
      };
    }),

  processReviews: publicProcedure
    .input(
      z.object({
        id: z.string(),
        reviewRequests: z.array(
          z.object({
            type: z.enum(["specific", "generic"]),
            amount: z.number(),
            lowerCase: z.boolean(),
            emojis: z.boolean(),
            hashtags: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const product = await prisma.product.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const configuration = new Configuration({
        apiKey: env.OPEN_AI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      await Promise.allSettled(
        Array.from(input.reviewRequests).map(
          (reviewRequest) =>
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            new Promise(async () => {
              try {
                const response = await openai.createCompletion({
                  model: "text-davinci-003",
                  prompt:
                    reviewRequest.type === "specific"
                      ? mountSpecificPrompt({
                          productDescription: product.description,
                          emojis: reviewRequest.emojis,
                          hashtags: reviewRequest.hashtags,
                          lowerCase: reviewRequest.lowerCase,
                          amount: reviewRequest.amount,
                        })
                      : mountGenericPrompt({
                          emojis: reviewRequest.emojis,
                          hashtags: reviewRequest.hashtags,
                          lowerCase: reviewRequest.lowerCase,
                          amount: reviewRequest.amount,
                        }),
                  max_tokens: 2000,
                  temperature: 1,
                });

                if (!response.data.choices[0]?.text) {
                  throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "OpenAI API error",
                  });
                }

                const reviews = JSON.parse(
                  response.data.choices[0].text
                ) as OpenAIReviewsResponse;

                await prisma.product.update({
                  where: {
                    id: input.id,
                  },
                  data: {
                    reviews: {
                      create: reviews.reviews.map((review) => {
                        return {
                          text: review,
                        };
                      }),
                    },
                    isReviewsProcessing: false,
                  },
                });
              } catch (err) {
                console.log(err);
              }
            })
        )
      );
    }),

  getProductInProductPage: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.product.findUnique({
        where: {
          id: input.id,
        },
        include: {
          reviews: true,
        },
      });
    }),
});
