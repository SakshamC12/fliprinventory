import React from 'react';

export default function ReportsAnalytics() {
  return (
    <div className="dashboard-section">
      <h2>Reports & Analytics</h2>
      <div className="content-card">
        <h3>Reports</h3>
        <div className="reports-grid">
          <div className="report-card">
            <h4>Inventory Summary</h4>
            <button className="secondary-btn">Generate Report</button>
          </div>
          <div className="report-card">
            <h4>Movement Analysis</h4>
            <button className="secondary-btn">Generate Report</button>
          </div>
          <div className="report-card">
            <h4>Staff Activity</h4>
            <button className="secondary-btn">Generate Report</button>
          </div>
        </div>
      </div>
    </div>
  );
}