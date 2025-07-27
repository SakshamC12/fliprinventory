import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';

export default function StaffInventoryView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
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

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="dashboard-section">
      <h2>Inventory Items</h2>
      <div className="product-grid">
        {products.map((product) => (
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