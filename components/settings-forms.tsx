"use client";

import { Check, Copy } from "lucide-react";
import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";
import { closeCard, requestDigestEmail, type FormState } from "@/app/(app)/settings/actions";

function Message({ state }: { state: FormState }) {
  if (state.error) {
    return (
      <p role="alert" className="typed text-[0.85rem] font-bold text-red">
        {state.error}
      </p>
    );
  }
  if (state.ok) {
    return (
      <p role="status" className="typed text-[0.85rem] font-bold text-green">
        {state.ok}
      </p>
    );
  }
  return null;
}

function SubmitButton({ children, danger }: { children: React.ReactNode; danger?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`btn btn-slip btn-slip-solid ${danger ? "border-red bg-red hover:bg-red" : ""}`}
    >
      {pending ? "Working…" : children}
    </button>
  );
}

export function EmailForm() {
  const [state, action] = useActionState(requestDigestEmail, {});
  const id = useId();
  return (
    <form action={action} className="grid gap-3">
      <label htmlFor={id} className="typed text-[0.78rem] tracking-[0.14em] text-ink-muted">
        SEND NOTICES SOMEWHERE ELSE
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="field max-w-[22rem] flex-1"
        />
        <SubmitButton>Send link</SubmitButton>
      </div>
      <Message state={state} />
    </form>
  );
}

export function CloseCardForm({ expected }: { expected: string }) {
  const [state, action] = useActionState(closeCard, {});
  const id = useId();
  return (
    <form action={action} className="grid gap-3">
      <label htmlFor={id} className="typed text-[0.85rem]">
        Type <strong>{expected}</strong> to confirm.
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={id}
          name="confirm"
          required
          autoComplete="off"
          spellCheck={false}
          className="field max-w-[22rem] flex-1"
        />
        <SubmitButton danger>Close my card</SubmitButton>
      </div>
      <Message state={state} />
    </form>
  );
}

export function CopyLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-slip"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check aria-hidden className="size-4" /> : <Copy aria-hidden className="size-4" />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
