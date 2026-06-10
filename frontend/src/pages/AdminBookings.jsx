import {useState, useEffect} from 'react'
import Layout from '../components/Layout'
import API from '../utils/axios'
import toast from 'react-hot-toast'

const AdminBookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') 
  const [rejectModal, setRejectModal] = useState(null) 
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try{
      const res = await API.get('/bookings')
      setBookings(res.data)
    } 
    catch(error) {
      toast.error('Failed to load bookings')
    } 
    finally{
      setLoading(false)
    }
  }

  const handleApprove = async (bookingId) => {
    try{
      await API.put(`/bookings/${bookingId}/approve`)
      toast.success('Booking approved!')
      fetchBookings()
    } 
    catch(error) {
      toast.error(error.response?.data?.message || 'Failed to approve')
    }
  }

  const handleReject = async () => {
    try{
      await API.put(`/bookings/${rejectModal}/reject`, { reason: rejectReason })
      toast.success('Booking rejected')
      setRejectModal(null)
      setRejectReason('')
      fetchBookings()
    } 
    catch(error) {
      toast.error('Failed to reject booking')
    }
  }

  const handleIssue = async (bookingId) => {
    try{
      await API.put(`/bookings/${bookingId}/issue`)
      toast.success('Asset marked as issued!')
      fetchBookings()
    } 
    catch(error) {
      toast.error(error.response?.data?.message || 'Failed to issue')
    }
  }

  const handleReturn = async (bookingId) => {
    try{
      await API.put(`/bookings/${bookingId}/return`)
      toast.success('Asset returned successfully!')
      fetchBookings()
    } 
    catch(error) {
      toast.error(error.response?.data?.message || 'Failed to mark return')
    }
  }

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  return (
    <Layout>
      <div>
        <h1 style={styles.pageTitle}>All Bookings</h1>
        <p style={styles.pageSubtitle}>Manage all booking requests and asset allocations</p>

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
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span style={styles.filterCount}>
                {status === 'all' ? bookings.length : bookings.filter(b => b.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <p style={styles.loading}>Loading bookings...</p>
        ) : (
          <div style={styles.tableCard}>
            {filteredBookings.length === 0 ? (
              <p style={styles.noData}>No bookings found</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Asset</th>
                    <th style={styles.th}>Qty</th>
                    <th style={styles.th}>Purpose</th>
                    <th style={styles.th}>Dates</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={styles.boldText}>{booking.user?.name}</div>
                        <div style={styles.smallText}>{booking.user?.email}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.boldText}>{booking.asset?.name}</div>
                        <div style={styles.smallText}>{booking.asset?.category}</div>
                      </td>
                      <td style={styles.td}>{booking.quantity}</td>
                      <td style={styles.td}>
                        <div style={styles.purposeText}>{booking.purpose}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.smallText}>
                          From: {new Date(booking.startDate).toLocaleDateString()}
                        </div>
                        <div style={styles.smallText}>
                          To: {new Date(booking.endDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          ...statusStyles[booking.status]
                        }}>
                          {booking.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {booking.status === 'pending' && (
                          <div style={styles.actionBtns}>
                            <button
                              onClick={() => handleApprove(booking._id)}
                              style={styles.approveBtn}
                            >
                              ✅ Approve
                            </button>
                            <button
                              onClick={() => setRejectModal(booking._id)}
                              style={styles.rejectBtn}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        )}
                        {booking.status === 'approved' && (
                          <button
                            onClick={() => handleIssue(booking._id)}
                            style={styles.issueBtn}
                          >
                            📦 Issue
                          </button>
                        )}
                        {booking.status === 'issued' && (
                          <div>
                            <button
                              onClick={() => handleReturn(booking._id)}
                              style={styles.returnBtn}
                            >
                              🔄 Return
                            </button>
                            {(() => {
                              if(!booking.issuedAt)return false;
                              const requestedDuration = new Date(booking.endDate) - new Date(booking.startDate);
                              const actualDueDate = new Date(new Date(booking.issuedAt).getTime() + requestedDuration);
                              return actualDueDate < new Date();
                            })() && (
                              <div style={styles.overdueText}>⚠️ Overdue!</div>
                            )}
                          </div>
                        )}
                        {booking.status === 'returned' && (
                          <span style={styles.doneText}>✅ Completed</span>
                        )}
                        {booking.status === 'rejected' && (
                          <span style={styles.rejectedText}>
                            Reason: {booking.rejectionReason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {rejectModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Reject Booking</h3>
              <p style={styles.modalSubtitle}>
                Please provide a reason for rejection (optional)
              </p>
              <textarea
                style={styles.textarea}
                placeholder="e.g. Asset not available during this period"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div style={styles.modalButtons}>
                <button
                  onClick={() => { setRejectModal(null); setRejectReason('') }}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button onClick={handleReject} style={styles.confirmRejectBtn}>
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

const statusStyles = {
  pending:  {background: '#fef3c720', color: '#f59e0b'},
  approved: {background: '#d1fae520', color: '#10b981'},
  rejected: {background: '#fee2e220', color: '#ef4444'},
  issued:   {background: '#dbeafe20', color: '#3b82f6'},
  returned: {background: '#f3f4f620', color: '#6b7280'},
}

const styles = {
  pageTitle: {fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px'},
  pageSubtitle: {color: '#888', marginBottom: '20px'},
  filterTabs: {
    display: 'flex', gap: '8px',
    marginBottom: '20px', flexWrap: 'wrap'
  },
  filterTab: {
    padding: '8px 16px', border: '1px solid #e0e0e0',
    borderRadius: '20px', background: 'white',
    cursor: 'pointer', fontSize: '13px',
    color: '#666', display: 'flex',
    alignItems: 'center', gap: '6px'
  },
  filterTabActive: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none'
  },
  filterCount: {
    background: 'rgba(255,255,255,0.3)',
    padding: '1px 7px', borderRadius: '10px',
    fontSize: '11px'
  },
  loading: {textAlign: 'center', padding: '40px', color: '#888'},
  tableCard: {
    background: 'white', borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflow: 'auto'
  },
  table: {width: '100%', borderCollapse: 'collapse', minWidth: '900px'},
  tableHeader: {background: '#f9f9f9', borderBottom: '2px solid #eee'},
  th: {padding: '14px 16px', textAlign: 'left', fontSize: '13px', color: '#888', fontWeight: '600'},
  tableRow: {borderBottom: '1px solid #f5f5f5'},
  td: {padding: '14px 16px', fontSize: '14px', color: '#333', verticalAlign: 'top'},
  boldText: {fontWeight: '600', color: '#1a1a2e', marginBottom: '2px'},
  smallText: {fontSize: '12px', color: '#aaa'},
  purposeText: {fontSize: '13px', color: '#555', maxWidth: '150px'},
  statusBadge: {
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600',
    border: '1px solid currentColor'
  },
  actionBtns: {display: 'flex', flexDirection: 'column', gap: '6px'},
  approveBtn: {
    padding: '6px 12px', background: '#d1fae5',
    color: '#10b981', border: 'none',
    borderRadius: '6px', cursor: 'pointer',
    fontSize: '12px', fontWeight: '600'
  },
  rejectBtn: {
    padding: '6px 12px', background: '#fee2e2',
    color: '#ef4444', border: 'none',
    borderRadius: '6px', cursor: 'pointer',
    fontSize: '12px', fontWeight: '600'
  },
  issueBtn: {
    padding: '6px 12px', background: '#dbeafe',
    color: '#3b82f6', border: 'none',
    borderRadius: '6px', cursor: 'pointer',
    fontSize: '12px', fontWeight: '600'
  },
  returnBtn: {
    padding: '6px 12px', background: '#f3f4f6',
    color: '#6b7280', border: 'none',
    borderRadius: '6px', cursor: 'pointer',
    fontSize: '12px', fontWeight: '600'
  },
  overdueText: {fontSize: '11px', color: '#ef4444', marginTop: '4px'},
  doneText: {fontSize: '12px', color: '#10b981'},
  rejectedText: {fontSize: '11px', color: '#ef4444', maxWidth: '120px'},
  noData: {textAlign: 'center', padding: '60px', color: '#aaa'},
  modalOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  },
  modal: {
    background: 'white', borderRadius: '16px',
    padding: '32px', width: '100%', maxWidth: '440px'
  },
  modalTitle: {fontSize: '20px', fontWeight: '700', color: '#1a1a2e', marginBottom: '8px'},
  modalSubtitle: {color: '#888', fontSize: '14px', marginBottom: '16px'},
  textarea: {
    width: '100%', padding: '12px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '14px', height: '100px',
    resize: 'vertical', boxSizing: 'border-box'
  },
  modalButtons: {display: 'flex', gap: '12px', marginTop: '16px'},
  cancelBtn: {
    flex: 1, padding: '11px', background: '#f5f5f5',
    color: '#666', border: 'none', borderRadius: '8px',
    fontSize: '14px', cursor: 'pointer'
  },
  confirmRejectBtn: {
    flex: 1, padding: '11px', background: '#ef4444',
    color: 'white', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  }
}

export default AdminBookings