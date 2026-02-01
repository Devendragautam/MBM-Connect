import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { marketAPI } from './market.api';
import { Loader, ErrorBox, Button, Input } from '../../shared/ui';
import { useDarkMode } from '../../shared/DarkModeContext';
import { useAuth } from '../auth/AuthContext';

const MarketPage = () => {
  const { user, logout } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    image: null,
  });
  const fileInputRef = useRef(null);

  // Memoize fetchListings
  const fetchListings = useCallback(async (filterParams) => {
    try {
      setLoading(true);
      setError('');
      // Filter out empty values to prevent backend errors
      const activeFilters = Object.fromEntries(
        Object.entries(filterParams)
          .filter(([_, value]) => value !== '')
          .map(([key, value]) => ['minPrice', 'maxPrice'].includes(key) ? [key, Number(value)] : [key, value])
      );
      const response = await marketAPI.getListings(activeFilters);
      if (response.data.success) {
        const marketData = response.data.data;
        setListings(Array.isArray(marketData) ? marketData : (marketData?.listings || []));
      } else {
        setError(response.data.message || 'Failed to load listings');
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.data?.message === 'jwt expired') {
        logout();
        return;
      }
      setError(err.response?.data?.message || 'Failed to load listings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchListings(filters);
  }, [filters, fetchListings]);

  // Memoize filter change handler
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Memoize form change handler
  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Memoize file change handler
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  }, []);

  // Memoize create listing handler
  const handleCreateListing = useCallback(async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      if (formData.image) data.append('image', formData.image);

      const response = await marketAPI.createListing(data);
      if (response.data.success) {
        setFormData({ title: '', description: '', price: '', category: '', image: null });
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowCreateForm(false);
        fetchListings(filters);
      } else {
        setError(response.data.message || 'Failed to create listing');
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.data?.message === 'jwt expired') {
        logout();
        return;
      }
      setError(err.response?.data?.message || 'Failed to create listing');
      console.error(err);
    }
  }, [formData, filters, fetchListings, logout]);

  // Memoize delete listing handler
  const handleDeleteListing = useCallback(async (listingId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const response = await marketAPI.deleteListing(listingId);
      if (response.data.success) {
        setListings((prev) => prev.filter((l) => l._id !== listingId));
      } else {
        setError(response.data.message || 'Failed to delete listing');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete listing');
    }
  }, []);

  // Memoize toggle form handler
  const handleToggleForm = useCallback(() => {
    setShowCreateForm((prev) => !prev);
  }, []);

  // Memoize dismiss error handler
  const handleDismissError = useCallback(() => {
    setError('');
  }, []);

  // Memoize filtered listings rendering
  const listingsGrid = useMemo(() => {
    if (loading) {
      return <Loader text="Loading listings..." />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.length > 0 ? (
          listings.map((listing) => (
            <div
              key={listing._id}
              className={`rounded-lg shadow hover:shadow-lg transition cursor-pointer ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}
            >
              {listing.image && (
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {listing.title}
                  </h3>
                  {listing.author?._id === user?._id && (
                    <button
                      onClick={(e) => handleDeleteListing(listing._id, e)}
                      className="text-red-500 hover:text-red-600 text-sm font-semibold ml-2"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {listing.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className={`font-bold text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    ${listing.price}
                  </span>
                  <span className={`px-3 py-1 rounded text-sm ${isDarkMode ? 'bg-secondary-700 text-gray-300' : 'bg-gray-200 text-gray-800'}`}>
                    {listing.category}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className={`col-span-3 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No listings found
          </p>
        )}
      </div>
    );
  }, [listings, loading, isDarkMode, user, handleDeleteListing]);

  return (
    <div className={`min-h-screen py-8 ${isDarkMode ? 'bg-secondary-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Market</h1>
          <Button
            onClick={handleToggleForm}
            variant="primary"
          >
            {showCreateForm ? 'Cancel' : 'Create Listing'}
          </Button>
        </div>

        {error && (
          <div className="mb-6">
            <ErrorBox 
              message="Market Error"
              errors={[error]}
              onDismiss={handleDismissError}
            />
          </div>
        )}

        {showCreateForm && (
          <div className={`p-6 rounded-lg shadow mb-8 ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Create New Listing</h2>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className={isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white' : ''}
                  required
                />
                <Input
                  label="Category"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className={isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white' : ''}
                  required
                />
                <Input
                  label="Price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  className={isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white' : ''}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  rows="4"
                  required
                />
              </div>
              <Button type="submit" variant="primary" className="w-full">
                Create Listing
              </Button>
            </form>
          </div>
        )}

        <div className={`p-6 rounded-lg shadow mb-8 ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              type="text"
              name="search"
              placeholder="Search..."
              value={filters.search}
              onChange={handleFilterChange}
              className={isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white' : ''}
            />
            <Input
              type="text"
              name="category"
              placeholder="Category"
              value={filters.category}
              onChange={handleFilterChange}
              className={isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white' : ''}
            />
            <Input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className={isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white' : ''}
            />
            <Input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className={isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white' : ''}
            />
          </div>
        </div>

        {listingsGrid}
      </div>
    </div>
  );
};

export default MarketPage;
