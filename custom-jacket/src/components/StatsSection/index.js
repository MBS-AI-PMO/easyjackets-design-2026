import React from 'react';
import '../../css/site.css';
import './styles.css';

// figure, gold suffix (as the storefront's stats: frontend/src/pages/Home.jsx), label, subtitle
const STATS = [
  ['15', 'K', 'Satisfied Customers', 'Around the globe'],
  ['50', '%', 'Discount', 'Price you always wanted'],
  ['1000', '+', 'Reviews', "Read what they're saying"],
];

const StatsSection = () => {
  return (
    <div className="ez-site cjd-stats-section">
      <div className="cjd-stats-container">
        {STATS.map(([figure, suffix, label, subtitle]) => (
          <div className="cjd-stat-item" key={label}>
            <div className="cjd-stat-number">
              {figure}<span className="cjd-stat-accent">{suffix}</span>
            </div>
            <div className="cjd-stat-text">
              <div className="cjd-stat-label">{label}</div>
              <div className="cjd-stat-subtitle">{subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsSection;
