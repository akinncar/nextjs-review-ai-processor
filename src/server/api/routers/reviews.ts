import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { Configuration, OpenAIApi } from "openai";
import { env } from "~/env.mjs";

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
    .mutation(async ({ input }) => {
      const product = await prisma.product.findUnique({
        where: {
          id: input.id,
        },
      });

      const configuration = new Configuration({
        apiKey: env.OPEN_AI_API_KEY,
      });
      const openai = new OpenAIApi(configuration);

      await Promise.allSettled(
        Array.from({ length: 1 }).map(
          (item) =>
            new Promise(async (resolve, reject) => {
              try {
                const response = await openai.createCompletion({
                  model: "text-davinci-003",
                  prompt: `
                    I want you to generate generic positive and glowing casual social media-style product reviews. Please use the following details:
          
                    Product name or key features: ${product?.description}
                    Number of reviews: 10
                    Include Emojis flag: no
                    Include Hashtags flag: no
          
                    The task is to create the specified number of reviews that highlight
                    the product's strongest points and benefits. The reviews should be
                    brief, sound like they were written by real people using casual 
                    language, and not perfect English, and you also need to not 
                    capitalize any word and not use punctuation. You can also vary 
                    the length of the reviews and make them sound like they were 
                    written by different people (e.g. an 18-year-old male, a 
                    40-year-old female, or a 75-year-old woman). You should NOT mention
                    the name of the product on the reviews. If the Include Emojis flag 
                    is set to yes, then the reviews should include appropriate emojis. 
                    If the Include Emojis flag is set to no, then the reviews should not 
                    include emojis. If the Include Hashtags flag is set to yes, then the 
                    reviews should include appropriate hashtags. If the Include Hashtags 
                    flag is set to no, then the reviews should not include hashtags. 
                    Give me the answer in the following 
                    JSON format: { "reviews": [<review: string>, <review: string>,<review: string>] }. 
                    Please only respond with the JSON, without any additional 
                    explanations or words.
                  `,
                  max_tokens: 2000,
                  temperature: 1,
                });

                const reviews = JSON.parse(response.data.choices[0]?.text!);

                await prisma.product.update({
                  where: {
                    id: input.id,
                  },
                  data: {
                    reviews: {
                      create: reviews.reviews.map((review: string) => {
                        return {
                          text: review,
                        };
                      }),
                    },
                    isReviewsProcessing: false,
                  },
                });

                resolve({});
              } catch (err) {
                console.log(err);
                reject(err);
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
