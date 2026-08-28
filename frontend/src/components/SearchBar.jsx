import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import './SearchBar.css';

export const SearchBar = ({ initialName = '', initialAddress = '', onSearch, className = '' }) => {
  const [name, setName] = useState(initialName);
  const [address, setAddress] = useState(initialAddress);

  useEffect(() => {
    setName(initialName);
    setAddress(initialAddress);
  }, [initialName, initialAddress]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ name: name.trim(), address: address.trim() });
  };

  const handleClear = () => {
    setName('');
    setAddress('');
    onSearch({ name: '', address: '' });
  };

  return (
    <form className={`search-bar-form ${className}`} onSubmit={handleSubmit}>
      <div className="search-inputs-group">
        <div className="search-input-wrapper">
          <Input
            type="text"
            placeholder="Search store name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="search-input-wrapper">
          <Input
            type="text"
            placeholder="Search address or city..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>
      <div className="search-buttons-group">
        <Button type="submit" variant="primary">
          Search
        </Button>
        {(name || address) && (
          <Button type="button" variant="secondary" onClick={handleClear}>
            Clear
          </Button>
        )}
      </div>
    </form>
  );
};
