import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      setError('Error fetching products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (quantity, min_stock_level) => {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity <= min_stock_level) return 'Low Stock';
    return 'In Stock';
  };

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
              {loading ? (
                <tr>
                  <td colSpan="4" className="loading-state">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="4" className="error-state">{error}</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">No products to display</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.categories?.name || '-'}</td>
                    <td>{product.quantity}</td>
                    <td>{getStatus(product.quantity, product.min_stock_level)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}