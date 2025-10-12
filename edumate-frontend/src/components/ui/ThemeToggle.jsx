import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ 
  variant = 'default', 
  showLabels = false, 
  size = 'md',
  className = '' 
}) => {
  const themeContext = useTheme();
  
  if (!themeContext) {
    return <div>Theme not available</div>;
  }
  
  const { theme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme } = themeContext;

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20
  };

  if (variant === 'dropdown') {
    return (
      <div className={`relative group ${className}`}>
        <button
          onClick={toggleTheme}
          className={`${sizeClasses[size]} rounded-lg border border-border bg-background hover:bg-accent transition-colors duration-200`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <Sun size={iconSizes[size]} className="text-foreground" />
          ) : (
            <Moon size={iconSizes[size]} className="text-foreground" />
          )}
        </button>
      </div>
    );
  }

  if (variant === 'menu') {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Theme
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={setLightTheme}
            className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${
              theme === 'light'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card hover:bg-accent border-border'
            }`}
          >
            <Sun size={iconSizes[size]} />
            {showLabels && (
              <span className="text-xs mt-1">Light</span>
            )}
          </button>
          
          <button
            onClick={setDarkTheme}
            className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card hover:bg-accent border-border'
            }`}
          >
            <Moon size={iconSizes[size]} />
            {showLabels && (
              <span className="text-xs mt-1">Dark</span>
            )}
          </button>
          
          <button
            onClick={setSystemTheme}
            className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${
              !localStorage.getItem('edumate-theme')
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card hover:bg-accent border-border'
            }`}
          >
            <Monitor size={iconSizes[size]} />
            {showLabels && (
              <span className="text-xs mt-1">System</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Default toggle button
  return (
    <button
      onClick={toggleTheme}
      className={`${sizeClasses[size]} rounded-lg border border-border bg-background hover:bg-accent transition-colors duration-200 ${className}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Sun size={iconSizes[size]} className="text-foreground" />
      ) : (
        <Moon size={iconSizes[size]} className="text-foreground" />
      )}
    </button>
  );
};

export default ThemeToggle;