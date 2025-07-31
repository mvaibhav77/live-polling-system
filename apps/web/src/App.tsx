import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import TeacherPage from "./pages/TeacherPage";
import StudentStarter from "./pages/StudentStarter";
import PollArea from "./pages/PollArea";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/student" element={<StudentStarter />} />

          <Route path="/poll" element={<PollArea name="" />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
