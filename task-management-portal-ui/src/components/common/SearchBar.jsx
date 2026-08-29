import React from 'react';
import PropTypes from 'prop-types';
import Input from '../ui/Input';

const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="search-bar w-full max-w-md">
      <Input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        icon={
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        }
      />
    </div>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

SearchBar.defaultProps = {
  placeholder: 'Search...',
};

export default SearchBar;