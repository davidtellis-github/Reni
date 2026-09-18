"use client";
import { useState } from "react";
import { uploadImage } from "@/app/actions";
import { imageUrl } from "@/lib/supabase";

/** Uploads to Supabase Storage and keeps the resulting paths in hidden inputs named `name`. */
export default function ImageUploader({ name, initial, multiple = true, hero = false }: { name: string; initial: string[]; multiple?: boolean; hero?: boolean }) {
  const [paths, setPaths] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setBusy(true); setErr("");
    const next = multiple ? [...paths] : [];
    for (const f of files) { const fd = new FormData(); fd.append("file", f); const r = await uploadImage(fd); if (r.path) next.push(r.path); else setErr(r.error || "Upload failed"); }
    setPaths(next); setBusy(false); e.target.value = "";
  }
  return (<div>
    <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple={multiple} onChange={onChange} disabled={busy} />
    {busy && <div className="small muted">Uploading…</div>}{err && <div className="err">{err}</div>}
    <div className="imgs">{paths.map((p, i) => <div key={p} className={`im ${hero ? "hero" : ""}`} style={{ backgroundImage: `url('${imageUrl(p)}')` }}>
      <input type="hidden" name={name} value={p} /><button type="button" onClick={() => setPaths(paths.filter((_, k) => k !== i))}>remove</button></div>)}</div>
  </div>);
}
