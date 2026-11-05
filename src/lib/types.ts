export type UserRole = 'STUDENT' | 'TUTOR';
export type PostStatus = 'OPEN' | 'MATCHED' | 'CLOSED' | 'CANCELLED';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type GenderPreference = 'ANY' | 'MALE_ONLY' | 'FEMALE_ONLY';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EducationalDegree {
  degreeName: string;
  institution: string;
  passingYear: string;
  result?: string;
}

export interface CategoricalRating {
  punctuality: number;
  subjectMastery: number;
  teachingStyle: number;
  overall: number;
  totalReviews: number;
}

export interface StudentReview {
  id: string;
  tutorId: string;
  postId: string;
  applicationId: string;
  studentId: string;
  studentName: string;
  studentPhotoUrl?: string;
  studentRoleOrGrade: string;
  punctuality: number;
  subjectMastery: number;
  teachingStyle: number;
  overall: number;
  comment: string;
  status: ReviewStatus;
  approvedAt?: string;
  rejectedReason?: string;
  acceptedAt?: string;
  createdAt: string;
}

export type UserGender = 'MALE' | 'FEMALE';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface TeachingHistoryMilestone {
  year: string;
  title: string;
  organizationOrArea: string;
  studentsCount: number;
  highlight: string;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  password?: string;
  whatsapp?: string;
  role: UserRole;
  fullName: string;
  gender?: UserGender;
  avatarUrl?: string;
  bio?: string;
  district: string;
  areaName: string;
  exactAddress: string;
  latitude: number;
  longitude: number;

  verificationStatus?: VerificationStatus;
  verificationRejectionReason?: string;
  selfiePhotoUrl?: string;
  nidNumber?: string;
  nidDocumentUrl?: string;
  nidFrontDocumentUrl?: string;
  nidBackDocumentUrl?: string;
  studentIdCardUrl?: string;
  studentIdCardRoll?: string;
  studentIdCardReg?: string;
  department?: string;
  academicYear?: string;
  verificationSubmittedAt?: string;

  yearsOfExperience?: number;
  degrees?: EducationalDegree[];
  subjectsTaught?: string[];
  gradesTaught?: string[];
  institution?: string;
  qualifications?: string;
  rating?: number;
  totalReviews?: number;
  ratingsBreakdown?: CategoricalRating;
  teachingHistory?: TeachingHistoryMilestone[];
  reviews?: StudentReview[];
  teachingPhilosophy?: string;
  hourlyOrMonthlyRate?: number;
  isVerified?: boolean;
}

export interface TuitionPost {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  studentWhatsapp?: string;
  title: string;
  subject: string;
  gradeLevel: string;
  curriculum: string;
  daysPerWeek: number;
  hoursPerDay: number;
  salaryBudget: number;
  genderPreference: GenderPreference;
  district: string;
  areaName: string;
  exactAddress: string;
  latitude: number;
  longitude: number;
  specialRequirements?: string;
  status: PostStatus;
  approvalStatus?: 'APPROVED' | 'PENDING' | 'REJECTED';
  isSystemPost?: boolean;
  isFoundTutor?: boolean;
  acceptedTutorId?: string;
  acceptedAt?: string;
  createdAt: string;
  distanceKm?: number;
  applicationsCount?: number;
  isBookmarked?: boolean;
}

export interface TuitionApplication {
  id: string;
  postId: string;
  tutorId: string;
  tutorName: string;
  tutorAvatar?: string;
  tutorQualifications?: string;
  tutorInstitution?: string;
  tutorRating?: number;
  tutorExperienceYears?: number;
  tutorSubjects?: string[];
  tutorDistanceKm?: number;
  proposedSalary: number;
  availableSchedule: string;
  message: string;
  status: ApplicationStatus;
  statusReason?: string;
  statusUpdatedAt?: string;
  acceptedAt?: string;
  createdAt: string;
  tutorPhone?: string;
  tutorWhatsapp?: string;
  studentName?: string;
  studentPhone?: string;
  studentWhatsapp?: string;
  studentExactAddress?: string;
  studentAreaName?: string;
  studentDistrict?: string;
}

export interface FilterState {
  subject: string;
  minBudget: number;
  maxBudget: number;
  gradeLevel: string;
  district: string;
  onlyBookmarked: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'APPLICATION_RECEIVED' | 'APPLICATION_ACCEPTED' | 'APPLICATION_REJECTED' | 'POST_APPROVED' | 'POST_REJECTED' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
  postId?: string;
  linkText?: string;
}