import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();

  const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const requestReviews = api.reviews.requestReviews.useMutation({
    onSuccess: (data) => router.push(`/product/${data.id}`),
  });

  return (
    <div className="flex flex-col items-center">
      <b className="text-5xl">Fantom</b>
      <button
        className="w-32 bg-blue-200 p-2"
        onClick={() => {
          signIn("google");
        }}
      >
        Login
      </button>

      <form
        className="my-6 flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.target as HTMLFormElement);
          const data = Object.fromEntries(formData.entries());

          requestReviews.mutate({
            description: data.description as string,
            name: data.name as string,
          });
        }}
      >
        <label className="mb-2" htmlFor="name">
          Escreva o nome do seu produto
        </label>
        <input name="name" id="name" className="border-2 border-black" />
        <label className="mb-2" htmlFor="description">
          Descreva o seu produto com os mais detalhes possíveis
        </label>
        <textarea
          name="description"
          id="description"
          className="border-2 border-black"
        />
        <button className="mt-4 bg-red-200 p-2">Enviar</button>
      </form>
    </div>
  );
};

export default Home;
