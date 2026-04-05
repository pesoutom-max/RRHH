export type VacancyStatus = "active" | "inactive" | "closed";
export type ApplicationStatus =
  | "new"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "hired";
export type AdminRole = "owner" | "admin" | "recruiter";

export interface Vacancy {
  id?: string;
  title: string;
  slug: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  schedule: string;
  location: string;
  salary: string;
  status: VacancyStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ApplicationAnswers {
  canWorkSaturdays: boolean;
  canWorkSundaysOrHolidays: boolean;
  hasCustomerServiceExperience: boolean;
  hasFoodHandlingExperience: boolean;
  canCommuteIndependently: boolean;
  availableFrom: string;
  interestReason: string;
  mainStrength: string;
}

export interface Application {
  id?: string;
  vacancyId: string;
  vacancyTitle: string;
  fullName: string;
  rut: string;
  phone: string;
  email: string;
  comuna: string;
  age: number;
  address: string;
  experienceSummary: string;
  lastJob: string;
  availability: string;
  canWorkWeekends: boolean;
  canStartImmediately: boolean;
  hasFoodHandlingExperience: boolean;
  hasCustomerServiceExperience: boolean;
  transportToWork: string;
  expectedSalary: string;
  motivation: string;
  strengths: string;
  weaknesses: string;
  cvFileUrl: string;
  answers: ApplicationAnswers;
  score: number | null;
  status: ApplicationStatus;
  adminNotes: string;
  consentAccepted: boolean;
  appliedAt?: unknown;
  updatedAt?: unknown;
}

export interface AdminUser {
  id?: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt?: unknown;
}

export interface NotificationLog {
  id?: string;
  applicationId: string;
  type: string;
  sentTo: string;
  sentAt?: unknown;
  status: "queued" | "sent" | "failed";
  errorMessage: string;
}

