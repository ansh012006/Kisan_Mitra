import { useState } from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Disease from './pages/Disease';
import Coupons from './pages/Coupons';
import Login from './pages/Login';
import Mandi from './pages/Mandi';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Redeem from './pages/Redeem';
import Register from './pages/Register';
import Weather from './pages/Weather';

function Guard({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><i className="fas fa-spinner fa-spin"></i> Loading AgriSetu…</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function Nav() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  return (
    <nav>
      <div className="nav-inner">
        <NavLink to="/" className="brand"><i className="fas fa-seedling"></i><span>AgriSetu<small>farmer first</small></span></NavLink>
        <span className="sp" />
        <div className={`links${open ? ' open' : ''}`}>
          {(user.role === 'farmer' || user.role === 'buyer') && <NavLink to="/disease" onClick={() => setOpen(false)}><i className="fas fa-leaf"></i> Disease</NavLink>}
          <NavLink to="/mandi" onClick={() => setOpen(false)}><i className="fas fa-store"></i> Mandi</NavLink>
          <NavLink to="/weather" onClick={() => setOpen(false)}><i className="fas fa-cloud-sun"></i> Weather</NavLink>
          <NavLink to="/marketplace" onClick={() => setOpen(false)}><i className="fas fa-shop"></i> Market</NavLink>
          {user.role === 'farmer' && <NavLink to="/coupons" onClick={() => setOpen(false)}><i className="fas fa-ticket"></i> Coupons</NavLink>}
          {(user.role === 'dealer' || user.role === 'agri_officer') && <NavLink to="/redeem" onClick={() => setOpen(false)}><i className="fas fa-check"></i> Redeem</NavLink>}
          <NavLink to="/profile" className="user" title={user.name} onClick={() => setOpen(false)}><i className="fas fa-user"></i> {user.name}</NavLink>
          <button className="logout" onClick={() => { logout(); nav('/login'); }}><i className="fas fa-sign-out-alt"></i> Logout</button>
        </div>
        <button className="mobile-menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Menu"><i className="fas fa-bars"></i></button>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Nav />
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Guard><Dashboard /></Guard>} />
            <Route path="/disease" element={<Guard><Disease /></Guard>} />
            <Route path="/mandi" element={<Guard><Mandi /></Guard>} />
            <Route path="/weather" element={<Guard><Weather /></Guard>} />
            <Route path="/marketplace" element={<Guard><Marketplace /></Guard>} />
            <Route path="/coupons" element={<Guard roles={['farmer']}><Coupons /></Guard>} />
            <Route path="/redeem" element={<Guard roles={['dealer', 'agri_officer']}><Redeem /></Guard>} />
            <Route path="/profile" element={<Guard><Profile /></Guard>} />
          </Routes>
        </main>
        <footer className="app-foot"><p>🌾 AgriSetu — mandi, weather, disease & market in one place</p><p>&copy; 2026 AgriSetu</p></footer>
      </AuthProvider>
    </BrowserRouter>
  );
}
