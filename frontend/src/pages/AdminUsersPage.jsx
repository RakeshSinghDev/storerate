import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { Table } from '../components/Table';
import { Pagination } from '../components/Pagination';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { CreateUserModal } from '../components/CreateUserModal';
import './AdminUsersPage.css';

export const AdminUsersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const nameParam = searchParams.get('name') || '';
  const emailParam = searchParams.get('email') || '';
  const addressParam = searchParams.get('address') || '';
  const roleParam = searchParams.get('role') || '';
  const sortByParam = searchParams.get('sortBy') || 'created_at';
  const orderParam = searchParams.get('order') || 'desc';
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;

  const [name, setName] = useState(nameParam);
  const [email, setEmail] = useState(emailParam);
  const [address, setAddress] = useState(addressParam);
  const [role, setRole] = useState(roleParam);

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setName(nameParam);
    setEmail(emailParam);
    setAddress(addressParam);
    setRole(roleParam);
  }, [nameParam, emailParam, addressParam, roleParam]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getUsers({
        name: nameParam,
        email: emailParam,
        address: addressParam,
        role: roleParam,
        sortBy: sortByParam,
        order: orderParam,
        page: pageParam,
        limit: 20,
      });

      if (res.success) {
        setUsers(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch (err) {
      setError(err.message || 'Unable to load user list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [nameParam, emailParam, addressParam, roleParam, sortByParam, orderParam, pageParam]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (name) params.set('name', name); else params.delete('name');
    if (email) params.set('email', email); else params.delete('email');
    if (address) params.set('address', address); else params.delete('address');
    if (role) params.set('role', role); else params.delete('role');
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setName('');
    setEmail('');
    setAddress('');
    setRole('');
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
          Name{renderSortIndicator('name')}
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
        <span className="sortable-header" onClick={() => handleSortChange('role')}>
          Role{renderSortIndicator('role')}
        </span>
      ),
      key: 'role',
      render: (row) => <span className={`user-role-badge role-${row.role}`}>{row.role}</span>,
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => (
        <Link to={`/admin/users/${row.id}`}>
          <Button variant="secondary" size="sm">View Details</Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="admin-users-page">
      <div className="admin-page-header flex-between">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">View and manage user accounts across the platform.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          Create User
        </Button>
      </div>

      <form className="admin-filter-bar" onSubmit={handleFilterSubmit}>
        <div className="filter-inputs-grid">
          <Input placeholder="Filter by name..." value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Filter by email..." value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Filter by address..." value={address} onChange={(e) => setAddress(e.target.value)} />
          <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All Roles (Default)</option>
            <option value="NORMAL_USER">NORMAL_USER</option>
            <option value="STORE_OWNER">STORE_OWNER</option>
            <option value="SYSTEM_ADMINISTRATOR">SYSTEM_ADMINISTRATOR</option>
          </select>
        </div>
        <div className="filter-buttons">
          <Button type="submit" variant="primary" size="sm">Apply Filters</Button>
          {(name || email || address || role) && (
            <Button type="button" variant="secondary" size="sm" onClick={handleClearFilters}>Clear</Button>
          )}
        </div>
      </form>

      <div className="admin-table-summary text-meta">
        {!loading && users.length > 0 && (
          <span>Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users</span>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading users..." />
      ) : error ? (
        <div>
          <ErrorMessage message={error} />
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button variant="secondary" onClick={fetchUsers}>Try again</Button>
          </div>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state-container">
          <p style={{ color: 'var(--color-text-secondary)' }}>No matching users found. Try changing your filters.</p>
        </div>
      ) : (
        <>
          <Table columns={columns} data={users} keyField="id" />
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};
