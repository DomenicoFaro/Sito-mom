"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <label className="mb-1.5 block text-xs tracking-wide text-ink-dim">
          Email
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="w-full rounded-lg border border-line bg-abyss-soft px-4 py-3 text-sm outline-none focus:border-gold"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs tracking-wide text-ink-dim">
          Password
        </label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-line bg-abyss-soft px-4 py-3 text-sm outline-none focus:border-gold"
        />
      </div>

      {state.error && (
        <p className="text-sm text-lacquer-bright">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-lacquer py-3.5 text-sm font-medium tracking-wide text-ink transition hover:bg-lacquer-bright disabled:opacity-60"
      >
        {pending ? "Accesso in corso…" : "Accedi"}
      </button>
    </form>
  );
}
