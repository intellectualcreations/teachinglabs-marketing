export interface Certificate {
  certificateId: string;
  studentId: string;
  courseId: string;
  issuedAt: string;
  courseName?: string;
}

const certificates: Certificate[] = [];
let certCounter = 1;

export function issueCertificate(studentId: string, courseId: string, courseName?: string): Certificate {
  const cert: Certificate = {
    certificateId: `CERT-${certCounter++}-${Date.now()}`,
    studentId,
    courseId,
    issuedAt: new Date().toISOString(),
    courseName,
  };
  certificates.push(cert);
  return cert;
}

export function getStudentCertificates(studentId: string): Certificate[] {
  return certificates.filter(c => c.studentId === studentId);
}

export function checkEligibility(studentId: string, courseId: string, avgScore: number): { eligible: boolean; reason: string } {
  if (avgScore >= 60) {
    return { eligible: true, reason: 'All assignments completed with passing average score >= 60' };
  }
  return { eligible: false, reason: `Average score ${avgScore.toFixed(1)} is below passing threshold of 60` };
}
