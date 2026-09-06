import { signInWithGoogle } from "@/app/login/actions";

/**
 * ログイン画面。Googleログインだけなので、フォーム1つで足りる。
 * Client Component にはしない。押した時点でサーバーに来て、
 * PKCE の code_verifier をサーバーがCookieに書く必要があるため。
 */

export const metadata = {
  title: "ログイン | 知識図鑑",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-black/[.06] bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[.04]">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            知識図鑑
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            続けるにはログインしてください
          </p>
        </div>

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            ログインを開始できませんでした。もう一度お試しください
          </p>
        ) : null}

        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-offset-zinc-950"
          >
            Googleでログイン
          </button>
        </form>
      </div>
    </div>
  );
}
