import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useState } from "react";

interface ReviewRequests {
  type: "specific" | "generic";
  quantity: number;
  lowercase: boolean;
  emojis: boolean;
  hashtags: boolean;
}

const Home: NextPage = () => {
  const [reviewsRequested, setReviewsRequested] = useState<ReviewRequests[]>([
    {
      emojis: false,
      hashtags: false,
      lowercase: false,
      quantity: 10,
      type: "specific",
    },
  ]);
  const router = useRouter();

  const requestReviews = api.reviews.requestReviews.useMutation({
    onSuccess: (data) => router.push(`/product/${data.id}`),
  });

  return (
    <div className="flex flex-col items-center">
      <b className="text-5xl">Fantom</b>
      <button
        className="w-32 bg-blue-200 p-2"
        onClick={() => {
          void signIn("google");
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
            reviewRequests: reviewsRequested.map((reviewRequested) => ({
              emojis: reviewRequested.emojis,
              hashtags: reviewRequested.hashtags,
              lowerCase: reviewRequested.lowercase,
              amount: reviewRequested.quantity,
              type: reviewRequested.type,
            })),
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
        {reviewsRequested.map((review, index) => (
          <div className="my-3 flex items-center gap-2" key={index}>
            <select
              name="category"
              id="category"
              className="border-2 border-black p-2"
              onChange={(event) => {
                const value = event.target.value;
                const newReviewsRequested = reviewsRequested.map(
                  (review, reviewIndex) => {
                    if (reviewIndex === index) {
                      return {
                        ...review,
                        type: value as "specific" | "generic",
                      };
                    }

                    return review;
                  }
                );

                setReviewsRequested(newReviewsRequested);
              }}
            >
              <option value="specific" selected>
                Specific
              </option>
              <option value="generic">Generic</option>
            </select>
            <input
              type="number"
              max={review.type === "specific" ? 10 : 20}
              defaultValue={review.type === "specific" ? 10 : 20}
              className="w-16 border-2 border-black p-2"
              onChange={(event) => {
                const value = event.target.value;
                const newReviewsRequested = reviewsRequested.map(
                  (review, reviewIndex) => {
                    if (reviewIndex === index) {
                      return {
                        ...review,
                        quantity: Number(value),
                      };
                    }

                    return review;
                  }
                );

                setReviewsRequested(newReviewsRequested);
              }}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name={`lowercase-${index + 1}`}
                id={`lowercase-${index + 1}`}
                onChange={(event) => {
                  const value = event.target.checked;
                  const newReviewsRequested = reviewsRequested.map(
                    (review, reviewIndex) => {
                      if (reviewIndex === index) {
                        return {
                          ...review,
                          lowercase: value,
                        };
                      }

                      return review;
                    }
                  );

                  setReviewsRequested(newReviewsRequested);
                }}
              />
              <label htmlFor={`lowercase-${index + 1}`}>Lowercase</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name={`emojis-${index + 1}`}
                id={`emojis-${index + 1}`}
                onChange={(event) => {
                  const value = event.target.checked;
                  const newReviewsRequested = reviewsRequested.map(
                    (review, reviewIndex) => {
                      if (reviewIndex === index) {
                        return {
                          ...review,
                          emojis: value,
                        };
                      }

                      return review;
                    }
                  );

                  setReviewsRequested(newReviewsRequested);
                }}
              />
              <label htmlFor={`emojis-${index + 1}`}>Emojis</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name={`hashtags-${index + 1}`}
                id={`hashtags-${index + 1}`}
                onChange={(event) => {
                  const value = event.target.checked;
                  const newReviewsRequested = reviewsRequested.map(
                    (review, reviewIndex) => {
                      if (reviewIndex === index) {
                        return {
                          ...review,
                          hashtags: value,
                        };
                      }

                      return review;
                    }
                  );

                  setReviewsRequested(newReviewsRequested);
                }}
              />
              <label htmlFor={`hashtags-${index + 1}`}>Hashtags</label>
            </div>
            <button
              type="button"
              className="h-fit bg-red-200 p-2 px-3"
              onClick={() => {
                setReviewsRequested((prev) => [
                  ...prev,
                  {
                    emojis: false,
                    hashtags: false,
                    lowercase: true,
                    quantity: 10,
                    type: "specific",
                  },
                ]);
              }}
            >
              +
            </button>
          </div>
        ))}

        <button className="bg-red-200 p-2">Enviar</button>
      </form>
    </div>
  );
};

export default Home;
