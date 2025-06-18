import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SubmitExperience from "./pages/SubmitExperience";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import ExperienceDetail from "./components/ExperienceDetail";
import Interview from "./pages/Interview"; // ✅ Import the Interview page


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/interview" element={<Interview />} /> {/* ✅ Static route first */}
        <Route path="/interview/:id" element={<ExperienceDetail />} /> {/* 👇 Dynamic route */}
        <Route path="/submit" element={<SubmitExperience />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer/>
      

    </Router>
  );
}

export default App;
