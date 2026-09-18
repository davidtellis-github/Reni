import { notFound } from "next/navigation";
import { adminProduct } from "@/lib/data";
import ProductForm from "@/components/ProductForm";
import type { Product } from "@/lib/types";

export default async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "new";
  const p: Partial<Product> = isNew ? { images: [], stock: 1 } : (await adminProduct(id)) || {};
  if (!isNew && !p.id) notFound();
  return <ProductForm p={p} isNew={isNew} />;
}
