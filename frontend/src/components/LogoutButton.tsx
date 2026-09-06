import { signOut } from "@/app/login/actions";

/**
 * ログアウト。Server Action を form の action に渡すだけなので、
 * Client Component にする必要はない。
 */
export default function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-lg px-2 py-1 text-sm text-zinc-500 transition hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        ログアウト
      </button>
    </form>
  );
}
