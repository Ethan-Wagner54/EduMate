import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeDebug = () => {
  const { theme, toggleTheme, isDark, isLight } = useTheme();
  
  const handleClick = () => {
    console.log('Theme toggle clicked');
    console.log('Current theme:', theme);
    console.log('Is dark:', isDark);
    console.log('Is light:', isLight);
    
    toggleTheme();
    
    setTimeout(() => {
      console.log('After toggle - theme:', theme);
      console.log('After toggle - document classes:', document.documentElement.classList.toString());
      console.log('After toggle - localStorage:', localStorage.getItem('edumate-theme'));
    }, 100);
  };

  return (
    <div className="fixed top-4 right-4 z-50 p-4 bg-card border border-border rounded-lg shadow-lg">
      <h3 className="text-sm font-medium mb-2">Theme Debug</h3>
      <div className="space-y-2 text-xs">
        <div>Current: <strong>{theme}</strong></div>
        <div>Dark mode: <strong>{isDark ? 'Yes' : 'No'}</strong></div>
        <div>Light mode: <strong>{isLight ? 'Yes' : 'No'}</strong></div>
        <div>HTML classes: <span className="break-all">{document.documentElement.classList.toString()}</span></div>
        <button 
          onClick={handleClick}
          className="w-full mt-2 px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
        >
          Toggle Theme (Check Console)
        </button>
      </div>
    </div>
  );
};

export default ThemeDebug;