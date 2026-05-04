import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/pantry', label: 'Pantry' },
    { to: '/ai', label: 'AI Assistant' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <header style={styles.header}>
      <div className="container" style={styles.inner}>
        <NavLink to="/dashboard" style={styles.brand}>
          Smart Pantry
        </NavLink>

        {user && (
          <>
            <nav style={styles.nav}>
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  style={({ isActive }) => ({
                    ...styles.navLink,
                    ...(isActive ? styles.navLinkActive : {}),
                  })}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>

            {/* Mobile hamburger */}
            <button
              style={styles.hamburger}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span style={styles.bar} />
              <span style={styles.bar} />
              <span style={styles.bar} />
            </button>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {user && menuOpen && (
        <div style={styles.mobileMenu}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={handleLogout} style={{ margin: '8px 16px' }}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: '#ffffff',
    borderBottom: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-sm)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    height: '64px',
    maxWidth: '960px',
    margin: '0 auto',
    padding: '0 20px',
  },
  brand: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--color-accent)',
    textDecoration: 'none',
    letterSpacing: '-0.2px',
    flexShrink: 0,
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
  },
  navLink: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--color-text-muted)',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    transition: 'background 0.15s, color 0.15s',
  },
  navLinkActive: {
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-surface-alt)',
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: '5px',
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  bar: {
    display: 'block',
    width: '22px',
    height: '2px',
    backgroundColor: 'var(--color-text)',
    borderRadius: '2px',
  },
  mobileMenu: {
    display: 'none',
    flexDirection: 'column',
    borderTop: '1px solid var(--color-border)',
    backgroundColor: '#ffffff',
    padding: '8px 0',
  },
  mobileLink: {
    display: 'block',
    padding: '10px 16px',
    fontSize: '15px',
    color: 'var(--color-text)',
    textDecoration: 'none',
  },
};

// Simple responsive: show hamburger on small screens
const mediaStyle = `
  @media (max-width: 620px) {
    .navbar-nav { display: none !important; }
    .navbar-logout-desktop { display: none !important; }
    .navbar-hamburger { display: flex !important; }
    .navbar-mobile-menu { display: flex !important; }
  }
`;

export default Navbar;
