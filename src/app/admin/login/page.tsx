"use client";
import { useActionState } from "react";
import { login } from "@/app/actions";

export default function Login() {
  const [state, action, pending] = useActionState(login, null as { error?: string } | null);
  return (<div className="login">
    <form action={action}><label className="field"><span>Studio password</span><input name="password" type="password" required autoFocus /></label>
      {state?.error && <div className="err" style={{ marginBottom: 12 }}>{state.error}</div>}
      <button className="btn" disabled={pending}>{pending ? "Checking…" : "Sign in"}</button></form>
  </div>);
}
