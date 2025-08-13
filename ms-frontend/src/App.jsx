import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Conciertos from './pages/Conciertos';
import ConciertoDetalle from './pages/ConciertoDetalle';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import CrearConcierto from "./pages/CrearConcierto";
import MisReservas from "./pages/MisReservas";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main style={{ minHeight: '80vh', padding: '1rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/conciertos" element={<Conciertos />} />
            <Route path="/conciertos/:id" element={<ConciertoDetalle />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/crear-concierto" 
              element={
                <ProtectedRoute>
                  <CrearConcierto />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mis-reservas" 
              element={
                <ProtectedRoute>
                  <MisReservas />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;
