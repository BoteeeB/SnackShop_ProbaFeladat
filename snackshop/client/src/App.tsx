import './App.css'
import { Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import Orders from './pages/Orders';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<ProtectedRoute>
      <Home />
    </ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly>
      <AdminPanel />
    </ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute adminOnly>
      <Orders />
    </ProtectedRoute>} />
      </Routes>

    </>
  )
}

export default App