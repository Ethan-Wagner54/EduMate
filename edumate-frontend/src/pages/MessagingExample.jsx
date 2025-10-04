import React, { useState } from 'react';
import UnifiedMessaging from '../components/messaging/UnifiedMessaging';

export default function MessagingExample() {
  const [mode, setMode] = useState('both');
  const [isModal, setIsModal] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {!isModal && (
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground mb-4">Unified Messaging Component Demo</h1>
          
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setMode('private')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'private'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Private Only
            </button>
            <button
              onClick={() => setMode('group')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'group'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Group Only
            </button>
            <button
              onClick={() => setMode('both')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'both'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setIsModal(true)}
              className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              Modal Mode
            </button>
          </div>
        </div>
      )}

      <div style={{ height: isModal ? 'auto' : 'calc(100vh - 140px)' }}>
        <UnifiedMessaging 
          type={mode}
          title={`${mode === 'both' ? 'All Messages' : mode === 'group' ? 'Group Chats' : 'Private Messages'}`}
          isModal={isModal}
          onClose={isModal ? () => setIsModal(false) : null}
        />
      </div>

      {/* Usage Examples */}
      {!isModal && (
        <div className="p-6 bg-card border-t border-border">
          <h2 className="text-lg font-semibold text-foreground mb-3">Usage Examples</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Private only:</strong> <code>{'<UnifiedMessaging type="private" title="Private Messages" />'}</code></div>
            <div><strong>Group only:</strong> <code>{'<UnifiedMessaging type="group" title="Group Chats" />'}</code></div>
            <div><strong>Both with tabs:</strong> <code>{'<UnifiedMessaging type="both" title="All Messages" />'}</code></div>
            <div><strong>Modal mode:</strong> <code>{'<UnifiedMessaging isModal={true} onClose={handleClose} />'}</code></div>
            <div><strong>Specific conversation:</strong> <code>{'<UnifiedMessaging initialConversationId={123} />'}</code></div>
          </div>
        </div>
      )}
    </div>
  );
}