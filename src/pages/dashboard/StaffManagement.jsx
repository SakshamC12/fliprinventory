import React from 'react';

export default function StaffManagement() {
  return (
    <div className="dashboard-section">
      <h2>Staff Management</h2>
      <div className="content-card">
        <h3>Staff Directory</h3>
        <div className="action-buttons">
          <button className="primary-btn">Add Staff</button>
          <button className="secondary-btn">Manage Roles</button>
        </div>
        <div className="table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="empty-state">No staff members to display</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}