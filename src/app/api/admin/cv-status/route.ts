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

    const body = (await request.json()) as { filePaths?: string[] };
    const filePaths = [...new Set((body.filePaths ?? []).filter(Boolean))];

    const results = await Promise.all(
      filePaths.map(async (filePath) => {
        const [exists] = await adminStorage.bucket().file(filePath).exists();
        return [filePath, exists] as const;
      })
    );

    return NextResponse.json({
      files: Object.fromEntries(results)
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No fue posible validar los CV adjuntos."
      },
      { status: 500 }
    );
  }
}
