"use client";
import { useState } from "react";
import Image from "next/image";
import { imageUrl } from "@/lib/supabase";

export default function Gallery({ images }: { images: string[] }) {
  const [i, setI] = useState(0); const cur = images[i] || images[0];
  return (<div className="gallery">
    <div className={`main ${cur ? "" : "ph"}`}>
      {cur && <Image src={imageUrl(cur)} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover" }} priority />}
    </div>
    {images.length > 1 && <div className="thumbs">{images.map((p, k) => <button key={p} className={k === i ? "on" : ""} onClick={() => setI(k)} style={{ backgroundImage: `url('${imageUrl(p)}')` }} aria-label={`Photo ${k + 1}`} />)}</div>}
  </div>);
}
