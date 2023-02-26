import { useRouter } from "next/router";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

interface Props {
  name: string;
}

const Product = ({
  name,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { id } = router.query;

  return <div>Product {name}</div>;
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
    },
  };
};

export default Product;
