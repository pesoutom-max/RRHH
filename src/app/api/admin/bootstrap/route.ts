import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";

import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    secret?: string;
    uid?: string;
    name?: string;
    email?: string;
    role?: "owner" | "admin" | "recruiter";
  };

  if (!process.env.ADMIN_BOOTSTRAP_SECRET) {
    return NextResponse.json(
      { error: "ADMIN_BOOTSTRAP_SECRET no está configurado." },
      { status: 500 }
    );
  }

  if (body.secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  if (!body.uid || !body.name || !body.email || !body.role) {
    return NextResponse.json(
      { error: "Faltan uid, name, email o role." },
      { status: 400 }
    );
  }

  await adminDb.collection("admin_users").doc(body.uid).set({
    name: body.name,
    email: body.email,
    role: body.role,
    createdAt: FieldValue.serverTimestamp()
  });

  return NextResponse.json({ ok: true });
}

