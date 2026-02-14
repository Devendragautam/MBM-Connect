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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    image: null,
    imagePreview: null,
    existingImage: null,
  });
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  // Memoize fetchListings
  const fetchListings = useCallback(async (filterParams, pageNum = 1) => {
    try {
      setLoading(true);
      setError('');
      // Filter out empty values to prevent backend errors
      const activeFilters = Object.fromEntries(
        Object.entries(filterParams)
          .filter(([_, value]) => value !== '')
          .map(([key, value]) => ['minPrice', 'maxPrice'].includes(key) ? [key, Number(value)] : [key, value])
      );

      const params = { ...activeFilters, page: pageNum, limit: 9 };
      const response = await marketAPI.getListings(params);

      if (response.data.success) {
        const marketData = response.data.data;
        if (Array.isArray(marketData)) {
          setListings(marketData);
        } else {
          setListings(marketData.listings || []);
          setTotalPages(marketData.totalPages || 1);
        }
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
    fetchListings(filters, page);
  }, [filters, page, fetchListings]);

  // Memoize filter change handler
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
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
        imagePreview: URL.createObjectURL(file),
      }));
    }
  }, []);

  // Memoize create listing handler
  const handleSaveListing = useCallback(async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      if (formData.image) data.append('image', formData.image);

      let response;
      if (editingId) {
        response = await marketAPI.updateListing(editingId, data);
      } else {
        response = await marketAPI.createListing(data);
      }

      if (response.data.success) {
        setFormData({ title: '', description: '', price: '', category: '', image: null, imagePreview: null, existingImage: null });
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowCreateForm(false);
        setEditingId(null);
        setPage(1);
        fetchListings(filters, 1);
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
  }, [formData, filters, fetchListings, logout, editingId]);

  // Memoize edit listing handler
  const handleEditListing = useCallback((listing, e) => {
    e.stopPropagation();
    setFormData({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      category: listing.category,
      image: null,
      imagePreview: null,
      existingImage: listing.image,
    });
    setEditingId(listing._id);
    setShowCreateForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Memoize delete listing handler
  const handleDeleteListing = useCallback(async (listingId, e) => {
    e.stopPropagation();
    
    if (confirmId !== listingId) {
      setConfirmId(listingId);
      setTimeout(() => setConfirmId((prev) => (prev === listingId ? null : prev)), 3000);
      return;
    }

    try {
      setDeletingId(listingId);
      const response = await marketAPI.deleteListing(listingId);
      if (response.data.success) {
        setListings((prev) => prev.filter((l) => l._id !== listingId));
      } else {
        setError(response.data.message || 'Failed to delete listing');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete listing');
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }, [confirmId]);

  // Memoize toggle form handler
  const handleToggleForm = useCallback(() => {
    setShowCreateForm((prev) => !prev);
    setEditingId(null);
    setFormData({ title: '', description: '', price: '', category: '', image: null, imagePreview: null, existingImage: null });
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
              className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}
            >
              <div className="relative h-56 overflow-hidden">
                {listing.image ? (
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-secondary-700' : 'bg-gray-200'}`}>
                    <span className="text-4xl">🛍️</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/50 text-white backdrop-blur-md border border-white/20">
                    {listing.category}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 mr-2">
                    <h3 className={`text-xl font-bold mb-1 line-clamp-1 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {listing.title}
                    </h3>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      ${listing.price}
                    </p>
                  </div>
                </div>
                <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {listing.description}
                </p>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    {listing.owner?.avatar ? (
                      <img src={listing.owner.avatar} alt="Owner" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">
                        {listing.owner?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {listing.owner?.username || 'Unknown'}
                    </span>
                  </div>

                  {(listing.owner?._id === user?._id || listing.owner === user?._id) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleEditListing(listing, e)}
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-secondary-700 text-blue-400' : 'hover:bg-blue-50 text-blue-600'}`}
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteListing(listing._id, e)}
                        disabled={deletingId === listing._id}
                        className={`p-2 rounded-full transition-colors ${
                          confirmId === listing._id 
                            ? 'bg-red-500 text-white animate-pulse' 
                            : isDarkMode ? 'hover:bg-secondary-700 text-red-400' : 'hover:bg-red-50 text-red-600'
                        }`}
                        title="Delete"
                      >
                        {confirmId === listing._id ? (
                          <span className="text-xs font-bold">?</span>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        )}
                      </button>
                    </div>
                  )}
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
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{editingId ? 'Edit Listing' : 'Create New Listing'}</h2>
            <form onSubmit={handleSaveListing} className="space-y-4">
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
                {(formData.imagePreview || formData.existingImage) && (
                  <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                    <img 
                      src={formData.imagePreview || formData.existingImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
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
                {editingId ? 'Update Listing' : 'Create Listing'}
              </Button>
            </form>
          </div>
        )}

        <div className={`p-6 rounded-lg shadow mb-8 ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Filters</h3>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 gap-4">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="secondary"
              className={isDarkMode ? 'bg-secondary-700 text-white' : ''}
            >
              Previous
            </Button>
            <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="secondary"
              className={isDarkMode ? 'bg-secondary-700 text-white' : ''}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPage;
