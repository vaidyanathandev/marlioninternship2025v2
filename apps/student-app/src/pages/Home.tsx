import { Button } from "@marlion/ui";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold gradient-text mb-4">
          Marlion Winter Internship 2025
        </h1>
        <p className="text-xl text-marlion-muted">
          Free internship program in AR/VR, Full Stack, AI, and Data Science
        </p>
      </header>

      <div className="flex gap-4 justify-center mb-12">
        <Button onClick={() => navigate("/register")} size="lg">
          Register Now
        </Button>
        <Button variant="secondary" size="lg">
          Explore Topics
        </Button>
      </div>

      <div className="text-center text-marlion-muted">
        <p>Registration Deadline: November 30, 2025</p>
        <p>Program Starts: December 2, 2025</p>
      </div>

      {/* TODO: Add countdown timer, CEO video, stream cards, FAQ chatbot, etc. */}
      <div className="mt-12 p-8 glass-card text-center">
        <h2 className="text-2xl mb-4">🚧 Under Construction</h2>
        <p className="text-marlion-muted">
          This page is being migrated to the new Turborepo structure.
          <br />
          See IMPLEMENTATION_GUIDE.md for details.
        </p>
      </div>
    </div>
  );
}
