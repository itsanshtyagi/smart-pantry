import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pantry from './pages/Pantry';
import Recipes from './pages/Recipes';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import GroceryPlanner from './pages/GroceryPlanner';
import Profile from './pages/Profile';
import About from './pages/About';

export default function App() {
  useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pantry" element={<Pantry />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="grocery" element={<GroceryPlanner />} />
          <Route path="profile" element={<Profile />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
