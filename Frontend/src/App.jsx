import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SubmitExperience from "./pages/SubmitExperience";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SubmitOAQuestion from "./pages/SubmitOAQuestion";
import AllExperiences from "./pages/AllExperiences";
import ExperienceDetail from "./components/ExperienceDetail";
import Interview from "./pages/Interview";
import CompanyDetail from "./pages/CompanyDetail";
import OAquestions from "./pages/OAquestions";
import OACompanyWise from "./pages/OACompanyWise";
import AIInterview from "./pages/AIInterview";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ProfileInterviews from "./pages/ProfileInterviews";
import InterviewSummaryPage from "./pages/InterviewSummaryPage";
import Leaderboard from "./components/Leaderboard";
import FinalScreen from "./components/FinalScreen";
import InterviewGoal from "./pages/interview-goal";
import Profile from "./pages/Profile";
import ProtectedUserRoute from "./components/ProtectedUserRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit-oa" element={<SubmitOAQuestion />} />
            <Route path="/interview" element={<AllExperiences />} />
            <Route
              path="/resume-analyzer"
              element={
                <ProtectedUserRoute>
                  <ResumeAnalyzer />
                </ProtectedUserRoute>
              }
            />

            <Route
              path="/interview-goal/:id"
              element={
                <ProtectedUserRoute>
                  <InterviewGoal />
                </ProtectedUserRoute>
              }
            />

            <Route
              path="/interview-goal"
              element={
                <ProtectedUserRoute>
                  <InterviewGoal />
                </ProtectedUserRoute>
              }
            />
            
            <Route path="/interview/company-wise" element={<Interview />} />
            <Route path="/interview/:id" element={<ExperienceDetail />} />

            {/* 🔒  AI Interview requires login */}
            <Route
              path="/ai-interview/:company?"
              element={
                <ProtectedUserRoute>
                  <AIInterview />
                </ProtectedUserRoute>
              }
            />

            <Route path="/company/:companyName" element={<CompanyDetail />} />
            <Route path="/submit" element={<SubmitExperience />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedUserRoute>
                  <Profile />
                </ProtectedUserRoute>
              } 
            />
            <Route 
              path="/profile/interviews" 
              element={
                <ProtectedUserRoute>
                  <ProfileInterviews />
                </ProtectedUserRoute>
              } 
            />
            <Route 
              path="/mockinterview/submitted" 
              element={
                <ProtectedUserRoute>
                  <FinalScreen />
                </ProtectedUserRoute>
              } 
            />
            <Route 
              path="/mockinterview/:id" 
              element={
                <ProtectedUserRoute>
                  <InterviewSummaryPage />
                </ProtectedUserRoute>
              } 
            />
            <Route path="/leaderboard" element={<Leaderboard />} />

            {/* 🔒  Admin route already protected */}
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminPanel />
                </ProtectedAdminRoute>
              }
            />

            {/* OA routes */}
            <Route path="/oa" element={<OAquestions />} />
            <Route path="/oa/:companyName" element={<OACompanyWise />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
