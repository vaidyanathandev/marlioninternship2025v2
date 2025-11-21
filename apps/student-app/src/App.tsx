import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import AIInterview from "./pages/AIInterview";
import OfferLetter from "./pages/OfferLetter";
import Dashboard from "./pages/Dashboard";
import Certificate from "./pages/Certificate";

function App() {
  return (
    <div className="min-h-screen bg-marlion-bg">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/interview" element={<AIInterview />} />
        <Route path="/offer" element={<OfferLetter />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/certificate" element={<Certificate />} />
      </Routes>
    </div>
  );
}

export default App;
