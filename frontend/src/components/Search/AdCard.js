import React from 'react';
import './AdCard.css';
import { FaCalendarAlt, FaUsers, FaMapMarkerAlt } from 'react-icons/fa';

const AdCard = ({ ad }) => {
  const getPlatformBadgeClass = (platform) => {
    return `platform-badge ${platform.toLowerCase()}`;
  };

  const formatDateRange = (startDate, endDate) => {
    return `${startDate} - ${endDate}`;
  };

  const formatReach = (reach) => {
    if (typeof reach === 'string' && reach.includes('-')) {
      return reach; // Return as is if it's already in range format
    }
    return reach.toLocaleString();
  };

  return (
    <div className="ad-card">
      <div className="ad-image">
        {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} />}
      </div>
      <div className="ad-content">
        <div className="ad-header">
          <div className="ad-title-section">
            <h2 className="ad-title">{ad.title}</h2>
            <div className="ad-badges">
              <span className={getPlatformBadgeClass(ad.platform)}>
                {ad.platform}
              </span>
              {ad.status && <span className="status-badge">{ad.status}</span>}
            </div>
          </div>
        </div>
        <p className="ad-description">{ad.description}</p>
        <span className="ad-advertiser">{ad.advertiser}</span>
        <div className="ad-metadata">
          <div className="metadata-item">
            <FaCalendarAlt className="metadata-icon" />
            {formatDateRange(ad.startDate, ad.endDate)}
          </div>
          <div className="metadata-item">
            <FaUsers className="metadata-icon" />
            Potential Reach: {formatReach(ad.reach)}
          </div>
          <div className="metadata-item">
            <FaMapMarkerAlt className="metadata-icon" />
            {ad.demographics}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdCard; 