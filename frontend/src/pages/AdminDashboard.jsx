import {useState, useEffect} from 'react'
import Layout from '../components/Layout'
import API from '../utils/axios'
import {BarChart,Bar, XAxis, YAxis, CartesianGrid,Tooltip, PieChart, Pie, Cell, ResponsiveContainer} from 'recharts'

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try{
        const res = await API.get('/analytics/dashboard')
        setStats(res.data)
      } 
      catch(error) {
        console.error('Failed to fetch stats')
      } 
      finally{
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if(loading)return <Layout><div style={styles.loading}>Loading dashboard...</div></Layout>

  return (
    <Layout>
      <div>
        <h1 style={styles.pageTitle}>Dashboard</h1>
        <p style={styles.pageSubtitle}>Welcome to the Asset Management System</p>

        <div style={styles.cardsGrid}>
          <StatCard label="Total Assets" value={stats?.summary?.totalAssets} icon="📦" color="#667eea" />
          <StatCard label="Total Users" value={stats?.summary?.totalUsers} icon="👥" color="#764ba2" />
          <StatCard label="Total Bookings" value={stats?.summary?.totalBookings} icon="📋" color="#f093fb" />
          <StatCard label="Overdue Returns" value={stats?.summary?.overdueCount} icon="⚠️" color="#ff6b6b" />
          <StatCard label="Available Assets" value={stats?.summary?.availableAssets} icon="✅" color="#43e97b" />
          <StatCard label="Pending Requests" value={stats?.bookingStatusBreakdown?.pending} icon="⏳" color="#4facfe" />
        </div>

        <div style={styles.chartsRow}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Booking Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={[
                    {name: 'Pending', value: stats?.bookingStatusBreakdown?.pending || 0},
                    {name: 'Approved', value: stats?.bookingStatusBreakdown?.approved || 0},
                    {name: 'Rejected', value: stats?.bookingStatusBreakdown?.rejected || 0},
                    {name: 'Issued', value: stats?.bookingStatusBreakdown?.issued || 0},
                    {name: 'Returned', value: stats?.bookingStatusBreakdown?.returned || 0},
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={index} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Most Borrowed Assets</h3>
            {stats?.mostBorrowedAssets?.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.mostBorrowedAssets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="borrowCount" fill="#667eea" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={styles.noData}>No booking data yet</p>
            )}
          </div>
        </div>

        <div style={styles.fullChartCard}>
          <h3 style={styles.chartTitle}>Assets by Category</h3>
          {stats?.categoryBreakdown?.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#764ba2" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={styles.noData}>No assets added yet</p>
          )}
        </div>

        <div style={styles.tableCard}>
          <h3 style={styles.chartTitle}>Recent Booking Requests</h3>
          {stats?.recentBookings?.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Asset</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((booking) => (
                  <tr key={booking._id} style={styles.tableRow}>
                    <td style={styles.td}>{booking.user?.name}</td>
                    <td style={styles.td}>{booking.asset?.name}</td>
                    <td style={styles.td}>{booking.quantity}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: statusColors[booking.status]
                      }}>
                        {booking.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={styles.noData}>No bookings yet</p>
          )}
        </div>
      </div>
    </Layout>
  )
}

const StatCard = ({label, value, icon, color}) => (
  <div style={styles.statCard}>
    <div style={{...styles.statIcon, background: color + '20', color: color}}>
      {icon}
    </div>
    <div>
      <div style={styles.statValue}>{value ?? 0}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  </div>
)

const statusColors = {
  pending: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  issued: '#3b82f6',
  returned: '#6b7280',
}

const styles = {
  loading: {padding: '40px', textAlign: 'center', color: '#666'},
  pageTitle: {fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px'},
  pageSubtitle: {color: '#888', marginBottom: '24px'},
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
  },
  statValue: {fontSize: '28px', fontWeight: '700', color: '#1a1a2e'},
  statLabel: {fontSize: '12px', color: '#888', marginTop: '2px'},
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  chartCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  fullChartCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    marginBottom: '16px',
  },
  chartTitle: {fontSize: '16px', fontWeight: '600', color: '#1a1a2e', marginBottom: '16px'},
  noData: {color: '#aaa', textAlign: 'center', padding: '40px 0'},
  tableCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  table: {width: '100%', borderCollapse: 'collapse'},
  tableHeader: {borderBottom: '2px solid #f0f0f0'},
  th: {padding: '10px 12px', textAlign: 'left', fontSize: '13px', color: '#888', fontWeight: '600'},
  tableRow: {borderBottom: '1px solid #f9f9f9'},
  td: {padding: '12px', fontSize: '14px', color: '#333'},
  badge: {
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    color: 'white',
    fontWeight: '500',
  }
}

export default AdminDashboard