import React from 'react';

export default function InventoryManagement() {
  return (
    <div className="dashboard-section">
      <h2>Inventory Management</h2>
      <div className="content-card">
        <h3>Product Inventory</h3>
        <div className="action-buttons">
          <button className="primary-btn">Add Product</button>
          <button className="secondary-btn">Export List</button>
        </div>
        <div className="table-container">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="4" className="empty-state">No products to display</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}