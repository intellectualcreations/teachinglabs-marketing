"use client";

import { useParams } from "next/navigation";

const MOCK_CERTIFICATE = {
  studentName: "Alex Johnson",
  courseTitle: "Introduction to Web Development",
  completionDate: "March 23, 2026",
  instructorName: "Dr. Sarah Mitchell",
  courseId: "demo-course",
  hoursCompleted: 24,
};

export default function CertificatePage() {
  const params = useParams();
  const courseId = params?.courseId as string;

  // In production, fetch real certificate data by courseId
  const cert = { ...MOCK_CERTIFICATE, courseId };

  return (
    <>
      <style>{`
        @media print {
          nav, header, .no-print, button { display: none !important; }
          body { background: white; }
          .certificate-wrapper { box-shadow: none; border: none; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
        <div className="no-print mb-6 flex gap-4">
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow"
          >
            🖨️ Print Certificate
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            ← Back
          </button>
        </div>

        {/* Certificate */}
        <div
          className="certificate-wrapper bg-white w-full max-w-2xl rounded-2xl shadow-2xl border-8 border-double border-blue-800 p-12 text-center"
          style={{ fontFamily: "Georgia, serif" }}
        >
          <div className="text-blue-800 text-sm uppercase tracking-widest font-bold mb-4">
            Certificate of Completion
          </div>

          <div className="text-gray-400 text-sm mb-8">TeachingLabs™</div>

          <p className="text-gray-600 text-base mb-2">This certifies that</p>

          <h1 className="text-4xl font-bold text-blue-900 border-b-2 border-blue-200 pb-4 mb-4 inline-block px-8">
            {cert.studentName}
          </h1>

          <p className="text-gray-600 text-base mb-2">has successfully completed</p>

          <h2 className="text-2xl font-semibold text-gray-800 mb-6">{cert.courseTitle}</h2>

          <div className="flex justify-center gap-12 text-sm text-gray-500 mb-8">
            <div>
              <div className="font-semibold text-gray-700">Completed</div>
              <div>{cert.completionDate}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Hours</div>
              <div>{cert.hoursCompleted}</div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-2">
            <p className="text-gray-500 text-xs mb-1">Instructor</p>
            <p className="text-lg font-semibold text-gray-800">{cert.instructorName}</p>
          </div>

          <div className="mt-8 text-xs text-gray-400">
            Certificate ID: TL-{cert.courseId}-{Date.now().toString(36).toUpperCase()}
          </div>
        </div>
      </div>
    </>
  );
}
