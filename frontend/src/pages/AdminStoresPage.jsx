import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { Table } from '../components/Table';
import { Pagination } from '../components/Pagination';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { RatingStars } from '../components/RatingStars';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { CreateStoreModal } from '../components/CreateStoreModal';
import './AdminUsersPage.css'; // Reuses filter/table/header container CSS

export const AdminStoresPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const nameParam = searchParams.get('name') || '';
  const emailParam = searchParams.get('email') || '';
  const addressParam = searchParams.get('address') || '';
  const sortByParam = searchParams.get('sortBy') || 'created_at';
  const orderParam = searchParams.get('order') || 'desc';
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;

  const [name, setName] = useState(nameParam);
  const [email, setEmail] = useState(emailParam);
  const [address, setAddress] = useState(addressParam);

  const [stores, setStores] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setName(nameParam);
    setEmail(emailParam);
    setAddress(addressParam);
  }, [nameParam, emailParam, addressParam]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getStores({
        name: nameParam,
        email: emailParam,
        address: addressParam,
        sortBy: sortByParam,
        order: orderParam,
        page: pageParam,
        limit: 20,
      });

      if (res.success) {
        setStores(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err.message || 'Unable to load store list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [nameParam, emailParam, addressParam, sortByParam, orderParam, pageParam]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (name) params.set('name', name); else params.delete('name');
    if (email) params.set('email', email); else params.delete('email');
    if (address) params.set('address', address); else params.delete('address');
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setName('');
    setEmail('');
    setAddress('');
    setSearchParams(new URLSearchParams());
  };

  const handleSortChange = (columnKey) => {
    const params = new URLSearchParams(searchParams);
    if (sortByParam === columnKey) {
      params.set('order', orderParam === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sortBy', columnKey);
      params.set('order', 'asc');
    }
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  const renderSortIndicator = (columnKey) => {
    if (sortByParam !== columnKey) return null;
    return orderParam === 'asc' ? ' ↑' : ' ↓';
  };

  const columns = [
    {
      header: (
        <span className="sortable-header" onClick={() => handleSortChange('name')}>
          Store Name{renderSortIndicator('name')}
        </span>
      ),
      key: 'name',
    },
    {
      header: (
        <span className="sortable-header" onClick={() => handleSortChange('email')}>
          Email{renderSortIndicator('email')}
        </span>
      ),
      key: 'email',
    },
    {
      header: (
        <span className="sortable-header" onClick={() => handleSortChange('address')}>
          Address{renderSortIndicator('address')}
        </span>
      ),
      key: 'address',
    },
    {
      header: (
        <span className="sortable-header" onClick={() => handleSortChange('averageRating')}>
          Overall Rating{renderSortIndicator('averageRating')}
        </span>
      ),
      key: 'averageRating',
      render: (row) =>
        row.averageRating !== null && row.averageRating !== undefined ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RatingStars rating={row.averageRating} size="sm" showNumber />
            <span className="text-meta">({row.ratingCount})</span>
          </div>
        ) : (
          <span className="text-meta">No ratings</span>
        ),
    },
    {
      header: 'Store Owner',
      key: 'owner',
      render: (row) =>
        row.owner ? (
          <div>
            <div style={{ fontWeight: '500' }}>{row.owner.name}</div>
            <div className="text-meta">{row.owner.email}</div>
          </div>
        ) : (
          <span className="text-meta">Unassigned</span>
        ),
    },
  ];

  return (
    <div className="admin-users-page">
      <div className="admin-page-header flex-between">
        <div>
          <h1 className="page-title">Store Management</h1>
          <p className="page-subtitle">View and manage registered stores across the platform.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Create Store
        </Button>
      </div>

      <form className="admin-filter-bar" onSubmit={handleFilterSubmit}>
        <div className="filter-inputs-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <Input placeholder="Filter by store name..." value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Filter by store email..." value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Filter by store address..." value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="filter-buttons">
          <Button type="submit" variant="primary" size="sm">Apply Filters</Button>
          {(name || email || address) && (
            <Button type="button" variant="secondary" size="sm" onClick={handleClearFilters}>Clear</Button>
          )}
        </div>
      </form>

      <div className="admin-table-summary text-meta">
        {!loading && stores.length > 0 && (
          <span>Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} stores</span>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading stores..." />
      ) : error ? (
        <div>
          <ErrorMessage message={error} />
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button variant="secondary" onClick={fetchStores}>Try again</Button>
          </div>
        </div>
      ) : stores.length === 0 ? (
        <div className="empty-state-container">
          <p style={{ color: 'var(--color-text-secondary)' }}>No matching stores found. Try changing your filters.</p>
        </div>
      ) : (
        <>
          <Table columns={columns} data={stores} keyField="id" />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <CreateStoreModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStores}
      />
    </div>
  );
};
