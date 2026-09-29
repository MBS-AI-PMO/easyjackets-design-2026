import React from 'react';
import './styles.scss';

const StatsSection = () => {
  return (
    <div className="cjd-stats-section">
      <div className="cjd-stats-container">
        <div className="cjd-stat-item">
          <div className="cjd-stat-number">15K</div>
          <div className="cjd-stat-label">Satisfied Customers</div>
          <div className="cjd-stat-subtitle">Around the globe</div>
        </div>
        <div className="cjd-stat-item">
          <div className="cjd-stat-number">50%</div>
          <div className="cjd-stat-label">Discount</div>
          <div className="cjd-stat-subtitle">Price you always wanted</div>
        </div>
        <div className="cjd-stat-item">
          <div className="cjd-stat-number">1000+</div>
          <div className="cjd-stat-label">Reviews</div>
          <div className="cjd-stat-subtitle">Read what they're saying</div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;

