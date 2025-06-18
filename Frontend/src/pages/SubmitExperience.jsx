import ExperienceForm from "../components/ExperienceForm";

export default function SubmitExperience() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-600">
          Submit Your Interview Experience
        </h2>
        <ExperienceForm />
      </div>
    </div>
  );
}
