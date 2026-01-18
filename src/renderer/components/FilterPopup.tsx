import React from 'react';

interface FilterPopupProps {
  show: boolean;
  onClose: () => void;
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder: string;
  children?: React.ReactNode;
}

const FilterPopup: React.FC<FilterPopupProps> = ({
  show,
  onClose,
  title,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  children
}) => {
  if (!show) return null;

  return (
    <div className="filter-popup-overlay" onClick={onClose}>
      <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
        <div className="filter-popup-content">
          <h3>{title}</h3>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
            autoFocus
          />
          {children}
        </div>
        <div className="filter-popup-actions">
          <button
            onClick={onClose}
            className="btn btn-secondary btn-small"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;
