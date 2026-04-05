const publicFirebaseEnv = {
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
} as const;

export function assertFirebaseEnv() {
  const missing = Object.entries(publicFirebaseEnv)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables públicas de Firebase: ${missing.join(", ")}`
    );
  }
}

export const firebaseClientConfig = {
  apiKey: publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: publicFirebaseEnv.NEXT_PUBLIC_FIREBASE_APP_ID
};
