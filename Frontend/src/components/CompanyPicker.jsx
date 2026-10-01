import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../services/api";
import Modal from "./Modal";

export default function CompanyPicker() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [numQuestions, setNumQuestions] = useState(2);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/oa/companies");
        setCompanies(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleStart = () => {
    if (selectedCompany) {
      navigate(`/ai-interview/${encodeURIComponent(selectedCompany)}?num=${numQuestions}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-10">Choose Company</h1>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {companies.length > 0 ? (
            companies.map((c) => (
              <div
                key={c}
                onClick={() => setSelectedCompany(c)}
                className="cursor-pointer bg-white border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all"
              >
                <h4 className="text-xl font-bold mb-2 text-gray-900">{c}</h4>
                <p className="text-sm text-gray-500 mb-4">Practice {c} OA interview</p>
                <button className="w-full bg-blue-500 text-white py-2 rounded-lg">Start Interview</button>
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">No companies available right now.</p>
          )}
        </div>
      )}

      {/* Number of Questions Modal */}
      <Modal
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
        title="Interview Settings"
      >
        <div className="p-6 w-[350px]">
          <p className="text-sm text-gray-600 mb-4">
            How many questions would you like to practice for <strong>{selectedCompany}</strong>?
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions: {numQuestions}
              </label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={numQuestions} 
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>10</span>
              </div>
            </div>
            
            <button 
              onClick={handleStart}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-md"
            >
              Begin Interview
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}