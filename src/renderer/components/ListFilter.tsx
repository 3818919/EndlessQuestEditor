import React from 'react';
import SearchIcon from '@mui/icons-material/Search';

interface ListFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder: string;
  minimized: boolean;
  onToggleSearch?: () => void;
  children?: React.ReactNode;
}

const ListFilter: React.FC<ListFilterProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  minimized,
  onToggleSearch,
  children
}) => {
  return (
    <div className="item-list-filters">
      {minimized ? (
        <button
          className="search-filter-button"
          onClick={onToggleSearch}
          title="Search & Filter"
        >
          <SearchIcon />
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {children}
        </>
      )}
    </div>
  );
};

export default ListFilter;
