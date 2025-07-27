import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function MovementLogs() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateFilter, setDateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchMovements();
  }, [dateFilter, typeFilter]);

  const fetchMovements = async () => {
    try {
      let query = supabase
        .from('stock_movements')
        .select(`
          id,
          product_id,
          user_email,
          movement_type,
          quantity,
          previous_quantity,
          new_quantity,
          notes,
          created_at,
          products(name)
        `)
        .order('created_at', { ascending: false });

      if (dateFilter) {
        const filterDate = new Date(dateFilter);
        const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999)).toISOString();
        query = query.gte('created_at', startOfDay).lte('created_at', endOfDay);
      }
      if (typeFilter) {
        query = query.eq('movement_type', typeFilter);
      }

      const { data: movementsData, error: movementsError } = await query;

      if (movementsError) throw movementsError;
      setMovements(movementsData || []);
    } catch (error) {
      setError('Error fetching movement logs');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-section">
      <h2>Movement Logs</h2>
      <div className="content-card">
        <h3>Inventory Movements</h3>
        <div className="filters">
          <input 
            type="date" 
            className="date-filter"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <select 
            className="movement-type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
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
              {loading ? (
                <tr>
                  <td colSpan="5" className="loading-state">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="error-state">{error}</td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">No movement logs to display</td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{new Date(movement.created_at).toLocaleDateString()}</td>
                    <td>{movement.products?.name || '-'}</td>
                    <td>{movement.movement_type}</td>
                    <td>{movement.quantity}</td>
                    <td>{movement.user_email || '-'}</td>
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