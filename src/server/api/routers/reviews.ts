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
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Atue como um gerador de avaliações de produto.
         Eu irei lhe fornecer as descrições de um produto e você irá me fornecer 10 
         avaliações para esse produto, bem como uma nota para o produto de 1.0 a 5.0, aonde 
          85% das avaliações devem ser acima de 4. Diferencie radicalmente o campo ${"`review`"} de cada avaliação. Me envie o resultado em
            formato JSON, seguindo essa estrutura: { "reviews": [ "review": <text>, "rating": <number> ] }. 
            A descrição do produto é: "${product?.description}”`,
        max_tokens: 2000,
        temperature: 0.4,
      });

      console.log(response.data);

      let text = response.data.choices[0]?.text!;

      if (text.startsWith(".")) {
        text = text.substring(1);
      }

      const reviews = JSON.parse(text);
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
