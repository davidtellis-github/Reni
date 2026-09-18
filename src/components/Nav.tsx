"use client";
import Link from "next/link";
import { useCart } from "./CartProvider";

export default function Nav({ brand }: { brand: string }) {
  const cart = useCart();
  return (
    <nav className="top"><div className="wrap">
      <Link className="brand" href="/">{brand}<sup>®</sup></Link>
      <ul><li><Link href="/#shop">Shop</Link></li><li><Link href="/about">About</Link></li><li><Link href="/#how">How to order</Link></li><li><Link href="/#contact">Contact</Link></li></ul>
      <div className="right">
        <Link href="/admin" title="Owner portal">Studio</Link>
        <button className="cartbtn" onClick={() => cart.setOpen(!cart.open)}>Bag <b>{cart.count}</b></button>
      </div>
    </div></nav>
  );
}
