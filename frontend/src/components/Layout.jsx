import {useNavigate, useLocation, Link} from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Layout = ({ children }) => {
  const {user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() 

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const adminLinks = [
    {path: '/admin/dashboard', label: '📊 Dashboard',},
    {path: '/admin/assets', label: '📦 Manage Assets'},
    {path: '/admin/bookings', label: '📋 All Bookings'},
  ]

  const userLinks = [
    {path: '/user/assets', label: '📦 Browse Assets'},
    {path: '/user/my-bookings', label: '📋 My Bookings'},
  ]

  const links = user?.role === 'admin' ? adminLinks : userLinks

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>🏛️</div>
          <div>
            <div style={styles.logoTitle}>Cultural Council</div>
            <div style={styles.logoSubtitle}>IIT Roorkee</div>
          </div>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>
              {user?.role === 'admin' ? '🔑 Admin' : '👤 User'}
            </div>
          </div>
        </div>

        <nav style={styles.nav}>
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                ...styles.navLink,
                ...(location.pathname === link.path ? styles.navLinkActive : {})
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          🚪 Logout
        </button>
      </div>

      <div style={styles.main}>
        {children}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  sidebar: {
    width: '260px',
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logoIcon: {
    fontSize: '32px',
  },
  logoTitle: {
    color: 'white',
    fontWeight: '700',
    fontSize: '14px',
  },
  logoSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    margin: '12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '10px',
  },
  userAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '16px',
    flexShrink: 0,
  },
  userName: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
  },
  userRole: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
    marginTop: '2px',
  },
  nav: {
    flex: 1,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navLink: {
    display: 'block',
    padding: '12px 16px',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  navLinkActive: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
  },
  logoutBtn: {
    margin: '12px',
    padding: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    fontSize: '14px',
    textAlign: 'left',
  },
  main: {
    marginLeft: '260px',
    flex: 1,
    padding: '24px',
    minHeight: '100vh',
    background: '#f0f2f5',
  }
}

export default Layout