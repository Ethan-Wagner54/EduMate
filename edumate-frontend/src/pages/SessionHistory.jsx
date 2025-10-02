import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, Filter, Download, AlertTriangle } from 'lucide-react';
import sessionHistoryService from '../services/sessionHistory/sessionHistory';

export default function SessionHistory() {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, completed, cancelled
  const [sortBy, setSortBy] = useState('date'); // date, rating, module
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await sessionHistoryService.getSessionHistory({ status: filter, sortBy });
        if (response.success) {
          setSessions(response.data || []);
        } else {
          setError(response.error || 'Failed to load session history');
        }
      } catch (err) {
        console.error('Error fetching session history:', err);
        setError('Failed to load session history');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionHistory();
  }, [filter, sortBy]);

  const handleExportHistory = () => {
    // This would implement CSV export functionality
    console.log('Exporting session history...');
    alert('Export functionality will be implemented soon!');
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      case 'no-show':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const renderStarRating = (rating) => {
    if (!rating) return <span className="text-muted-foreground">Not rated</span>;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'text-warning fill-current' : 'text-muted-foreground'}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-200 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading session history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background transition-colors duration-200 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Error Loading Session History</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Session History</h1>
            <p className="text-muted-foreground">Review your past tutoring sessions and feedback</p>
          </div>
          <button
            onClick={handleExportHistory}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Filters:</span>
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All Sessions' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm font-medium text-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1 border border-border rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="date">Date</option>
                <option value="rating">Rating</option>
                <option value="module">Module</option>
              </select>
            </div>
          </div>
        </div>

        {/* Session Cards */}
        <div className="grid gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start">
                  <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-primary-foreground text-lg mr-4">
                    {session.tutor.name.split(' ').map(word => word.charAt(0)).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{session.module.name}</h3>
                    <p className="text-sm text-muted-foreground">with {session.tutor.name}</p>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium mt-1 inline-block">
                      {session.module.code}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2" />
                  <span>{new Date(session.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  <span>{session.startTime} - {session.endTime}</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={16} className="mr-2" />
                  <span>{session.location}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">Duration:</span>
                  <span>1.5 hours</span>
                </div>
              </div>

              {session.status === 'completed' && (
                <div className="border-t border-border pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Your Rating:</h4>
                      {renderStarRating(session.rating)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Your Feedback:</h4>
                      <p className="text-sm text-muted-foreground italic">"{session.feedback}"</p>
                    </div>
                  </div>
                </div>
              )}

              {session.status === 'cancelled' && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-red-600 dark:text-red-400">This session was cancelled.</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-8 shadow-sm text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No sessions found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? "You haven't attended any sessions yet." 
                : `No ${filter} sessions found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}