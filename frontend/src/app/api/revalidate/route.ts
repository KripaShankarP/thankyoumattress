import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { CATALOG_TAG } from "@/lib/api";

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/**
 * POST /api/revalidate — the backend calls this after an admin edits products, videos,
 * colours or settings, so the next visitor gets the new catalogue.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = req.headers.get("x-revalidate-secret") ?? "";
  if (!secret || !same(given, secret)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  revalidateTag(CATALOG_TAG, { expire: 0 });
  return Response.json({ revalidated: true });
}
