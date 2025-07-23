import './App.css'
import { Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import Orders from './pages/Orders';

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>

    </>
  )
}

export default App