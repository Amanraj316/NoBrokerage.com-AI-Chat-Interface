// frontend/src/ProjectCard.jsx
import React from 'react';
import './ProjectCard.css'; // We'll create this next

// Helper function to format price
function formatPrice(price) {
  const priceNum = Number(price);
  if (isNaN(priceNum)) return 'Price not available';
  
  if (priceNum >= 10000000) {
    return `${(priceNum / 10000000).toFixed(2)} Cr`;
  }
  if (priceNum >= 100000) {
    return `${(priceNum / 100000).toFixed(2)} L`;
  }
  return priceNum.toLocaleString('en-IN');
}

function ProjectCard({ project }) {
  // Find the first configuration and its first variant to display price info
  const firstConfig = project.configurations?.[0];
  const firstVariant = firstConfig?.variants?.[0];

  return (
    <div className="project-card">
      <h3 className="project-title">{project.projectName}</h3>
      <p className="project-location">{project.address?.fullAddress || 'Location not specified'}</p>
      <div className="project-details">
        <span className="detail-tag">{firstConfig?.type || 'N/A BHK'}</span>
        <span className="detail-tag price">{firstVariant ? formatPrice(firstVariant.price) : 'N/A'}</span>
        <span className="detail-tag">{project.status || 'N/A'}</span>
      </div>
    </div>
  );
}

export default ProjectCard;