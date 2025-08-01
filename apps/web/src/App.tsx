import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from "./store/store";
import HomePage from "./pages/HomePage";
import TeacherPage from "./pages/TeacherPage";
import StudentStarter from "./pages/StudentStarter";
import PollArea from "./pages/PollArea";
import PollHistory from "./pages/PollHistory";
import TeacherDashboard from "./pages/TeacherDashboard";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/teacher" element={<TeacherPage />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/student" element={<StudentStarter />} />
            <Route path="/poll" element={<PollArea />} />
            <Route path="/history" element={<PollHistory />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
