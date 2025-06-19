import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SubmitExperience from "./pages/SubmitExperience";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SubmitOAQuestion from "./pages/SubmitOAQuestion";

import ExperienceDetail from "./components/ExperienceDetail";
import Interview from "./pages/Interview"; 
import CompanyDetail from "./pages/CompanyDetail"; 
import { ToastContainer } from 'react-toastify';
import ProtectedAdminRoute from "./components/protectedAdminRoute";

function App() {
  return (
    <Router>
      <Navbar />
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit-oa" element={<SubmitOAQuestion />} />
        <Route path="/interview" element={<Interview />} /> 
        <Route path="/interview/:id" element={<ExperienceDetail />} /> 
        <Route path="/company/:companyName" element={<CompanyDetail />} /> 
        <Route path="/submit" element={<SubmitExperience />} />
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminPanel />
          </ProtectedAdminRoute> } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
