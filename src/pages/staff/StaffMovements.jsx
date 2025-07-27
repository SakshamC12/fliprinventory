import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient.js';

export default function StaffMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movementType, setMovementType] = useState('IN');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchMovements();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, quantity')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchMovements = async () => {
    try {
      // Get staff data from session storage
      const staffData = JSON.parse(sessionStorage.getItem('staffData'));
      if (!staffData) {
        setError('Please log in again');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products(name)
        `)
        .eq('user_email', staffData.staff_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMovements(data || []);
    } catch (error) {
      setError('Failed to load movements');
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMovement = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create movement record
      const { error: movementError } = await supabase
        .from('stock_movements')
        .insert({
          product_id: selectedProduct.id,
          quantity: parseInt(quantity),
          movement_type: movementType,
          user_email: user.email
        });

      if (movementError) throw movementError;

      // Update product quantity
      const newQuantity = movementType === 'IN' 
        ? selectedProduct.quantity + parseInt(quantity)
        : selectedProduct.quantity - parseInt(quantity);

      const { error: productError } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', selectedProduct.id);

      if (productError) throw productError;

      // Refresh data
      fetchMovements();
      fetchProducts();
      setShowMovementModal(false);
      setSelectedProduct(null);
      setQuantity('');
    } catch (error) {
      console.error('Error recording movement:', error);
      setError('Failed to record movement');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="dashboard-section">
      <h2>Stock Movements</h2>
      
      <button 
        className="btn btn-primary"
        onClick={() => setShowMovementModal(true)}
        style={{ marginBottom: '1rem' }}
      >
        Record New Movement
      </button>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement.id}>
                <td>{new Date(movement.created_at).toLocaleDateString()}</td>
                <td>{movement.products?.name}</td>
                <td>{movement.movement_type}</td>
                <td>{movement.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Movement Modal */}
      {showMovementModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Record Stock Movement</h3>
            <div className="form-group">
              <label>Movement Type</label>
              <select 
                className="form-select"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
              >
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
              </select>
            </div>
            <div className="form-group">
              <label>Product</label>
              <select
                className="form-select"
                value={selectedProduct?.id || ''}
                onChange={(e) => setSelectedProduct(products.find(p => p.id === e.target.value))}
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Current: {product.quantity})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="1"
              />
            </div>
            <div className="modal-buttons">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowMovementModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleMovement}
                disabled={!selectedProduct || !quantity}
              >
                Record Movement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}