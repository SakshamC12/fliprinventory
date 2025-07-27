import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './Dashboard.css';

export default function InventoryOverview() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalMovements: 0,
  });

  const [categoryData, setCategoryData] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products with their current quantities
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            categories(name)
          `);

        if (productsError) throw productsError;

        // Fetch total movements count
        const { count: movementsCount, error: movementsError } = await supabase
          .from('stock_movements')
          .select('*', { count: 'exact' });

        if (movementsError) throw movementsError;

        const totalProducts = products.length;
        const lowStockProducts = products.filter(item => item.quantity <= item.threshold).length;
        const outOfStockProducts = products.filter(item => item.quantity === 0).length;

        setStats({
          totalProducts,
          lowStockProducts,
          outOfStockProducts,
          totalMovements: movementsCount,
        });

        // Category-wise breakdown
        const categoryMap = {};
        products.forEach(product => {
          const category = product.categories?.name || 'Uncategorized';
          categoryMap[category] = (categoryMap[category] || 0) + 1;
        });

        setCategoryData({
          labels: Object.keys(categoryMap),
          datasets: [
            {
              label: 'Products per Category',
              data: Object.values(categoryMap),
              backgroundColor: [
                '#3498db', '#e67e22', '#2ecc71', '#9b59b6', '#e74c3c',
              ],
            }
          ]
        });
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="inventory-overview">
      <h2>Inventory Overview</h2>

      <div className="stats-grid">
        <div className="dashboard-card">
          <h3>Total Products</h3>
          <p>{stats.totalProducts}</p>
        </div>
        <div className="dashboard-card">
          <h3>Low Stock</h3>
          <p>{stats.lowStockProducts}</p>
        </div>
        <div className="dashboard-card">
          <h3>Out of Stock</h3>
          <p>{stats.outOfStockProducts}</p>
        </div>
        <div className="dashboard-card">
          <h3>Total Movements</h3>
          <p>{stats.totalMovements}</p>
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
              <h4>Stock Status</h4>
              <Bar
                data={{
                  labels: ['Low Stock', 'Out of Stock', 'Total Products'],
                  datasets: [
                    {
                      label: 'Count',
                      data: [
                        stats.lowStockProducts,
                        stats.outOfStockProducts,
                        stats.totalProducts,
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