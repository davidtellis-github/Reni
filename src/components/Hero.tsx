"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { imageUrl } from "@/lib/supabase";

export default function Hero({ headline, images }: { headline: string; images: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => { if (!document.hidden) setI((x) => (x + 1) % images.length); }, 5000);
    return () => clearInterval(t);
  }, [images.length]);
  const photo = images.length > 0;
  return (
    <section className={`hero ${photo ? "photo" : ""}`} id="hero">
      {photo ? <>
        {images.map((p, k) => <div key={p} className={`slide ${k === i ? "on" : ""}`} style={{ backgroundImage: `url('${imageUrl(p)}')` }} />)}
        <div className="scrim" />
      </> : <div className="media ph" />}
      <div className="content"><h1 className="display">{headline}</h1></div>
      <Link className="scroll" href="/#shop">SCROLL DOWN</Link>
      {images.length > 1 && <div className="dots">{images.map((p, k) => <button key={p} className={k === i ? "on" : ""} aria-label={`Photo ${k + 1}`} onClick={() => setI(k)} />)}</div>}
    </section>
  );
}
