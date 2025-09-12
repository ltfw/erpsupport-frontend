// views/admin/NavigationAdmin.js
import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CTabContent,
  CTabPane,
  CNav,
  CNavItem,
  CNavLink,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CFormInput,
  CFormSelect,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import axios from 'axios'

const NavigationAdmin = () => {
  const [activeTab, setActiveTab] = useState('groups')
  const [groups, setGroups] = useState([])
  const [items, setItems] = useState([])
  // const [roles, setRoles] = useState(['ADM', 'FAS','MKT-SANI', 'MKT-SANI (JABAR)', 'MKT-SANI (JATIM)', 'MKT-SANI (JATENG)', 'GUEST'])
  const [roles, setRoles] = useState([])
  const [access, setAccess] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Modal states
  const [groupModal, setGroupModal] = useState(false)
  const [itemModal, setItemModal] = useState(false)
  const [accessModal, setAccessModal] = useState(false)

  const [editGroup, setEditGroup] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [editAccess, setEditAccess] = useState(null)

  const API = import.meta.env.VITE_BACKEND_URL + 'admin/navigations'

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true)
      const [groupRes, itemRes, accessRes, rolesRes] = await Promise.all([
        axios.get(API + '/groups'),
        axios.get(API + '/items'),
        axios.get(API + '/access'),
        axios.get(API + '/roles'),
      ])
      setGroups(groupRes.data)
      setItems(itemRes.data)
      setAccess(accessRes.data)
      setRoles(rolesRes.data)
    } catch (err) {
      setError('Failed to load data')
      console.error('Error fetching navigation data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Reset modals
  const resetModals = () => {
    setEditGroup(null)
    setEditItem(null)
    setEditAccess(null)
    setError('')
    setSuccess('')
  }

  // --- GROUPS ---
  const saveGroup = async () => {
    try {
      if (editGroup.MenuKey && editGroup.DisplayName) {
        await axios.post(API + '/groups', editGroup)
        setSuccess('Menu group saved!')
        setGroupModal(false)
        fetchData()
      }
    } catch (err) {
      setError('Save failed')
    }
  }

  const deleteGroup = async (MenuKey) => {
    if (window.confirm('Delete this menu group?')) {
      await axios.delete(API + '/groups/' + MenuKey)
      setSuccess('Deleted!')
      fetchData()
    }
  }

  // --- ITEMS ---
  const saveItem = async () => {
    try {
      if (editItem.ItemKey && editItem.DisplayName && editItem.Route) {
        await axios.post(API + '/items', editItem)
        setSuccess('Item saved!')
        setItemModal(false)
        fetchData()
      }
    } catch (err) {
      setError('Save failed')
    }
  }

  const deleteItem = async (ItemKey) => {
    if (window.confirm('Delete this item?')) {
      await axios.delete(API + '/items/' + ItemKey)
      setSuccess('Deleted!')
      fetchData()
    }
  }

  // --- ACCESS ---
  const saveAccess = async () => {
    try {
      if (editAccess.RoleCode && editAccess.MenuKey) {
        await axios.post(API + '/access', editAccess)
        setSuccess('Access rule saved!')
        setAccessModal(false)
        fetchData()
      }
    } catch (err) {
      setError('Save failed')
    }
  }

  const deleteAccess = async (id) => {
    if (window.confirm('Delete this access rule?')) {
      await axios.delete(API + '/access/' + id)
      setSuccess('Deleted!')
      fetchData()
    }
  }

  return (
    <CCard>
      <CCardHeader>
        <h4>Navigation Management</h4>
      </CCardHeader>
      <CCardBody>
        {error && <CAlert color="danger">{error}</CAlert>}
        {success && <CAlert color="success">{success}</CAlert>}

        <CNav variant="tabs">
          <CNavItem>
            <CNavLink active={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>
              Menu Groups
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeTab === 'items'} onClick={() => setActiveTab('items')}>
              Menu Items
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={activeTab === 'access'} onClick={() => setActiveTab('access')}>
              Role Access
            </CNavLink>
          </CNavItem>
        </CNav>

        <CTabContent>
          {/* === TAB 1: Menu Groups === */}
          <CTabPane visible={activeTab === 'groups'}>
            <div className="mt-3">
              <CButton color="primary" onClick={() => { setEditGroup({}); setGroupModal(true); }}>
                <CIcon icon={cilPlus} /> Add Group
              </CButton>

              <table className="table table-striped mt-3">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Name</th>
                    <th>Sort</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <tr key={g.MenuKey}>
                      <td>{g.MenuKey}</td>
                      <td>{g.DisplayName}</td>
                      <td>{g.SortOrder}</td>
                      <td>
                        <CButton size="sm" color="info" onClick={() => { setEditGroup(g); setGroupModal(true); }}>
                          <CIcon icon={cilPencil} />
                        </CButton>{' '}
                        <CButton size="sm" color="danger" onClick={() => deleteGroup(g.MenuKey)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CTabPane>

          {/* === TAB 2: Menu Items === */}
          <CTabPane visible={activeTab === 'items'}>
            <div className="mt-3">
              <CButton color="primary" onClick={() => { setEditItem({}); setItemModal(true); }}>
                <CIcon icon={cilPlus} /> Add Item
              </CButton>

              <table className="table table-striped mt-3">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Menu</th>
                    <th>Name</th>
                    <th>Route</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.ItemKey}>
                      <td>{i.ItemKey}</td>
                      <td>{i.MenuKey}</td>
                      <td>{i.DisplayName}</td>
                      <td>{i.Route}</td>
                      <td>
                        <CButton size="sm" color="info" onClick={() => { setEditItem(i); setItemModal(true); }}>
                          <CIcon icon={cilPencil} />
                        </CButton>{' '}
                        <CButton size="sm" color="danger" onClick={() => deleteItem(i.ItemKey)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CTabPane>

          {/* === TAB 3: Role Access === */}
          <CTabPane visible={activeTab === 'access'}>
            <div className="mt-3">
              <CButton color="primary" onClick={() => { setEditAccess({}); setAccessModal(true); }}>
                <CIcon icon={cilPlus} /> Add Access Rule
              </CButton>

              <table className="table table-striped mt-3">
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Menu</th>
                    <th>Item</th>
                    <th>Environment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {access.map((a) => (
                    <tr key={a.Id}>
                      <td>{a.RoleCode}</td>
                      <td>{a.MenuKey}</td>
                      <td>{a.ItemKey || '(All Items)'}</td>
                      <td>{a.Environment}</td>
                      <td>
                        <CButton size="sm" color="info" onClick={() => { setEditAccess(a); setAccessModal(true); }}>
                          <CIcon icon={cilPencil} />
                        </CButton>{' '}
                        <CButton size="sm" color="danger" onClick={() => deleteAccess(a.Id)}>
                          <CIcon icon={cilTrash} />
                        </CButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CTabPane>
        </CTabContent>

        {/* === Modals === */}
        {/* Group Modal */}
        <CModal
          backdrop="static"
          keyboard={false} visible={groupModal} onClose={() => setGroupModal(false)} onDismiss={resetModals}>
          <CModalHeader>
            <CModalTitle>{editGroup?.MenuKey ? 'Edit' : 'Add'} Group</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <label>Key (e.g., customer)</label>
              <CFormInput value={editGroup?.MenuKey || ''} onChange={(e) => setEditGroup({ ...editGroup, MenuKey: e.target.value })} />
            </div>
            <div className="mb-3">
              <label>Name (e.g., Customer)</label>
              <CFormInput value={editGroup?.DisplayName || ''} onChange={(e) => setEditGroup({ ...editGroup, DisplayName: e.target.value })} />
            </div>
            <div className="mb-3">
              <label>Sort Order</label>
              <CFormInput type="number" value={editGroup?.SortOrder || 0} onChange={(e) => setEditGroup({ ...editGroup, SortOrder: parseInt(e.target.value) })} />
            </div>
            <CButton color="primary" onClick={saveGroup}>Save</CButton>
          </CModalBody>
        </CModal>

        {/* Item Modal */}
        <CModal backdrop="static"
          keyboard={false} visible={itemModal} onClose={() => setItemModal(false)} onDismiss={resetModals}>
          <CModalHeader>
            <CModalTitle>{editItem?.ItemKey ? 'Edit' : 'Add'} Item</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <label>Item Key</label>
              <CFormInput value={editItem?.ItemKey || ''} onChange={(e) => setEditItem({ ...editItem, ItemKey: e.target.value })} />
            </div>
            <div className="mb-3">
              <label>Menu</label>
              <CFormSelect value={editItem?.MenuKey || ''} onChange={(e) => setEditItem({ ...editItem, MenuKey: e.target.value })}>
                <option>Select Menu</option>
                {groups.map(g => <option key={g.MenuKey} value={g.MenuKey}>{g.DisplayName}</option>)}
              </CFormSelect>
            </div>
            <div className="mb-3">
              <label>Display Name</label>
              <CFormInput value={editItem?.DisplayName || ''} onChange={(e) => setEditItem({ ...editItem, DisplayName: e.target.value })} />
            </div>
            <div className="mb-3">
              <label>Route (e.g., /customer/customers)</label>
              <CFormInput value={editItem?.Route || ''} onChange={(e) => setEditItem({ ...editItem, Route: e.target.value })} />
            </div>
            <div className="mb-3">
              <label>Sort Order</label>
              <CFormInput type="number" value={editItem?.SortOrder || 0} onChange={(e) => setEditItem({ ...editItem, SortOrder: parseInt(e.target.value) })} />
            </div>
            <CButton color="primary" onClick={saveItem}>Save</CButton>
          </CModalBody>
        </CModal>

        {/* Access Modal */}
        <CModal backdrop="static"
          keyboard={false}
          visible={accessModal} onClose={() => setAccessModal(false)} onDismiss={resetModals}>
          <CModalHeader>
            <CModalTitle>{editAccess?.Id ? 'Edit' : 'Add'} Access Rule</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <label>Role</label>
              <CFormSelect value={editAccess?.RoleCode || ''} onChange={(e) => setEditAccess({ ...editAccess, RoleCode: e.target.value })}>
                <option>Select Role</option>
                {roles.map(r => <option key={r.UserRoleCode} value={r.UserRoleCode}>{r.UserRoleCode}</option>)}
              </CFormSelect>
            </div>
            <div className="mb-3">
              <label>Menu</label>
              <CFormSelect value={editAccess?.MenuKey || ''} onChange={(e) => setEditAccess({ ...editAccess, MenuKey: e.target.value })}>
                <option>Select Menu</option>
                {groups.map(g => <option key={g.MenuKey} value={g.MenuKey}>{g.DisplayName}</option>)}
              </CFormSelect>
            </div>
            <div className="mb-3">
              <label>Item (Optional - leave blank for full group)</label>
              <CFormSelect value={editAccess?.ItemKey || ''} onChange={(e) => setEditAccess({ ...editAccess, ItemKey: e.target.value || null })}>
                <option value="">(All Items in Menu)</option>
                {items.filter(i => i.MenuKey === editAccess?.MenuKey).map(i => (
                  <option key={i.ItemKey} value={i.ItemKey}>{i.DisplayName}</option>
                ))}
              </CFormSelect>
            </div>
            <div className="mb-3">
              <label>Environment</label>
              <CFormSelect value={editAccess?.Environment || 'All'} onChange={(e) => setEditAccess({ ...editAccess, Environment: e.target.value })}>
                <option value="All">All</option>
                <option value="Production">Production</option>
                <option value="Development">Development</option>
              </CFormSelect>
            </div>
            <div className="mb-3">
              <label>Sort Order</label>
              <CFormInput type="number" value={editAccess?.SortOrder || 0} onChange={(e) => setEditAccess({ ...editAccess, SortOrder: parseInt(e.target.value) })} />
            </div>
            <CButton color="primary" onClick={saveAccess}>Save</CButton>
          </CModalBody>
        </CModal>
      </CCardBody>
    </CCard>
  )
}

export default NavigationAdmin