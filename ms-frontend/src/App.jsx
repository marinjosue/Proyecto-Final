import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Conciertos from './pages/Conciertos';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import CrearConcierto from "./pages/CrearConcierto";

const App = () => {
  return (
    <Router>
      <Navbar />
      <main style={{ minHeight: '80vh', padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conciertos" element={<Conciertos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/crear-concierto" element={<CrearConcierto />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
};

export default App;
