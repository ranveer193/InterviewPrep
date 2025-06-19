
import { useParams } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const mockData = {
  "Salesforce": {
    2024: [
      {
        question: "What is a closure in JavaScript?",
        detail: "A closure is a function having access to the parent scope, even after the parent function has closed."
      },
      {
        question: "Difference between async/await and Promises?",
        detail: "Async/await is syntax sugar over Promises that makes asynchronous code look synchronous."
      }
    ],
    2023: [
      {
        question: "Describe the architecture of a MERN stack application.",
        detail: "MERN stack includes MongoDB, Express, React, and Node.js. It follows a full-stack JavaScript architecture."
      },
      {
        question: "What is throttling vs debouncing?",
        detail: "Throttling limits function calls to once every X ms; debouncing delays execution until no input for X ms."
      }
    ]
  }
};

export default function OACompanyWise() {
  const { companyName } = useParams();
  const [openYear, setOpenYear] = useState(null);
  const [openQuestion, setOpenQuestion] = useState({});

  const questionsByYear = mockData[companyName] || {};

  const toggleYear = (year) => {
    setOpenYear(prev => (prev === year ? null : year));
    setOpenQuestion({}); // Reset inner dropdowns when changing year
  };

  const toggleQuestion = (year, index) => {
    setOpenQuestion(prev => ({
      ...prev,
      [`${year}-${index}`]: !prev[`${year}-${index}`]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">{companyName} – OA Questions</h1>

      {Object.keys(questionsByYear).length === 0 && (
        <p className="text-gray-500">No questions available for this company.</p>
      )}

      {Object.entries(questionsByYear).map(([year, questions]) => (
        <div key={year} className="border border-gray-200 rounded-xl mb-4">
          {/* Year Toggle */}
          <button
            onClick={() => toggleYear(year)}
            className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-blue-50 transition"
          >
            <span className="text-lg font-medium text-blue-700">{year}</span>
            {openYear === year ? (
              <ChevronDown className="h-5 w-5 text-blue-500" />
            ) : (
              <ChevronRight className="h-5 w-5 text-blue-500" />
            )}
          </button>

          {/* Question List */}
          {openYear === year && (
            <ul className="px-6 pb-4 space-y-2">
              {questions.map((q, i) => {
                const key = `${year}-${i}`;
                const isOpen = openQuestion[key];

                return (
                  <li key={i} className="border border-gray-100 rounded-lg">
                    <button
                      onClick={() => toggleQuestion(year, i)}
                      className="w-full flex items-start justify-between text-left px-4 py-3 hover:bg-gray-50"
                    >
                      <span>
                        <span className="text-blue-600 font-semibold mr-2">{i + 1}.</span>
                        {q.question}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="h-5 w-5 text-blue-500 mt-1" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-blue-500 mt-1" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-3 text-sm text-gray-700">
                        {q.detail}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
