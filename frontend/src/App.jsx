import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import {Toaster} from 'react-hot-toast'
import {useAuth} from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminAssets from './pages/AdminAssets'
import AdminBookings from './pages/AdminBookings'
import UserAssets from './pages/UserAssets'
import UserBookings from './pages/UserBookings'
import './App.css'

function App() {
  const {user, loading} = useAuth()

  if(loading)return <div>Loading...</div>

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/assets'} />} />
        <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/assets'} />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/admin/dashboard" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin/assets" element={user?.role === 'admin' ? <AdminAssets /> : <Navigate to="/login" />} />
        <Route path="/admin/bookings" element={user?.role === 'admin' ? <AdminBookings /> : <Navigate to="/login" />} />
        <Route path="/user/assets" element={user ? <UserAssets /> : <Navigate to="/login" />} />
        <Route path="/user/my-bookings" element={user ? <UserBookings /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App