import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';

export default function StaffSearch() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(name),
          suppliers(name)
        `)
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      setError('Failed to load products');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      !categoryFilter ||
      product.category_id === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="dashboard-section">
      <h2>Search & Filter Inventory</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name or SKU..."
          className="form-input search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="form-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="product-grid">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`dashboard-card ${product.quantity <= product.threshold ? 'low-stock' : ''}`}
          >
            <h3 className="card-title">{product.name}</h3>
            <p>SKU: {product.sku}</p>
            <p>Category: {product.categories?.name || 'N/A'}</p>
            <p>Supplier: {product.suppliers?.name || 'N/A'}</p>
            <div className={`status-badge ${product.quantity <= product.threshold ? 'status-low' : 'status-normal'}`}>
              Quantity: {product.quantity}
              {product.quantity <= product.threshold && ' ⚠️ Low Stock'}
            </div>
            <p>Unit Price: ${product.unit_price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}