import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';

export default function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    staff_id: '',
    first_name: '',
    last_name: '',
    password: '',
    department: '',
  });
  const [editingStaff, setEditingStaff] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchStaffMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStaffMembers(data || []);
    } catch (error) {
      setError('Error fetching staff members');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const handleEditClick = (staff) => {
    setEditingStaff({
      ...staff,
      password: '' // Don't show existing password
    });
    setShowEditModal(true);
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updates = {
        first_name: editingStaff.first_name,
        last_name: editingStaff.last_name,
        department: editingStaff.department
      };
      
      // Only update password if a new one is provided
      if (editingStaff.password) {
        updates.password = editingStaff.password;
      }

      const { error } = await supabase
        .from('staff')
        .update(updates)
        .eq('id', editingStaff.id);

      if (error) throw error;

      setShowEditModal(false);
      setEditingStaff(null);
      fetchStaffMembers();
    } catch (error) {
      setError('Error updating staff member');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId);

      if (error) throw error;
      fetchStaffMembers();
    } catch (error) {
      setError('Error deleting staff member');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add Staff form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff((prev) => ({ ...prev, [name]: value }));
  };

  // Add Staff form submit handler
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Validate required fields
    if (!newStaff.staff_id || !newStaff.first_name || !newStaff.last_name || !newStaff.password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    try {
      const { error } = await supabase.from('staff').insert([
        {
          staff_id: newStaff.staff_id,
          first_name: newStaff.first_name,
          last_name: newStaff.last_name,
          password: newStaff.password,
          department: newStaff.department,
        },
      ]);
      if (error) throw error;
      setShowAddModal(false);
      setNewStaff({ staff_id: '', first_name: '', last_name: '', password: '', department: '' });
      fetchStaffMembers();
    } catch (error) {
      setError('Failed to add staff member.');
      console.error('Add staff error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-section">
      <h2>Staff Management</h2>
      <div className="content-card">
        <h3>Staff Directory</h3>
        <div className="action-buttons">
          <button 
            className="primary-btn"
            onClick={() => setShowAddModal(true)}
          >
            Add Staff
          </button>
        </div>

        {/* Add Staff Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New Staff Member</h3>
              <form onSubmit={handleAddStaff}>
                <div className="form-group">
                  <label>Staff ID*</label>
                  <input
                    type="text"
                    name="staff_id"
                    value={newStaff.staff_id}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>First Name*</label>
                  <input
                    type="text"
                    name="first_name"
                    value={newStaff.first_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name*</label>
                  <input
                    type="text"
                    name="last_name"
                    value={newStaff.last_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password*</label>
                  <input
                    type="password"
                    name="password"
                    value={newStaff.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    name="department"
                    value={newStaff.department}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="modal-buttons">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="confirm-btn"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Staff'}
                  </button>
                </div>
              </form>
              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
        )}

        {/* Staff Table */}
        <div className="table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="loading-state">Loading...</td>
                </tr>
              ) : staffMembers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">No staff members to display</td>
                </tr>
              ) : (
                staffMembers.map((staff) => (
                  <tr key={staff.id}>
                    <td>{staff.staff_id}</td>
                    <td>{`${staff.first_name} ${staff.last_name}`}</td>
                    <td>{staff.department || '-'}</td>
                    <td>
                      <button 
                        className="action-btn edit"
                        onClick={() => handleEditClick(staff)}
                      >
                        Edit
                      </button>
                      <button 
                        className="action-btn delete"
                        onClick={() => handleDeleteStaff(staff.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Staff Modal */}
        {showEditModal && editingStaff && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Edit Staff Member</h3>
              <form onSubmit={handleEditStaff}>
                <div className="form-group">
                  <label>Staff ID</label>
                  <input
                    type="text"
                    value={editingStaff.staff_id}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>First Name*</label>
                  <input
                    type="text"
                    value={editingStaff.first_name}
                    onChange={(e) => setEditingStaff(prev => ({
                      ...prev,
                      first_name: e.target.value
                    }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name*</label>
                  <input
                    type="text"
                    value={editingStaff.last_name}
                    onChange={(e) => setEditingStaff(prev => ({
                      ...prev,
                      last_name: e.target.value
                    }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={editingStaff.password}
                    onChange={(e) => setEditingStaff(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                  />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    value={editingStaff.department}
                    onChange={(e) => setEditingStaff(prev => ({
                      ...prev,
                      department: e.target.value
                    }))}
                  />
                </div>
                <div className="modal-buttons">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingStaff(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="confirm-btn"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}