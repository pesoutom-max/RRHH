"use client";

import { useEffect, useState } from "react";

import type { AdminUser } from "@/types";
import {
  getCurrentAdminProfile,
  subscribeToAdminSession
} from "@/lib/firebase/firestore-services";

export function useAdminSession() {
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState<string | null>(null);
  const [profile, setProfile] = useState<AdminUser | null>(null);

  useEffect(() => {
    return subscribeToAdminSession(async ({ uid: nextUid }) => {
      setUid(nextUid);

      if (!nextUid) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const adminProfile = await getCurrentAdminProfile(nextUid);
      setProfile(adminProfile);
      setLoading(false);
    });
  }, []);

  return {
    loading,
    uid,
    profile,
    isAdmin: Boolean(profile)
  };
}

