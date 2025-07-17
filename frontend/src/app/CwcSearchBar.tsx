"use client";
import React, { useState } from "react";

const CwcSearchBar = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [employeeCount, setEmployeeCount] = useState(0);
  const [databaseAvailable, setDatabaseAvailable] = useState(true);

  const handleQuerySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    
    setLoading(true);
    setError("");
    setResult("");
    setEmployeeCount(0);
    setDatabaseAvailable(true);
    
    try {
      // Use the correct backend port
      const res = await fetch("http://localhost:5001/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
      
      const data = await res.json();
      setResult(data.reply || "No response received");
      setEmployeeCount(data.employeeCount || 0);
      setDatabaseAvailable(data.databaseAvailable !== false);
    } catch (err: any) {
      console.error('Search error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError("Unable to connect to the server. Please check if the backend is running.");
      } else {
        setError(err.message || "Unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full mx-auto px-4 sm:px-6 lg:px-8">
      {/* Results display - ABOVE search bar */}
      {result && (
        <div className="mb-4 sm:mb-6 w-full">
          <div className="bg-white border border-blue-200 rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${databaseAvailable ? 'bg-green-500' : 'bg-yellow-500'} shrink-0`}></div>
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  Database: {databaseAvailable ? 'Connected' : 'Limited Mode'}
                </span>
              </div>
              {employeeCount > 0 && (
                <span className="text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
                  Found {employeeCount} employee{employeeCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="text-gray-800 whitespace-pre-line text-sm sm:text-base leading-relaxed">
              {result}
            </div>
          </div>
        </div>
      )}
      
      {/* Error display - ABOVE search bar */}
      {error && (
        <div className="mb-4 sm:mb-6 w-full">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 shadow-lg">
            <div className="flex items-start mb-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 mr-2 sm:mr-3 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span className="text-red-800 font-semibold text-base sm:text-lg">Search Failed</span>
            </div>
            <p className="text-red-700 text-sm sm:text-base ml-7 sm:ml-9">{error}</p>
          </div>
        </div>
      )}

      {/* Search Form - Responsive */}
      <form
        className="flex flex-col sm:flex-row w-full gap-3 sm:gap-4"
        onSubmit={handleQuerySubmit}
        role="search"
        aria-label="CWC Connect employee search"
      >
        <label htmlFor="cwc-search" className="sr-only">
          Search by name, designation, or organization unit
        </label>
        <input
          id="cwc-search"
          type="text"
          className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg border border-gray-200 focus:outline-none focus:ring-2 sm:focus:ring-3 focus:ring-blue-300 focus:border-blue-400 text-sm sm:text-base bg-white transition-all duration-200 placeholder-gray-500 text-black"
          placeholder="Search by name, designation, or organization unit..."
          aria-label="Search by name, designation, or organization unit"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoComplete="off"
          disabled={loading}
        />
        <button
          type="submit"
          className="px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl shadow-lg hover:opacity-90 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 min-w-[120px] sm:min-w-[140px]"
          style={{backgroundColor: '#1fb1da'}}
          disabled={!query.trim() || loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm sm:text-base">Searching...</span>
            </div>
          ) : (
            <span className="text-sm sm:text-base">Search</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default CwcSearchBar; 