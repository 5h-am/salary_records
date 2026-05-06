import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

export default function NavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <NavLink to="/" className="brand">SalaryScale</NavLink>
      </div>
      
      <button 
        className="mobile-toggle" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      <div className={`navbar-center ${isMobileMenuOpen ? 'open' : ''}`}>
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          end
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Market
        </NavLink>
        <NavLink 
          to="/benchmarks" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Benchmarks
        </NavLink>
        <NavLink 
          to="/compare" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Compare
        </NavLink>
      </div>

      <div className="navbar-right">
        <NavLink 
          to="/calculate" 
          className="btn-primary calculate-btn"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Calculate
        </NavLink>
      </div>
    </header>
  );
}
