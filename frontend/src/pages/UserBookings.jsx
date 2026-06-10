import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import API from '../utils/axios'
import toast from 'react-hot-toast'

const UserBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchMyBookings()
  }, [])

  const fetchMyBookings = async () => {
    try{
      const res = await API.get('/bookings/my')
      setBookings(res.data)
    }
    catch(error) {
      toast.error('Failed to load your bookings')
    } 
    finally{
      setLoading(false)
    }
  }

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <Layout>
      <div>
        <h1 style={styles.pageTitle}>My Bookings</h1>
        <p style={styles.pageSubtitle}>Track all your booking requests and active loans</p>

        <div style={styles.filterTabs}>
          {['all', 'pending', 'approved', 'issued', 'returned', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                ...styles.filterTab,
                ...(filter === status ? styles.filterTabActive : {})
              }}
            >
              {statusEmojis[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
              <span style={styles.count}>
                {status === 'all' ? bookings.length : bookings.filter(b => b.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <p style={styles.loading}>Loading your bookings...</p>
        ) : filteredBookings.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <h3 style={styles.emptyTitle}>No bookings found</h3>
            <p style={styles.emptyText}>
              {filter === 'all' ? "You haven't made any booking requests yet. Browse assets to get started!" : `No ${filter} bookings found`}
            </p>
          </div>
        ) : (
          <div style={styles.bookingsList}>
            {filteredBookings.map(booking => (
              <div key={booking._id} style={styles.bookingCard}>

                <div style={styles.assetSection}>
                  <div style={styles.assetIcon}>
                    {categoryIcons[booking.asset?.category] || '📦'}
                  </div>
                  <div>
                    <h3 style={styles.assetName}>{booking.asset?.name}</h3>
                    <span style={styles.categoryBadge}>{booking.asset?.category}</span>
                  </div>
                </div>

                <div style={styles.detailsSection}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Quantity:</span>
                    <span style={styles.detailValue}>{booking.quantity} unit(s)</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Purpose:</span>
                    <span style={styles.detailValue}>{booking.purpose}</span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>From:</span>
                    <span style={styles.detailValue}>
                      {new Date(booking.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>To:</span>
                    <span style={styles.detailValue}>
                      {new Date(booking.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {booking.issuedAt && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Issued:</span>
                      <span style={styles.detailValue}>
                        {new Date(booking.issuedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {booking.returnedAt && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Returned:</span>
                      <span style={styles.detailValue}>
                        {new Date(booking.returnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {booking.status === 'rejected' && booking.rejectionReason && (
                    <div style={styles.rejectionBox}>
                      ❌ Reason: {booking.rejectionReason}
                    </div>
                  )}
                  {booking.status === 'issued' && (() => {
                    if (!booking.issuedAt) return false;
                    const requestedDuration = new Date(booking.endDate) - new Date(booking.startDate);
                    const actualDueDate = new Date(new Date(booking.issuedAt).getTime() + requestedDuration);
                    return actualDueDate < new Date();
                  })() && (
                    <div style={styles.overdueBox}>
                        ⚠️ This asset is overdue! Please return it immediately.
                    </div>
                  )}
                </div>

                <div style={styles.statusSection}>
                  <span style={{
                    ...styles.statusBadge,
                    ...statusStyles[booking.status]
                  }}>
                    {statusEmojis[booking.status]} {booking.status}
                  </span>
                  <div style={styles.requestDate}>
                    Requested on {new Date(booking.createdAt).toLocaleDateString()}
                  </div>

                  <div style={styles.statusHint}>
                    {statusHints[booking.status]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

const categoryIcons = {
  'Camera': '📷', 'Lighting': '💡', 'Audio': '🎙️',
  'Costume': '👗', 'Stage Props': '🎭', 'Recording': '🎬',
  'Event Infrastructure': '🏗️', 'Other': '📦'
}

const statusEmojis = {
  all: '📋', pending: '⏳', approved: '✅',
  issued: '📦', returned: '🔄', rejected: '❌'
}

const statusHints = {
  pending: 'Waiting for admin review',
  approved: 'Approved! Collect your asset from admin',
  issued: 'Asset is with you — remember to return on time',
  returned: 'Completed successfully',
  rejected: 'Request was not approved'
}

const statusStyles = {
  pending:  { background: '#fef3c7', color: '#f59e0b' },
  approved: { background: '#d1fae5', color: '#10b981' },
  rejected: { background: '#fee2e2', color: '#ef4444' },
  issued:   { background: '#dbeafe', color: '#3b82f6' },
  returned: { background: '#f3f4f6', color: '#6b7280' },
}

const styles = {
  pageTitle: { fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px' },
  pageSubtitle: { color: '#888', marginBottom: '20px' },
  filterTabs: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' },
  filterTab: {
    padding: '8px 14px', border: '1px solid #e0e0e0',
    borderRadius: '20px', background: 'white',
    cursor: 'pointer', fontSize: '13px', color: '#666',
    display: 'flex', alignItems: 'center', gap: '6px'
  },
  filterTabActive: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none'
  },
  count: {
    background: 'rgba(0,0,0,0.1)',
    padding: '1px 7px', borderRadius: '10px', fontSize: '11px'
  },
  loading: { textAlign: 'center', padding: '40px', color: '#888' },
  emptyState: { textAlign: 'center', padding: '80px 40px' },
  emptyIcon: { fontSize: '48px', marginBottom: '16px' },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '8px' },
  emptyText: { color: '#aaa', fontSize: '14px' },
  bookingsList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  bookingCard: {
    background: 'white', borderRadius: '12px',
    padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex', gap: '20px', alignItems: 'flex-start'
  },
  assetSection: {
    display: 'flex', gap: '12px',
    alignItems: 'flex-start', minWidth: '180px'
  },
  assetIcon: {
    width: '44px', height: '44px', background: '#f0f2ff',
    borderRadius: '10px', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '22px', flexShrink: 0
  },
  assetName: { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '6px' },
  categoryBadge: {
    padding: '2px 10px', borderRadius: '20px',
    background: '#667eea20', color: '#667eea',
    fontSize: '11px', fontWeight: '500'
  },
  detailsSection: { flex: 1 },
  detailRow: { display: 'flex', gap: '8px', marginBottom: '4px' },
  detailLabel: { fontSize: '12px', color: '#aaa', minWidth: '65px' },
  detailValue: { fontSize: '12px', color: '#333', fontWeight: '500' },
  rejectionBox: {
    marginTop: '8px', padding: '8px 12px',
    background: '#fee2e2', borderRadius: '8px',
    fontSize: '12px', color: '#ef4444'
  },
  overdueBox: {
    marginTop: '8px', padding: '8px 12px',
    background: '#fff3cd', borderRadius: '8px',
    fontSize: '12px', color: '#f59e0b'
  },
  statusSection: { minWidth: '160px', textAlign: 'right' },
  statusBadge: {
    display: 'inline-block', padding: '5px 14px',
    borderRadius: '20px', fontSize: '12px',
    fontWeight: '600', marginBottom: '8px'
  },
  requestDate: { fontSize: '11px', color: '#aaa', marginBottom: '8px' },
  statusHint: {
    fontSize: '11px', color: '#888',
    fontStyle: 'italic', maxWidth: '150px',
    marginLeft: 'auto'
  }
}

export default UserBookings