import React, { useState } from 'react';
import './Search.css';
import AdCard from './AdCard';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dummy data for ads
  const dummyAds = [
    {
      id: 1,
      title: "Natural Hair Care",
      description: "Discover our revolutionary hair fall treatment with natural ingredients.",
      advertiser: "HealthyHair Solutions",
      imageUrl: "https://picsum.photos/seed/1/800/600",
      platform: "Facebook",
      status: "Inactive",
      startDate: "1/1/2024",
      endDate: "12/31/2024",
      reach: "37K - 56K",
      demographics: "Ages 25-54 • 60% Female • United States"
    },
    {
      id: 2,
      title: "Advanced Hair Treatment",
      description: "Clinical proven formula to reduce hair fall in 4 weeks.",
      advertiser: "MedicalHairCare",
      imageUrl: "https://picsum.photos/seed/3/800/600",
      platform: "YouTube",
      status: "Inactive",
      startDate: "1/1/2024",
      endDate: "12/31/2024",
      reach: "26K - 80K",
      demographics: "Ages 25-54 • 60% Female • United States"
    },
    {
      id: 3,
      title: "Hair Growth Formula",
      description: "Revolutionary hair growth formula with proven results.",
      advertiser: "HairGrowthExperts",
      imageUrl: "https://picsum.photos/seed/3/800/600",
      platform: "Instagram",
      status: "Inactive",
      startDate: "1/1/2024",
      endDate: "12/31/2024",
      reach: "33K - 147K",
      demographics: "Ages 25-54 • 60% Female • United States"
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="search-container">
      <div className="search-header">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for ads..."
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
        </form>
      </div>
      
      <div className="search-results">
        {dummyAds.map(ad => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
    </div>
  );
};

export default Search; 