import type {
  TuitionApplication,
  TuitionPost,
  User,
} from "../../lib/types";
import { getTutorRatingSummary } from "../../lib/ratings";
import type { FlatReview } from "./adminTypes";

interface AdminExportOptions {
  tutors: User[];
  students: User[];
  tuitionPosts: TuitionPost[];
  applications: TuitionApplication[];
  allReviews: FlatReview[];
}

export function useAdminExports({
  tutors,
  students,
  tuitionPosts,
  applications,
  allReviews,
}: AdminExportOptions) {
  const exportToExcelCSV = (
    filename: string,
    headers: string[],
    rows: (string | number | undefined | null)[][],
  ) => {
    const escapeCell = (value: string | number | undefined | null) => {
      if (value === undefined || value === null) return '""';
      return `"${String(value).replace(/"/g, '""')}"`;
    };
    const csvContent =
      "\uFEFF" +
      [
        headers.map(escapeCell).join(","),
        ...rows.map((row) => row.map(escapeCell).join(",")),
      ].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      filename.endsWith(".csv") ? filename : `${filename}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const dateSuffix = () => new Date().toISOString().slice(0, 10);

  const handleExportTeachers = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Guardian Name",
      "Guardian Mobile",
      "Gender",
      "District",
      "Institution",
      "Department",
      "NID",
      "Roll",
      "Reg",
      "Status",
      "Rating",
    ];
    const rows = tutors.map((tutor) => [
      tutor.id,
      tutor.fullName,
      tutor.email,
      tutor.phone,
      tutor.guardianName,
      tutor.guardianPhone,
      tutor.gender,
      tutor.district,
      tutor.institution,
      tutor.department,
      tutor.nidNumber,
      tutor.studentIdCardRoll,
      tutor.studentIdCardReg,
      tutor.verificationStatus,
      getTutorRatingSummary(tutor).average,
    ]);
    exportToExcelCSV(`porabo_teachers_${dateSuffix()}`, headers, rows);
  };

  const handleExportStudents = () => {
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Guardian Name",
      "Guardian Mobile",
      "District",
      "Address",
    ];
    const rows = students.map((student) => [
      student.id,
      student.fullName,
      student.email,
      student.phone,
      student.guardianName,
      student.guardianPhone,
      student.district,
      student.exactAddress,
    ]);
    exportToExcelCSV(`porabo_students_${dateSuffix()}`, headers, rows);
  };

  const handleExportTuitionPosts = () => {
    const headers = [
      "Post ID",
      "Title",
      "Student",
      "Subject",
      "Grade",
      "Budget",
      "Mode",
      "Status",
      "Applicants",
      "Accepted Tutor",
      "Created",
    ];
    const rows = tuitionPosts.map((post) => {
      const postApplications = applications.filter(
        (application) => application.postId === post.id,
      );
      const acceptedApplication = postApplications.find(
        (application) => application.status === "ACCEPTED",
      );
      return [
        post.id,
        post.title,
        post.studentName,
        post.subject,
        post.gradeLevel,
        post.salaryBudget,
        post.tuitionMode || "—",
        post.status,
        postApplications.length,
        acceptedApplication?.tutorName || "—",
        new Date(post.createdAt).toISOString(),
      ];
    });
    exportToExcelCSV(`porabo_posts_${dateSuffix()}`, headers, rows);
  };

  const handleExportReviews = () => {
    const headers = [
      "ID",
      "Tutor",
      "Student",
      "Punctuality",
      "Mastery",
      "Style",
      "Overall",
      "Comment",
      "Status",
    ];
    const rows = allReviews.map((review) => [
      review.id,
      review.tutorName,
      review.studentName,
      review.punctuality,
      review.subjectMastery,
      review.teachingStyle,
      review.overall,
      review.comment,
      review.status,
    ]);
    exportToExcelCSV(`porabo_reviews_${dateSuffix()}`, headers, rows);
  };

  return {
    handleExportTeachers,
    handleExportStudents,
    handleExportTuitionPosts,
    handleExportReviews,
  };
}
