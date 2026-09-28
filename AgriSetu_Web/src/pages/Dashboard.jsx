import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const tiles = [
  ['Disease Detection', '/disease', 'fa-microscope', 'AI crop disease detection with treatment', ['farmer', 'buyer']],
  ['Mandi Prices', '/mandi', 'fa-chart-line', 'Live market prices from mandis across India', null],
  ['Weather', '/weather', 'fa-cloud-sun', '6-day farm forecast for your fields', null],
  ['Marketplace', '/marketplace', 'fa-shop', 'Buy & sell produce directly', null],
  ['My Coupons', '/coupons', 'fa-ticket', 'DAP / MOP / NPK fertilizer subsidy', ['farmer']],
  ['Redeem Coupon', '/redeem', 'fa-check', 'Verify farmer codes at your shop', ['dealer', 'agri_officer']],
  ['Profile', '/profile', 'fa-user', 'Account & logout', null],
];

export default function Dashboard() {
  const { user } = useAuth();
  const visible = tiles.filter(([, , , , roles]) => !roles || roles.includes(user?.role));
  return (
    <div>
      <div className="hero">
        <div className="hero-content">
          <h2><span className="highlight">AgriSetu</span></h2>
          <p className="tagline">Farmer first, always 🌾</p>
          <p>Namaste{user ? `, ${user.name}` : ''} — check mandi rates, weather, crop health and trade, everything for today&apos;s farm work.</p>
          <span className="role">{user?.role || 'farmer'}</span>
          <div className="hero-buttons">
            <Link to="/disease" className="btn"><i className="fas fa-leaf"></i> Check crop health</Link>
            <Link to="/mandi" className="btn btn-secondary"><i className="fas fa-store"></i> Mandi rates</Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-illustration">
            <i className="fas fa-tractor"></i>
            <i className="fas fa-cloud-sun"></i>
            <i className="fas fa-seedling"></i>
          </div>
        </div>
      </div>
      <div className="grid">
        {visible.map(([t, to, icon, desc]) => (
          <Link key={to} to={to} className="tile"><span className="ticon"><i className={`fas ${icon}`}></i></span><b>{t}</b><span className="desc">{desc}</span></Link>
        ))}
      </div>
    </div>
  );
}
