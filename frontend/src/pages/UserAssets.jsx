import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import API from '../utils/axios'
import toast from 'react-hot-toast'

const CATEGORIES = ['All', 'Camera', 'Lighting', 'Audio', 'Costume', 'Stage Props', 'Recording', 'Event Infrastructure', 'Other']

const UserAssets = () => {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [bookingModal, setBookingModal] = useState(null)
  const [bookingForm, setBookingForm] = useState({
    quantity: 1, purpose: '', startDate: '', endDate: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try{
      const res = await API.get('/assets')
      setAssets(res.data)
    } 
    catch(error) {
      toast.error('Failed to load assets')
    } 
    finally{
      setLoading(false)
    }
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try{
      await API.post('/bookings', {
        assetId: bookingModal._id,
        quantity: parseInt(bookingForm.quantity),
        purpose: bookingForm.purpose,
        startDate: bookingForm.startDate,
        endDate: bookingForm.endDate
      })
      toast.success('Booking request submitted! Waiting for admin approval.')
      setBookingModal(null)
      setBookingForm({ quantity: 1, purpose: '', startDate: '', endDate: '' })
    } 
    catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed')
    } 
    finally {
      setSubmitting(false)
    }
  }

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(search.toLowerCase()) ||
      asset.category.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || asset.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <Layout>
      <div>
        <h1 style={styles.pageTitle}>Browse Assets</h1>
        <p style={styles.pageSubtitle}>Browse and request assets for your events</p>

        <div style={styles.searchBar}>
          <input
            style={styles.searchInput}
            placeholder="🔍 Search assets by name or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={styles.categoryTabs}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                ...styles.categoryTab,
                ...(categoryFilter === cat ? styles.categoryTabActive : {})
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p style={styles.loading}>Loading assets...</p>
        ) : filteredAssets.length === 0 ? (
          <p style={styles.noData}>No assets found matching your search</p>
        ) : (
          <div style={styles.assetsGrid}>
            {filteredAssets.map(asset => (
              <div key={asset._id} style={styles.assetCard}>
                
                <div style={styles.assetIconBox}>
                  {categoryIcons[asset.category] || '📦'}
                </div>

                <div style={styles.assetInfo}>
                  <h3 style={styles.assetName}>{asset.name}</h3>
                  <span style={styles.categoryBadge}>{asset.category}</span>
                  {asset.description && (
                    <p style={styles.assetDesc}>{asset.description}</p>
                  )}

                  <div style={styles.quantityRow}>
                    <span style={styles.quantityText}>
                      Available: <strong>{asset.availableQuantity}</strong> / {asset.totalQuantity}
                    </span>
                    <span style={{
                      ...styles.statusDot,
                      background: asset.availableQuantity > 0 ? '#10b981' : '#ef4444'
                    }} />
                  </div>

                  <button
                    onClick={() => {
                      if (asset.availableQuantity === 0) return
                      setBookingModal(asset)
                    }}
                    style={{
                      ...styles.bookBtn,
                      ...(asset.availableQuantity === 0 ? styles.bookBtnDisabled : {})
                    }}
                    disabled={asset.availableQuantity === 0}
                  >
                    {asset.availableQuantity === 0 ? 'Not Available' : '📩 Request Booking'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {bookingModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h3 style={styles.modalTitle}>Request Booking</h3>
              <p style={styles.modalAssetName}>
                {categoryIcons[bookingModal.category]} {bookingModal.name}
              </p>
              <p style={styles.modalAvailable}>
                Available: {bookingModal.availableQuantity} units
              </p>

              <form onSubmit={handleBookingSubmit}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Quantity Needed</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="1"
                    max={bookingModal.availableQuantity}
                    value={bookingForm.quantity}
                    onChange={(e) => setBookingForm({...bookingForm, quantity: e.target.value})}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Purpose / Reason</label>
                  <textarea
                    style={{...styles.input, height: '80px', resize: 'vertical'}}
                    placeholder="e.g. Photography for Thomso cultural fest"
                    value={bookingForm.purpose}
                    onChange={(e) => setBookingForm({...bookingForm, purpose: e.target.value})}
                    required
                  />
                </div>

                <div style={styles.dateRow}>
                  <div style={{...styles.inputGroup, flex: 1}}>
                    <label style={styles.label}>Start Date</label>
                    <input
                      style={styles.input}
                      type="date"
                      value={bookingForm.startDate}
                      onChange={(e) => setBookingForm({...bookingForm, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div style={{...styles.inputGroup, flex: 1}}>
                    <label style={styles.label}>End Date</label>
                    <input
                      style={styles.input}
                      type="date"
                      value={bookingForm.endDate}
                      onChange={(e) => setBookingForm({...bookingForm, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div style={styles.modalButtons}>
                  <button
                    type="button"
                    onClick={() => setBookingModal(null)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={styles.submitBtn}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

const categoryIcons = {
  'Camera': '📷',
  'Lighting': '💡',
  'Audio': '🎙️',
  'Costume': '👗',
  'Stage Props': '🎭',
  'Recording': '🎬',
  'Event Infrastructure': '🏗️',
  'Other': '📦'
}

const styles = {
  pageTitle: {fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px'},
  pageSubtitle: {color: '#888', marginBottom: '20px'},
  searchBar: {marginBottom: '16px'},
  searchInput: {
    width: '100%', padding: '12px 16px',
    border: '1px solid #ddd', borderRadius: '10px',
    fontSize: '14px', boxSizing: 'border-box',
    outline: 'none', background: 'white'
  },
  categoryTabs: {
    display: 'flex', gap: '8px',
    flexWrap: 'wrap', marginBottom: '20px'
  },
  categoryTab: {
    padding: '6px 14px', border: '1px solid #e0e0e0',
    borderRadius: '20px', background: 'white',
    cursor: 'pointer', fontSize: '13px', color: '#666'
  },
  categoryTabActive: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none'
  },
  loading: {textAlign: 'center', padding: '40px', color: '#888'},
  noData: {textAlign: 'center', padding: '60px', color: '#aaa'},
  assetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  assetCard: {
    background: 'white', borderRadius: '12px',
    padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    display: 'flex', gap: '16px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  assetIconBox: {
    width: '52px', height: '52px',
    background: '#f0f2ff', borderRadius: '12px',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '26px',
    flexShrink: 0
  },
  assetInfo: {flex: 1},
  assetName: {fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '6px'},
  categoryBadge: {
    padding: '2px 10px', borderRadius: '20px',
    background: '#667eea20', color: '#667eea',
    fontSize: '11px', fontWeight: '500'
  },
  assetDesc: {
    fontSize: '12px', color: '#888',
    marginTop: '8px', lineHeight: '1.5'
  },
  quantityRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '10px', marginBottom: '12px'
  },
  quantityText: {fontSize: '13px', color: '#555'},
  statusDot: {
    width: '8px', height: '8px',
    borderRadius: '50%'
  },
  bookBtn: {
    width: '100%', padding: '9px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none',
    borderRadius: '8px', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer'
  },
  bookBtnDisabled: {
    background: '#e0e0e0', color: '#aaa', cursor: 'not-allowed'
  },
  modalOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  },
  modal: {
    background: 'white', borderRadius: '16px',
    padding: '32px', width: '100%',
    maxWidth: '480px', maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalTitle: {fontSize: '20px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px'},
  modalAssetName: {fontSize: '16px', color: '#555', marginBottom: '4px'},
  modalAvailable: {fontSize: '13px', color: '#10b981', marginBottom: '20px', fontWeight: '600'},
  inputGroup: {marginBottom: '16px'},
  label: {display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#444'},
  input: {
    width: '100%', padding: '10px 14px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none'
  },
  dateRow: {display: 'flex', gap: '12px'},
  modalButtons: {display: 'flex', gap: '12px', marginTop: '8px'},
  cancelBtn: {
    flex: 1, padding: '11px', background: '#f5f5f5',
    color: '#666', border: 'none', borderRadius: '8px',
    fontSize: '14px', cursor: 'pointer'
  },
  submitBtn: {
    flex: 1, padding: '11px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  }
}

export default UserAssets