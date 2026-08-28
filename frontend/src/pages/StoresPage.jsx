import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storeService } from '../services/storeService';
import { SearchBar } from '../components/SearchBar';
import { StoreCard } from '../components/StoreCard';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ErrorMessage } from '../components/ErrorMessage';
import { Button } from '../components/Button';
import './StoresPage.css';

export const StoresPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const name = searchParams.get('name') || '';
  const address = searchParams.get('address') || '';
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const order = searchParams.get('order') || 'desc';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await storeService.getStores({
        name,
        address,
        sortBy,
        order,
        page,
        limit: 20,
      });

      if (res.success) {
        setStores(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err.message || 'Unable to load stores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [name, address, sortBy, order, page]);

  const handleSearch = ({ name: newName, address: newAddress }) => {
    const params = new URLSearchParams(searchParams);
    if (newName) params.set('name', newName);
    else params.delete('name');

    if (newAddress) params.set('address', newAddress);
    else params.delete('address');

    params.set('page', '1'); // Reset to page 1 on new search
    setSearchParams(params);
  };

  const handleSortChange = (e) => {
    const [newSortBy, newOrder] = e.target.value.split('-');
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', newSortBy);
    params.set('order', newOrder);
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  return (
    <div className="stores-page">
      <div className="stores-page-header">
        <h1 className="page-title">Stores</h1>
        <p className="page-subtitle">
          Find a store, see what customers think, and share your experience.
        </p>
      </div>

      <SearchBar initialName={name} initialAddress={address} onSearch={handleSearch} />

      <div className="stores-toolbar">
        <div className="toolbar-info text-meta">
          {!loading && stores.length > 0 && (
            <span>Showing {stores.length} of {pagination.total} stores</span>
          )}
        </div>

        <div className="sort-control-group">
          <label htmlFor="sort-select" className="sort-label text-meta">Sort by:</label>
          <select
            id="sort-select"
            className="sort-select"
            value={`${sortBy}-${order}`}
            onChange={handleSortChange}
          >
            <option value="created_at-desc">Newest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="averageRating-desc">Highest Rated</option>
            <option value="averageRating-asc">Lowest Rated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Searching stores..." />
      ) : error ? (
        <div>
          <ErrorMessage message={error} />
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button variant="secondary" onClick={fetchStores}>Try again</Button>
          </div>
        </div>
      ) : stores.length === 0 ? (
        <EmptyState
          title={name || address ? 'No stores found' : 'No stores available'}
          description={name || address ? 'Try searching with a different store name or address.' : 'No registered stores exist in the system yet.'}
        />
      ) : (
        <>
          <div className="stores-list">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};
