import Link from "next/link";
import { adminProducts } from "@/lib/data";
import { availability, inr } from "@/lib/format";
import { imageUrl } from "@/lib/supabase";
import { deleteProduct, moveProduct } from "@/app/actions";

export default async function Products() {
  const list = await adminProducts();
  return (<>
    <div className="bar"><span className="muted small">{list.length} piece{list.length === 1 ? "" : "s"}</span><Link className="btn small" href="/admin/products/new">Add a piece</Link></div>
    <div className="tscroll"><table><thead><tr><th></th><th>Name</th><th>Price</th><th>Availability</th><th>Shown</th><th></th></tr></thead><tbody>
      {list.length ? list.map((p, i) => (<tr key={p.id}>
        <td><div className="thumb" style={p.images[0] ? { backgroundImage: `url('${imageUrl(p.images[0])}')` } : undefined} /></td>
        <td>{p.name}</td><td>{inr(p.price)}</td><td>{availability(p).label}</td><td>{p.hidden ? "No" : "Yes"}</td>
        <td className="actions">
          <Link href={`/admin/products/${p.id}`} style={{ textDecoration: "underline", fontSize: 12 }}>Edit</Link>
          <form action={moveProduct.bind(null, p.id, -1)}><button disabled={i === 0}>Up</button></form>
          <form action={moveProduct.bind(null, p.id, 1)}><button disabled={i === list.length - 1}>Down</button></form>
          <form action={deleteProduct.bind(null, p.id)}><button className="danger">Delete</button></form>
        </td></tr>)) : <tr><td colSpan={6} className="muted">Nothing listed yet.</td></tr>}
    </tbody></table></div>
  </>);
}
