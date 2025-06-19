import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SubmitExperience from "./pages/SubmitExperience";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ExperienceDetail from "./components/ExperienceDetail";
import Interview from "./pages/Interview";
import OAquestions from "./pages/OAquestions";
import OACompanyWise from "./pages/OACompanyWise";
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer position="top-center" autoClose={2000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview" element={<Interview />} /> 
        <Route path="/interview/:id" element={<ExperienceDetail />} />
        <Route path="/submit" element={<SubmitExperience />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/oa" element={<OAquestions />} />
        <Route path="/oa/:companyName" element={<OACompanyWise />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
