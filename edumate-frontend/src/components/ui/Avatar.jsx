import React, { useState, useEffect } from 'react';
import { loadProfilePicture, createAvatarPlaceholder } from '../../utils/imageUtils';

/**
 * Reusable Avatar component that displays profile pictures or initials
 * Used consistently across the entire application
 */
export default function Avatar({
  userId,
  userName,
  userType = 'student',
  size = 40,
  className = '',
  showOnlineStatus = false,
  isOnline = false,
  customImage = null, // Allow overriding with a custom image
  onClick = null,
  ...props
}) {
  const [profileImage, setProfileImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (customImage) {
      setProfileImage(customImage);
      setImageLoaded(true);
    } else if (userId && userName) {
      // Load profile picture from storage
      const savedImage = loadProfilePicture(userId, userType);
      if (savedImage) {
        setProfileImage(savedImage);
        setImageLoaded(true);
      } else {
        // Generate placeholder with initials
        const placeholder = createAvatarPlaceholder(userName, size);
        setProfileImage(placeholder);
        setImageLoaded(true);
      }
    }
  }, [userId, userName, userType, size, customImage]);

  const handleImageError = () => {
    // If profile image fails to load, fallback to placeholder
    if (userName) {
      const placeholder = createAvatarPlaceholder(userName, size);
      setProfileImage(placeholder);
    }
  };

  const avatarClasses = `
    relative inline-flex items-center justify-center
    rounded-full overflow-hidden bg-muted
    transition-all duration-200
    ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2' : ''}
    ${className}
  `.trim();

  return (
    <div 
      className={avatarClasses}
      style={{ width: size, height: size }}
      onClick={onClick}
      {...props}
    >
      {/* Main Avatar Image */}
      {profileImage && imageLoaded ? (
        <img
          src={profileImage}
          alt={userName || 'User avatar'}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      ) : (
        // Loading placeholder
        <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">
            {userName?.split(' ').map(word => word.charAt(0)).join('').toUpperCase() || '?'}
          </span>
        </div>
      )}

      {/* Online Status Indicator */}
      {showOnlineStatus && (
        <div className="absolute -bottom-1 -right-1">
          <div 
            className={`
              w-3 h-3 rounded-full border-2 border-background
              ${isOnline ? 'bg-success' : 'bg-muted-foreground'}
            `}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Avatar variants for common use cases
 */

// Small avatar for lists, navigation
export function AvatarSmall(props) {
  return <Avatar size={32} {...props} />;
}

// Medium avatar for cards, headers
export function AvatarMedium(props) {
  return <Avatar size={48} {...props} />;
}

// Large avatar for profiles, detailed views
export function AvatarLarge(props) {
  return <Avatar size={64} {...props} />;
}

// Extra large avatar for profile pages
export function AvatarXL(props) {
  return <Avatar size={96} {...props} />;
}

/**
 * Avatar group for showing multiple users
 */
export function AvatarGroup({ users = [], maxDisplay = 3, size = 32, className = '' }) {
  const displayUsers = users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;
  const offset = size * 0.2; // 20% overlap

  return (
    <div className={`flex items-center ${className}`}>
      {displayUsers.map((user, index) => (
        <div
          key={user.id || index}
          className="relative"
          style={{
            marginLeft: index > 0 ? `-${offset}px` : '0',
            zIndex: displayUsers.length - index
          }}
        >
          <Avatar
            userId={user.id}
            userName={user.name}
            userType={user.type || 'student'}
            size={size}
            className="ring-2 ring-background"
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className="relative flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium ring-2 ring-background"
          style={{
            width: size,
            height: size,
            marginLeft: `-${offset}px`,
            zIndex: 0
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

/**
 * Avatar with name and details
 */
export function AvatarWithName({
  userId,
  userName,
  userType = 'student',
  userDetails = '',
  size = 40,
  avatarClassName = '',
  nameClassName = '',
  detailsClassName = '',
  layout = 'horizontal', // 'horizontal' | 'vertical'
  onClick = null
}) {
  const isVertical = layout === 'vertical';

  return (
    <div 
      className={`flex items-center ${isVertical ? 'flex-col text-center' : 'gap-3'}`}
      onClick={onClick}
    >
      <Avatar
        userId={userId}
        userName={userName}
        userType={userType}
        size={size}
        className={avatarClassName}
      />
      
      <div className={`${isVertical ? 'mt-2' : 'flex-1 min-w-0'}`}>
        <p className={`font-medium text-foreground truncate ${nameClassName}`}>
          {userName}
        </p>
        {userDetails && (
          <p className={`text-sm text-muted-foreground truncate ${detailsClassName}`}>
            {userDetails}
          </p>
        )}
      </div>
    </div>
  );
}