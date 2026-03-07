import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import RoutePlannerPage from './pages/RoutePlannerPage';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/route-planner" element={<RoutePlannerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
