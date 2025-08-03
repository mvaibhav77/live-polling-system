import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from "./store/store";
import HomePage from "./pages/HomePage";
import StudentStarter from "./pages/StudentStarter";
import PollArea from "./pages/PollArea";
import TeacherDashboard from "./pages/TeacherDashboard";
import PollHistoryPage from "./pages/PollHistoryPage";
import CreatePoll from "./pages/CreatePoll";
import KickedOut from "./components/student/KickedOut";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/teacher/create-poll" element={<CreatePoll />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/student/get-started" element={<StudentStarter />} />
            <Route path="/poll" element={<PollArea />} />
            <Route path="/history" element={<PollHistoryPage />} />
            <Route path="/kicked-out" element={<KickedOut />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
