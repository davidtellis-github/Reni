"use client";
import { useState } from "react";
import { imageUrl } from "@/lib/supabase";

export default function Gallery({ images }: { images: string[] }) {
  const [i, setI] = useState(0); const cur = images[i] || images[0];
  return (<div className="gallery">
    <div className={`main ${cur ? "" : "ph"}`} style={cur ? { backgroundImage: `url('${imageUrl(cur)}')` } : undefined} />
    {images.length > 1 && <div className="thumbs">{images.map((p, k) => <button key={p} className={k === i ? "on" : ""} onClick={() => setI(k)} style={{ backgroundImage: `url('${imageUrl(p)}')` }} aria-label={`Photo ${k + 1}`} />)}</div>}
  </div>);
}
