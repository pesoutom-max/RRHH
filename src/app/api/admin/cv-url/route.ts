import { NextResponse } from "next/server";

import { adminAuth, adminDb, adminStorage } from "@/lib/firebase/admin";

async function isAuthorizedAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return false;

  const token = authorization.replace("Bearer ", "");
  const decoded = await adminAuth.verifyIdToken(token);
  const adminDoc = await adminDb.collection("admin_users").doc(decoded.uid).get();

  return adminDoc.exists;
}

export async function POST(request: Request) {
  try {
    const allowed = await isAuthorizedAdmin(request);
    if (!allowed) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = (await request.json()) as { filePath?: string };

    if (!body.filePath) {
      return NextResponse.json(
        { error: "Falta filePath del CV." },
        { status: 400 }
      );
    }

    const [url] = await adminStorage
      .bucket()
      .file(body.filePath)
      .getSignedUrl({
        action: "read",
        expires: Date.now() + 1000 * 60 * 10
      });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "No fue posible obtener el CV."
      },
      { status: 500 }
    );
  }
}
