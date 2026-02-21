import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FeedbackPage = () => {
    const navigate = useNavigate();
    const initialFormState = {
        name: '',
        rollNo: '',
        year: '',
        category: 'Academics',
        rating: 0,
        comments: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRating = (rating) => {
        setFormData((prev) => ({
            ...prev,
            rating: rating,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
            // No auto-redirect for public form
        }, 1500);
    };

    const handleReset = () => {
        setFormData(initialFormState);
        setSubmitted(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-dark-900">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-light"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-600/20 rounded-full blur-3xl animate-pulse-light" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="glass-panel p-8 max-w-md w-full text-center animate-fadeInUp relative z-10">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Thank You!</h2>
                    <p className="text-dark-300 mb-8">Your feedback has been submitted successfully.</p>
                    <button
                        onClick={handleReset}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors shadow-glow-sm"
                    >
                        Submit Another Response
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-4 py-8 md:py-12 relative overflow-hidden bg-dark-900">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-80 h-80 rounded-full mix-blend-screen filter blur-3xl opacity-20 bg-primary-600 animate-pulse-light"></div>
                <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full mix-blend-screen filter blur-3xl opacity-20 bg-secondary-600 floating-element-slow"></div>
            </div>

            <div className="relative max-w-3xl mx-auto z-10">
                <div className="text-center mb-10 animate-fadeInUp">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-400 font-medium text-sm mb-4 border border-primary-500/20">
                        ECE Department
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-display">
                        Student Feedback Form
                    </h1>
                    <p className="text-lg text-dark-300 max-w-2xl mx-auto">
                        Your feedback helps us improve the department. Please fill out the form below.
                    </p>
                </div>

                <div className="glass-panel p-6 md:p-10 animate-slideUp">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Details Section */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white border-b border-dark-700 pb-2">Student Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-dark-800/50 border border-dark-700 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder-dark-500"
                                        placeholder="Enter your name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Roll Number</label>
                                    <input
                                        type="text"
                                        name="rollNo"
                                        value={formData.rollNo}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-dark-800/50 border border-dark-700 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder-dark-500"
                                        placeholder="e.g., 20XXX000"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Year of Study</label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-dark-800/50 border border-dark-700 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                        required
                                    >
                                        <option value="" disabled>Select Year</option>
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-dark-300 mb-2">Feedback Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg bg-dark-800/50 border border-dark-700 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                    >
                                        <option value="Academics">Academics</option>
                                        <option value="Infrastructure">Infrastructure</option>
                                        <option value="Labs">Labs</option>
                                        <option value="Faculty">Faculty</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Feedback Section */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-white border-b border-dark-700 pb-2">Your Feedback</h3>

                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-3">Rate your experience</label>
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRating(star)}
                                            className={`text-3xl transition-transform hover:scale-110 focus:outline-none ${formData.rating >= star ? 'text-yellow-400' : 'text-dark-600'
                                                }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                {formData.rating === 0 && <p className="text-xs text-red-400 mt-2">Please select a rating</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-dark-300 mb-2">Detailed Comments</label>
                                <textarea
                                    name="comments"
                                    value={formData.comments}
                                    onChange={handleChange}
                                    rows="5"
                                    className="w-full px-4 py-3 rounded-lg bg-dark-800/50 border border-dark-700 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all placeholder-dark-500 resize-none"
                                    placeholder="Share your thoughts, suggestions, or concerns..."
                                    required
                                ></textarea>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-dark-700">
                            {/* No Cancel button for public form */}
                            <button
                                type="submit"
                                disabled={loading || formData.rating === 0}
                                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-lg font-semibold shadow-glow-sm hover:shadow-glow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit Feedback'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;
