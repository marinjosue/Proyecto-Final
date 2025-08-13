import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Conciertos from "./pages/Conciertos";
import ConciertoDetalle from "./pages/ConciertoDetalle";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import CrearConcierto from "./pages/CrearConcierto";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/conciertos" element={<Conciertos />} />
        <Route path="/concierto/:id" element={<ConciertoDetalle />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/crear-concierto" element={<CrearConcierto />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
