"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import { assertFirebaseEnv, firebaseClientConfig } from "./config";

assertFirebaseEnv();

const app = getApps().length ? getApp() : initializeApp(firebaseClientConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

