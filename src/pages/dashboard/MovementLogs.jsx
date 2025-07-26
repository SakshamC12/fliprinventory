import React from 'react';

export default function MovementLogs() {
  return (
    <div className="dashboard-section">
      <h2>Movement Logs</h2>
      <div className="content-card">
        <h3>Inventory Movements</h3>
        <div className="filters">
          <input type="date" className="date-filter" />
          <select className="movement-type-filter">
            <option value="">All Types</option>
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
          </select>
        </div>
        <div className="table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Staff</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="empty-state">No movement logs to display</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}