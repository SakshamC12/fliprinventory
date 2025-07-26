import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './Dashboard.css';

export default function InventoryOverview() {
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    highDemandItems: 0,
  });

  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.from('inventory').select('*');
      if (error) return console.error('Failed to fetch inventory stats:', error);

      const totalItems = data.length;
      const lowStockItems = data.filter(item => item.quantity <= item.low_threshold).length;
      const outOfStockItems = data.filter(item => item.quantity === 0).length;
      const highDemandItems = data.filter(item => item.demand_level === 'high').length;

      setStats({ totalItems, lowStockItems, outOfStockItems, highDemandItems });

      // Category-wise breakdown
      const categoryMap = {};
      data.forEach(item => {
        const category = item.category || 'Uncategorized';
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      });

      setCategoryData({
        labels: Object.keys(categoryMap),
        datasets: [
          {
            label: 'Items per Category',
            data: Object.values(categoryMap),
            backgroundColor: [
              '#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#e74c3c',
            ],
          }
        ]
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="inventory-overview">
      <h2>Inventory Overview</h2>

      <div className="stats-grid">
        <div className="dashboard-card">
          <h3>Total Items</h3>
          <p>{stats.totalItems}</p>
        </div>
        <div className="dashboard-card">
          <h3>Low Stock</h3>
          <p>{stats.lowStockItems}</p>
        </div>
        <div className="dashboard-card">
          <h3>Out of Stock</h3>
          <p>{stats.outOfStockItems}</p>
        </div>
        <div className="dashboard-card">
          <h3>High Demand</h3>
          <p>{stats.highDemandItems}</p>
        </div>
      </div>

      <div className="charts-container">
        {categoryData && (
          <>
            <div>
              <h4>Category Distribution</h4>
              <Pie data={categoryData} />
            </div>
            <div>
              <h4>Stock Levels</h4>
              <Bar
                data={{
                  labels: ['Low Stock', 'Out of Stock', 'High Demand'],
                  datasets: [
                    {
                      label: 'Count',
                      data: [
                        stats.lowStockItems,
                        stats.outOfStockItems,
                        stats.highDemandItems,
                      ],
                      backgroundColor: ['#f39c12', '#e74c3c', '#3498db'],
                    },
                  ],
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}