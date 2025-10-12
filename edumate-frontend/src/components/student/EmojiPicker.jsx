import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Smile } from 'lucide-react';

const CustomEmojiPicker = ({ onEmojiSelect, disabled = false }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPicker]);

  // Close picker on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showPicker]);

  const handleEmojiClick = (emojiData, event) => {
    onEmojiSelect(emojiData.emoji);
    setShowPicker(false);
  };

  const togglePicker = () => {
    if (!disabled) {
      setShowPicker(!showPicker);
    }
  };

  return (
    <div className="relative">
      {/* Emoji Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={togglePicker}
        disabled={disabled}
        className={`p-1.5 rounded-lg transition-colors ${
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:bg-gray-100 cursor-pointer'
        } ${showPicker ? 'bg-gray-100' : ''}`}
        title="Add emoji"
      >
        <Smile size={16} className="text-gray-500" />
      </button>

      {/* Emoji Picker Popup */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl rounded-lg overflow-hidden bg-white border"
          style={{ 
            filter: 'drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1))'
          }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={false}
            theme="light"
            width={320}
            height={400}
            previewConfig={{
              showPreview: false
            }}
            searchPlaceholder="Search emojis..."
            categories={[
              {
                name: 'Smileys & People',
                category: 'smileys_people'
              },
              {
                name: 'Animals & Nature', 
                category: 'animals_nature'
              },
              {
                name: 'Food & Drink',
                category: 'food_drink'
              },
              {
                name: 'Activities',
                category: 'activities'
              },
              {
                name: 'Travel & Places',
                category: 'travel_places'
              },
              {
                name: 'Objects',
                category: 'objects'
              },
              {
                name: 'Symbols',
                category: 'symbols'
              }
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default CustomEmojiPicker;