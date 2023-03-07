import { useRouter } from "next/router";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { Review } from "@prisma/client";

interface Props {
  name: string;
  reviews?: Review[];
}

const Product = ({
  name,
  reviews,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div className="p-16">
      <span>Product {name}</span>
      <ul className="mt-6 list-disc">
        {reviews?.map((review) => (
          <li>{review.text}</li>
        ))}
      </ul>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({
  req,
  res,
  query,
}) => {
  // @ts-ignore
  const ctx = await createTRPCContext({ req, res });
  const id = query.id as string;

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: ctx,
  });

  const product = await ssg.reviews.getProductInProductPage.fetch({
    id,
  });

  return {
    props: {
      name: product?.name as string,
      reviews: JSON.parse(JSON.stringify(product?.reviews)),
    },
  };
};

export default Product;
