import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  return key ? key.replace(/\\n/g, "\n") : undefined;
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = getPrivateKey();

const adminOptions = {
  ...(clientEmail && privateKey
    ? {
        credential: cert({
          projectId,
          clientEmail,
          privateKey
        })
      }
    : {}),
  ...(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    ? {
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      }
    : {})
};

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(adminOptions);

export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
export const adminStorage = getStorage(app);
