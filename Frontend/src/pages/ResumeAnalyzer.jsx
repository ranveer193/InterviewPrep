import ResumeUploadForm from "../components/resumeUploadForm";

export default function ResumeAnalyzer() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-primary-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-16 px-4">
      <h1 className="text-4xl font-extrabold tracking-tight text-gray-800 dark:text-gray-100 mb-10">
        AI&nbsp;Resume <span className="text-primary-600">Analyzer</span>
      </h1>
      <ResumeUploadForm />
    </div>
  );
}
