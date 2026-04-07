"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type QueryConstraint
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  type UploadMetadata
} from "firebase/storage";

import type {
  AdminUser,
  Application,
  ApplicationStatus,
  Vacancy,
  VacancyStatus
} from "@/types";
import { slugify } from "@/lib/utils/format";
import type { ApplicationFormValues } from "@/lib/validations/application";
import type { VacancyFormValues } from "@/lib/validations/vacancy";

import { auth, db, storage } from "./client";

const vacanciesCollection = collection(db, "vacancies");
const applicationsCollection = collection(db, "applications");
const adminUsersCollection = collection(db, "admin_users");

export async function getActiveVacancies() {
  const snapshot = await getDocs(
    query(
      vacanciesCollection,
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    )
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Vacancy)
  }));
}

export async function getVacancyById(vacancyId: string) {
  const snapshot = await getDoc(doc(db, "vacancies", vacancyId));
  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...(snapshot.data() as Vacancy)
  };
}

export async function getVacancyBySlug(slug: string) {
  const snapshot = await getDocs(
    query(
      vacanciesCollection,
      where("slug", "==", slug),
      where("status", "==", "active"),
      limit(1)
    )
  );

  if (snapshot.empty) return null;

  const first = snapshot.docs[0];

  return {
    id: first.id,
    ...(first.data() as Vacancy)
  };
}

export async function uploadCvFile(applicationId: string, file: File) {
  const sanitizedFileName = file.name.replace(/\s+/g, "-").toLowerCase();
  const storageRef = ref(
    storage,
    `applications/${applicationId}/${Date.now()}-${sanitizedFileName}`
  );
  const metadata: UploadMetadata = {
    contentType: file.type
  };

  await uploadBytes(storageRef, file, metadata);
  return storageRef.fullPath;
}

export async function submitApplication(
  vacancy: Vacancy,
  values: ApplicationFormValues,
  cvFile?: File | null
) {
  const applicationRef = doc(applicationsCollection);
  const cvFileUrl = cvFile ? await uploadCvFile(applicationRef.id, cvFile) : "";

  const payload: Application = {
    vacancyId: vacancy.id ?? "",
    vacancyTitle: vacancy.title,
    fullName: values.fullName,
    rut: values.rut,
    phone: values.phone,
    email: values.email,
    comuna: values.comuna,
    age: values.age,
    experienceSummary: values.experienceSummary,
    lastJob: values.lastJob,
    availability: values.availability,
    transportToWork: values.transportToWork,
    expectedSalary: values.expectedSalary,
    cvFileUrl,
    answers: {
      canWorkSundaysOrHolidays: values.canWorkSundaysOrHolidays,
      availableFrom: values.availableFrom,
      knowsBrandAndBusiness: values.knowsBrandAndBusiness,
      knowsInstagram: values.knowsInstagram
    },
    score: null,
    status: "new",
    adminNotes: "",
    consentAccepted: values.consentAccepted,
    appliedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(applicationRef, payload);
  return applicationRef.id;
}

export async function signInAdmin(email: string, password: string) {
  const { signInWithEmailAndPassword } = await import("firebase/auth");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOutAdmin() {
  const { signOut } = await import("firebase/auth");
  return signOut(auth);
}

export async function checkCvFilesExist(filePaths: string[]) {
  const uniquePaths = [...new Set(filePaths.filter(Boolean))];

  if (uniquePaths.length === 0) {
    return {} as Record<string, boolean>;
  }

  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error("No fue posible validar los CV adjuntos.");
  }

  const response = await fetch("/api/admin/cv-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ filePaths: uniquePaths })
  });

  const data = (await response.json()) as {
    files?: Record<string, boolean>;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "No fue posible validar los CV adjuntos.");
  }

  return data.files ?? {};
}

export async function getSignedCvUrl(filePath: string) {
  const token = await auth.currentUser?.getIdToken();

  if (!token) {
    throw new Error("No autorizado.");
  }

  const response = await fetch("/api/admin/cv-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ filePath })
  });

  const data = (await response.json()) as { url?: string; error?: string };

  if (!response.ok || !data.url) {
    throw new Error(data.error || "No fue posible obtener el CV.");
  }

  return data.url;
}

export async function getCurrentAdminProfile(userId: string) {
  const snapshot = await getDoc(doc(adminUsersCollection, userId));
  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...(snapshot.data() as AdminUser)
  };
}

export async function createVacancy(values: VacancyFormValues) {
  const now = serverTimestamp();
  await addDoc(vacanciesCollection, {
    title: values.title,
    slug: slugify(values.title),
    description: values.description,
    responsibilities: splitLines(values.responsibilitiesText),
    requirements: splitLines(values.requirementsText),
    schedule: values.schedule,
    location: values.location,
    salary: values.salary,
    status: values.status,
    createdAt: now,
    updatedAt: now
  } satisfies Vacancy);
}

export async function updateVacancy(
  vacancyId: string,
  values: VacancyFormValues & { slug?: string }
) {
  await updateDoc(doc(vacanciesCollection, vacancyId), {
    title: values.title,
    slug: values.slug || slugify(values.title),
    description: values.description,
    responsibilities: splitLines(values.responsibilitiesText),
    requirements: splitLines(values.requirementsText),
    schedule: values.schedule,
    location: values.location,
    salary: values.salary,
    status: values.status,
    updatedAt: serverTimestamp()
  });
}

export async function deleteVacancy(vacancyId: string) {
  await deleteDoc(doc(vacanciesCollection, vacancyId));
}

export async function updateApplicationAdminState(
  applicationId: string,
  updates: Partial<Pick<Application, "adminNotes" | "score" | "status">>
) {
  await updateDoc(doc(applicationsCollection, applicationId), {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export async function deleteApplication(applicationId: string) {
  await deleteDoc(doc(applicationsCollection, applicationId));
}

export async function listAdminVacancies(status?: VacancyStatus) {
  const constraints: QueryConstraint[] = [orderBy("createdAt", "desc")];

  if (status) {
    constraints.unshift(where("status", "==", status));
  }

  const snapshot = await getDocs(query(vacanciesCollection, ...constraints));
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Vacancy)
  }));
}

export async function listAdminApplications() {
  const snapshot = await getDocs(
    query(applicationsCollection, orderBy("appliedAt", "desc"), limit(250))
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Application)
  }));
}

export async function getApplicationById(applicationId: string) {
  const snapshot = await getDoc(doc(applicationsCollection, applicationId));
  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...(snapshot.data() as Application)
  };
}

export async function getDashboardStats() {
  const items = await listAdminApplications();

  return {
    total: items.length,
    new: countByStatus(items, "new"),
    reviewing: countByStatus(items, "reviewing"),
    reviewed: countByStatus(items, "reviewed"),
    shortlisted: countByStatus(items, "shortlisted"),
    rejected: countByStatus(items, "rejected"),
    hired: countByStatus(items, "hired")
  };
}

export function subscribeToAdminSession(
  callback: (value: { uid: string | null }) => void
) {
  return auth.onAuthStateChanged((user) => callback({ uid: user?.uid ?? null }));
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function countByStatus(items: Application[], status: ApplicationStatus) {
  return items.filter((item) => item.status === status).length;
}
