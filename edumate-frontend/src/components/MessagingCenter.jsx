import React from 'react';
import UnifiedMessaging from './messaging/UnifiedMessaging';

export function MessagingCenter() {
  return (
    <UnifiedMessaging 
      type="both"
      title="Messages"
    />
  );
}
