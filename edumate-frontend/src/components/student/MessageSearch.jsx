import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, Calendar, User, FileText } from 'lucide-react';
import messageService from '../../services/messages/messageService';
import { MessageAttachment } from './FileAttachment';

const MessageSearch = ({ isOpen, onClose, tutorId = null, tutorName = null }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    messageType: 'all'
  });
  const [searchHistory, setSearchHistory] = useState([]);
  
  const searchInputRef = useRef(null);
  const debounceRef = useRef(null);

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('messageSearchHistory');
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory));
      } catch (error) {
      }
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (newHistory) => {
    try {
      localStorage.setItem('messageSearchHistory', JSON.stringify(newHistory));
    } catch (error) {
    }
  };

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim()) {
      debounceRef.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, filters]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const searchOptions = {
        tutorId: tutorId,
        dateFrom: filters.dateFrom || null,
        dateTo: filters.dateTo || null,
        messageType: filters.messageType === 'all' ? null : filters.messageType
      };

      const response = await messageService.searchMessages(query, searchOptions);
      
      if (response.success) {
        setResults(response.data.messages || []);
        
        // Add to search history
        const newHistoryItem = {
          id: Date.now(),
          query: query.trim(),
          timestamp: new Date().toISOString(),
          tutorId,
          tutorName,
          resultCount: response.data.messages?.length || 0
        };

        const updatedHistory = [
          newHistoryItem,
          ...searchHistory.filter(item => item.query !== query.trim()).slice(0, 9)
        ];

        setSearchHistory(updatedHistory);
        saveSearchHistory(updatedHistory);
      } else {
        setResults([]);
      }
    } catch (error) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchHistoryClick = (historyItem) => {
    setQuery(historyItem.query);
    if (historyItem.tutorId && historyItem.tutorId !== tutorId) {
      // If the history item is for a different tutor, you might want to handle this
    }
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('messageSearchHistory');
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const highlightText = (text, searchQuery) => {
    if (!searchQuery.trim()) return text;
    
    const regex = new RegExp(`(${searchQuery.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-16 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Search size={24} className="text-gray-500 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Search Messages</h3>
              {tutorName && (
                <p className="text-sm text-gray-500">in conversation with {tutorName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search messages..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-purple-50 border-purple-300 text-purple-600'
                  : 'border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Filter size={16} />
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                  <select
                    value={filters.messageType}
                    onChange={(e) => setFilters(prev => ({ ...prev, messageType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Types</option>
                    <option value="text">Text Only</option>
                    <option value="image">Images</option>
                    <option value="file">Files</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Search Results */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Searching...</span>
              </div>
            )}

            {!loading && query && results.length === 0 && (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">No messages found</h3>
                <p className="text-gray-400">Try adjusting your search terms or filters</p>
              </div>
            )}

            {!loading && !query && (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-500 mb-2">Search Messages</h3>
                <p className="text-gray-400">Enter keywords to search through your conversation history</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-4">
                <div className="text-sm text-gray-500 mb-4">
                  Found {results.length} message{results.length !== 1 ? 's' : ''}
                </div>
                
                {results.map((message) => (
                  <div key={message.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className="bg-[#6A0DAD] rounded-full w-8 h-8 flex items-center justify-center font-bold text-white text-xs mr-3">
                          {message.senderName.split(' ').map(word => word.charAt(0)).join('')}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">{message.senderName}</span>
                          <span className="text-sm text-gray-500 ml-2">{formatMessageTime(message.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-11">
                      <p className="text-gray-800 mb-2">
                        {highlightText(message.content, query)}
                      </p>
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="space-y-2">
                          {message.attachments.map((attachment, index) => (
                            <MessageAttachment key={index} attachment={attachment} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search History Sidebar */}
          {searchHistory.length > 0 && (
            <div className="w-80 border-l border-gray-200 bg-gray-50">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">Recent Searches</h4>
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                {searchHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSearchHistoryClick(item)}
                    className="w-full text-left p-3 bg-white rounded-lg hover:bg-purple-50 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800 group-hover:text-purple-700 truncate">
                        {item.query}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        {item.resultCount}
                      </span>
                    </div>
                    {item.tutorName && (
                      <div className="text-xs text-gray-500 mt-1">
                        with {item.tutorName}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {formatMessageTime(item.timestamp)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageSearch;