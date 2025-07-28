import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Add state for modal and form
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [addProductLoading, setAddProductLoading] = useState(false);
  const [addProductError, setAddProductError] = useState('');
  const [addProductSuccess, setAddProductSuccess] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category_id: '',
    supplier_id: '',
    quantity: '',
    threshold: '',
    unit_price: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
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

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch suppliers for dropdown
  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .order('name');
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const getStatus = (quantity, min_stock_level) => {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity <= min_stock_level) return 'Low Stock';
    return 'In Stock';
  };

  // Handle input change for add product form
  const handleAddProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handle add product form submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAddProductError('');
    setAddProductSuccess('');
    setAddProductLoading(true);
    // Validate required fields
    if (!newProduct.name || !newProduct.sku || !newProduct.category_id || !newProduct.supplier_id || !newProduct.quantity || !newProduct.threshold || !newProduct.unit_price) {
      setAddProductError('Please fill in all required fields.');
      setAddProductLoading(false);
      return;
    }
    try {
      const { error } = await supabase.from('products').insert([
        {
          name: newProduct.name,
          sku: newProduct.sku,
          category_id: newProduct.category_id,
          supplier_id: newProduct.supplier_id,
          quantity: parseInt(newProduct.quantity, 10),
          threshold: parseInt(newProduct.threshold, 10),
          unit_price: parseFloat(newProduct.unit_price),
          description: newProduct.description,
          image_url: newProduct.image_url,
        },
      ]);
      if (error) throw error;
      setAddProductSuccess('Product added successfully!');
      setShowAddModal(false);
      setNewProduct({
        name: '',
        sku: '',
        category_id: '',
        supplier_id: '',
        quantity: '',
        threshold: '',
        unit_price: '',
        description: '',
        image_url: '',
      });
      fetchProducts();
    } catch (error) {
      setAddProductError('Failed to add product.');
      console.error('Add product error:', error);
    } finally {
      setAddProductLoading(false);
    }
  };

  return (
    <div className="dashboard-section">
      <h2>Inventory Management</h2>
      <div className="content-card">
        <h3>Product Inventory</h3>
        <div className="action-buttons">
          <button className="primary-btn" onClick={() => setShowAddModal(true)}>Add Product</button>
          <button className="secondary-btn">Export List</button>
        </div>
        {/* Add Product Modal */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Add New Product</h3>
              <form onSubmit={handleAddProduct}>
                <div className="form-group">
                  <label>Product Name*</label>
                  <input type="text" name="name" value={newProduct.name} onChange={handleAddProductChange} required />
                </div>
                <div className="form-group">
                  <label>SKU*</label>
                  <input type="text" name="sku" value={newProduct.sku} onChange={handleAddProductChange} required />
                </div>
                <div className="form-group">
                  <label>Category*</label>
                  <select name="category_id" value={newProduct.category_id} onChange={handleAddProductChange} required>
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Supplier*</label>
                  <select name="supplier_id" value={newProduct.supplier_id} onChange={handleAddProductChange} required>
                    <option value="">Select supplier</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity*</label>
                  <input type="number" name="quantity" value={newProduct.quantity} onChange={handleAddProductChange} min="0" required />
                </div>
                <div className="form-group">
                  <label>Low Stock Threshold*</label>
                  <input type="number" name="threshold" value={newProduct.threshold} onChange={handleAddProductChange} min="0" required />
                </div>
                <div className="form-group">
                  <label>Unit Price*</label>
                  <input type="number" name="unit_price" value={newProduct.unit_price} onChange={handleAddProductChange} min="0" step="0.01" required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={newProduct.description} onChange={handleAddProductChange} />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input type="text" name="image_url" value={newProduct.image_url} onChange={handleAddProductChange} />
                </div>
                <div className="modal-buttons">
                  <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)} disabled={addProductLoading}>Cancel</button>
                  <button type="submit" className="confirm-btn" disabled={addProductLoading}>{addProductLoading ? 'Adding...' : 'Add Product'}</button>
                </div>
                {addProductError && <div className="error-message">{addProductError}</div>}
                {addProductSuccess && <div className="alert alert-success">{addProductSuccess}</div>}
              </form>
            </div>
          </div>
        )}
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