import {useState, useEffect} from 'react'
import Layout from '../components/Layout'
import API from '../utils/axios'
import toast from 'react-hot-toast'

const CATEGORIES = ['Camera', 'Lighting', 'Audio', 'Costume', 'Stage Props', 'Recording', 'Event Infrastructure', 'Other']

const AdminAssets = () => {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState(null) 
  const [formData, setFormData] = useState({
    name: '', category: 'Camera', description: '', totalQuantity: ''
  })

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

  const handleEdit = (asset) => {
    setEditingAsset(asset)
    setFormData({
      name: asset.name,
      category: asset.category,
      description: asset.description || '',
      totalQuantity: asset.totalQuantity
    })
    setShowModal(true)
  }

  const handleAddNew = () => {
    setEditingAsset(null)
    setFormData({name: '', category: 'Camera', description: '', totalQuantity: ''})
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try{
      if(editingAsset){
        await API.put(`/assets/${editingAsset._id}`, formData)
        toast.success('Asset updated successfully!')
      } else {
        await API.post('/assets', formData)
        toast.success('Asset added successfully!')
      }
      setShowModal(false)
      fetchAssets()
    } 
    catch(error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  const handleDelete = async (assetId) => {
    if(!window.confirm('Are you sure you want to delete this asset?'))return
    try{
      await API.delete(`/assets/${assetId}`)
      toast.success('Asset deleted!')
      fetchAssets()
    } 
    catch(error) {
      toast.error('Failed to delete asset')
    }
  }

  return (
    <Layout>
      <div>
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.pageTitle}>Manage Assets</h1>
            <p style={styles.pageSubtitle}>Add, edit and manage all inventory</p>
          </div>
          <button onClick={handleAddNew} style={styles.addBtn}>
            + Add New Asset
          </button>
        </div>

        {loading ? (
          <p style={styles.loading}>Loading assets...</p>
        ) : (
          <div style={styles.tableCard}>
            {assets.length === 0 ? (
              <p style={styles.noData}>No assets added yet. Click "Add New Asset" to start!</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Asset Name</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Total Qty</th>
                    <th style={styles.th}>Available</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset._id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={styles.assetName}>{asset.name}</div>
                        <div style={styles.assetDesc}>{asset.description}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.categoryBadge}>{asset.category}</span>
                      </td>
                      <td style={styles.td}>{asset.totalQuantity}</td>
                      <td style={styles.td}>{asset.availableQuantity}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: asset.status === 'Available' ? '#10b98120' : '#ef444420',
                          color: asset.status === 'Available' ? '#10b981' : '#ef4444'
                        }}>
                          {asset.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => handleEdit(asset)} style={styles.editBtn}>
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDelete(asset._id)} style={styles.deleteBtn}>
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ADD/EDIT MODAL */}
        {showModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modal}>
              <h2 style={styles.modalTitle}>
                {editingAsset ? 'Edit Asset' : 'Add New Asset'}
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Asset Name</label>
                  <input
                    style={styles.input}
                    placeholder="e.g. Canon DSLR Camera"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Category</label>
                  <select
                    style={styles.input}
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea
                    style={{...styles.input, height: '80px', resize: 'vertical'}}
                    placeholder="Brief description of this asset"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Total Quantity</label>
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="How many units?"
                    min="1"
                    value={formData.totalQuantity}
                    onChange={(e) => setFormData({...formData, totalQuantity: e.target.value})}
                    required
                  />
                </div>

                <div style={styles.modalButtons}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.submitBtn}>
                    {editingAsset ? 'Update Asset' : 'Add Asset'}
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

const styles = {
  pageHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '24px'
  },
  pageTitle: {fontSize: '28px', fontWeight: '700', color: '#1a1a2e', marginBottom: '4px'},
  pageSubtitle: {color: '#888'},
  addBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer'
  },
  loading: {textAlign: 'center', padding: '40px', color: '#888'},
  tableCard: {
    background: 'white', borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden'
  },
  table: {width: '100%', borderCollapse: 'collapse' },
  tableHeader: { background: '#f9f9f9', borderBottom: '2px solid #eee' },
  th: { padding: '14px 16px', textAlign: 'left', fontSize: '13px', color: '#888', fontWeight: '600' },
  tableRow: {borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s' },
  td: {padding: '14px 16px', fontSize: '14px', color: '#333' },
  assetName: {fontWeight: '600', color: '#1a1a2e', marginBottom: '2px' },
  assetDesc: { fontSize: '12px', color: '#aaa' },
  categoryBadge: {
    padding: '3px 10px', borderRadius: '20px',
    background: '#667eea20', color: '#667eea',
    fontSize: '12px', fontWeight: '500'
  },
  statusBadge: {
    padding: '3px 10px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '500'
  },
  editBtn: {
    padding: '6px 12px', marginRight: '6px',
    background: '#f0f4ff', color: '#667eea',
    border: 'none', borderRadius: '6px',
    fontSize: '12px', cursor: 'pointer'
  },
  deleteBtn: {
    padding: '6px 12px',
    background: '#fff0f0', color: '#ef4444',
    border: 'none', borderRadius: '6px',
    fontSize: '12px', cursor: 'pointer'
  },
  noData: { textAlign: 'center', padding: '60px', color: '#aaa' },
  // Modal styles
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
  modalTitle: {fontSize: '20px', fontWeight: '700', color: '#1a1a2e', marginBottom: '24px'},
  inputGroup: {marginBottom: '16px'},
  label: {display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#444'},
  input: {
    width: '100%', padding: '10px 14px',
    border: '1px solid #ddd', borderRadius: '8px',
    fontSize: '14px', boxSizing: 'border-box', outline: 'none'
  },
  modalButtons: {display: 'flex', gap: '12px', marginTop: '8px'},
  cancelBtn: {
    flex: 1, padding: '11px',
    background: '#f5f5f5', color: '#666',
    border: 'none', borderRadius: '8px',
    fontSize: '14px', cursor: 'pointer'
  },
  submitBtn: {
    flex: 1, padding: '11px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white', border: 'none',
    borderRadius: '8px', fontSize: '14px',
    fontWeight: '600', cursor: 'pointer'
  }
}

export default AdminAssets