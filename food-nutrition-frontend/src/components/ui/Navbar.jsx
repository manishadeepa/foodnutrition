import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const NAV_LINKS = [
  { to: '/calorie-tracker', label: 'Calorie Tracker', icon: 'Timer' },
  { to: '/barcode-scanner', label: 'Barcode Scanner', icon: 'ScanLine' },
  { to: '/food-compare',    label: 'Food Compare',   icon: 'LayoutList' },
  { to: '/food-battle',     label: 'Food Battle',    icon: 'Swords' },
  { to: '/body-goals',      label: 'Body Goals',     icon: 'Target' },
];

const btnStyle = (grad) => ({
  background: grad,
  color: '#1A3D2B',
  border: 'none',
  borderRadius: '10px',
  padding: '0 1.2rem',
  height: '44px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  transition: 'opacity 0.2s',
});

const Navbar = ({ isAuthenticated = false }) => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isLoginPage = location?.pathname === '/login';

  if (isLoginPage) return null;

  return (
    <>
      {/* ── Top Navbar (unchanged) ── */}
      <nav className="navbar">
        <div className="navbar-container">

          {/* ── Left: Brand ── */}
          <Link to="/image-upload" className="navbar-brand">
            <div className="navbar-logo">
              <Icon name="Apple" size={28} color="#FFFFFF" strokeWidth={2.5} />
            </div>
            <span className="navbar-brand-text">FoodNutritionAI</span>
          </Link>

          {/* ── Right: Auth Actions + Hamburger ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            {isAuthenticated && (
              <>
                <Link to="/nutrition-history" style={btnStyle('linear-gradient(135deg, #a8d5b5, #c8ecd4)')}>
                  <Icon name="History" size={18} />
                  <span>History</span>
                </Link>
                <Link to="/settings" style={btnStyle('linear-gradient(135deg, #c8ecd4, #faeea3)')}>
                  <Icon name="Settings" size={18} />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => { localStorage.removeItem('authToken'); window.location.href = '/login'; }}
                  style={btnStyle('linear-gradient(135deg, #faeea3, #a8d5b5)')}
                >
                  <Icon name="LogOut" size={18} />
                  <span>Sign Out</span>
                </button>
              </>
            )}

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
              style={btnStyle('linear-gradient(135deg, #a8d5b5, #faeea3)')}
            >
              <Icon name="Menu" size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Backdrop ── */}
      {menuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMenuOpen(false)}
          style={{ backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* ── Side Drawer (cleaned up) ── */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: '270px',
        zIndex: 200,
        background: '#13161f',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '-20px 0 50px rgba(0,0,0,0.45)',
        transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.27s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'inherit',
      }}>

        {/* Drawer Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff', letterSpacing: '-0.2px' }}>
            Menu
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Features Section */}
        <div style={{ padding: '10px 10px 0' }}>
          <p style={sectionLabel}>Features</p>
          {NAV_LINKS.map(({ to, label, icon }) => {
            const isActive = location?.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                style={drawerLink(isActive)}
              >
                <div style={iconWrap(isActive)}>
                  <Icon name={icon} size={16} color={isActive ? '#34d371' : 'rgba(255,255,255,0.5)'} />
                </div>
                <span>{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Account Section */}
        {isAuthenticated && (
          <div style={{
            padding: '10px 10px 10px',
            marginTop: '8px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <p style={sectionLabel}>Account</p>

            <Link to="/nutrition-history" onClick={() => setMenuOpen(false)} style={drawerLink(false)}>
              <div style={iconWrap(false)}><Icon name="History" size={16} color="rgba(255,255,255,0.5)" /></div>
              <span>History</span>
            </Link>

            <Link to="/settings" onClick={() => setMenuOpen(false)} style={drawerLink(false)}>
              <div style={iconWrap(false)}><Icon name="Settings" size={16} color="rgba(255,255,255,0.5)" /></div>
              <span>Settings</span>
            </Link>

            <button
              onClick={() => { localStorage.removeItem('authToken'); window.location.href = '/login'; }}
              style={{
                ...drawerLink(false),
                width: '100%',
                background: 'none',
                border: '1px solid transparent',
                cursor: 'pointer',
                color: 'rgba(248,113,113,0.75)',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ ...iconWrap(false), background: 'rgba(248,113,113,0.07)' }}>
                <Icon name="LogOut" size={16} color="rgba(248,113,113,0.75)" />
              </div>
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

/* ── Sidebar styles only ── */

const sectionLabel = {
  fontSize: '10px',
  fontWeight: 500,
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.22)',
  padding: '8px 10px 5px',
  margin: 0,
};

const drawerLink = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '11px',
  padding: '9px 11px',
  borderRadius: '10px',
  marginBottom: '2px',
  textDecoration: 'none',
  fontSize: '13.5px',
  fontWeight: isActive ? 500 : 400,
  color: isActive ? '#34d371' : 'rgba(255,255,255,0.55)',
  background: isActive ? 'rgba(52,211,113,0.08)' : 'transparent',
  border: isActive ? '1px solid rgba(52,211,113,0.18)' : '1px solid transparent',
  transition: 'all 0.15s',
  cursor: 'pointer',
});

const iconWrap = (isActive) => ({
  width: '30px', height: '30px', flexShrink: 0,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: '8px',
  background: isActive ? 'rgba(52,211,113,0.1)' : 'rgba(255,255,255,0.05)',
});

export default Navbar;