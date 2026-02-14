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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {listings.length > 0 ? (
          listings.map((listing) => (
            <div
              key={listing._id}
              className="card tilt-hover group flex flex-col h-full"
            >
              <div className="relative h-56 overflow-hidden rounded-t-2xl">
                {listing.image ? (
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <span className="text-5xl">🛍️</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-lg">
                    {listing.category}
                  </span>
                </div>
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                <div className="absolute bottom-3 left-3 flex-1 mr-2">
                  <p className="text-2xl font-bold text-white drop-shadow-md">
                    ${listing.price}
                  </p>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className={`text-xl font-bold mb-2 line-clamp-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  {listing.title}
                </h3>
                <p className={`text-sm mb-4 line-clamp-2 flex-grow ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  {listing.description}
                </p>

                <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                  <div className="flex items-center gap-2">
                    {listing.owner?.avatar ? (
                      <img src={listing.owner.avatar} alt="Owner" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/20" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20">
                        {listing.owner?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                      {listing.owner?.username || 'Unknown'}
                    </span>
                  </div>

                  {(listing.owner?._id === user?._id || listing.owner === user?._id) && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleEditListing(listing, e)}
                        className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-sky-400' : 'hover:bg-sky-50 text-sky-600'}`}
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button
                        onClick={(e) => handleDeleteListing(listing._id, e)}
                        disabled={deletingId === listing._id}
                        className={`p-2 rounded-full transition-colors ${confirmId === listing._id
                            ? 'bg-red-500 text-white animate-pulse'
                            : isDarkMode ? 'hover:bg-slate-700 text-red-400' : 'hover:bg-red-50 text-red-600'
                          }`}
                        title="Delete"
                      >
                        {confirmId === listing._id ? (
                          <span className="text-xs font-bold">Confirm</span>
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
          <div className="col-span-full text-center py-20 opacity-60">
            <div className="text-6xl mb-4">🏷️</div>
            <p className="text-xl">No listings found</p>
          </div>
        )}
      </div>
    );
  }, [listings, loading, isDarkMode, user, handleDeleteListing, handleEditListing, confirmId, deletingId]);

  return (
    <div className="min-h-screen pt-20 pb-12 transition-colors duration-300">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-300'} animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-300'} animate-pulse`} style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Marketplace</h1>
          <Button
            onClick={handleToggleForm}
            className="btn-primary"
          >
            {showCreateForm ? 'Cancel' : 'Create Listing'}
          </Button>
        </div>

        {error && (
          <div className="mb-6 animate-slide-up">
            <ErrorBox
              message="Market Error"
              errors={[error]}
              onDismiss={handleDismissError}
            />
          </div>
        )}

        {showCreateForm && (
          <div className="glass-panel p-6 mb-8 animate-fade-in">
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{editingId ? 'Edit Listing' : 'Create New Listing'}</h2>
            <form onSubmit={handleSaveListing} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="input-field"
                  required
                />
                <Input
                  label="Category"
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="input-field"
                  required
                />
                <div className="relative">
                  <Input
                    label="Price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    className="input-field pl-8"
                    required
                  />
                  <span className={`absolute left-3 top-[38px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>$</span>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Image
                </label>
                <div className={`border-2 border-dashed rounded-xl p-4 text-center ${isDarkMode ? 'border-slate-600 hover:border-slate-500' : 'border-slate-300 hover:border-slate-400'} transition-colors cursor-pointer relative group`} onClick={() => fileInputRef.current?.click()}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <span className="text-4xl">🖼️</span>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Click to upload image</p>
                  </div>
                </div>
                {(formData.imagePreview || formData.existingImage) && (
                  <div className="mt-4 relative w-full h-48 rounded-xl overflow-hidden shadow-md">
                    <img
                      src={formData.imagePreview || formData.existingImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: null, existingImage: null }))}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe your item..."
                  value={formData.description}
                  onChange={handleFormChange}
                  className="input-field min-h-[100px] resize-none"
                  rows="4"
                  required
                />
              </div>
              <Button type="submit" className="w-full btn-primary">
                {editingId ? 'Update Listing' : 'Create Listing'}
              </Button>
            </form>
          </div>
        )}

        <div className="glass-panel p-6 mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔍</span>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              type="text"
              name="search"
              placeholder="Search..."
              value={filters.search}
              onChange={handleFilterChange}
              className="input-field"
            />
            <Input
              type="text"
              name="category"
              placeholder="Category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input-field"
            />
            <Input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={handleFilterChange}
              className="input-field"
            />
            <Input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
        </div>

        {listingsGrid}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-12 gap-4">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="glass-button"
            >
              Previous
            </Button>
            <span className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="glass-button"
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
