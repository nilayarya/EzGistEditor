import React, { useState, useEffect, useRef } from 'react';
// No longer need GistData type here if not receiving the full object as prop
// import { GistData } from '../types';

interface GistEditorProps {
  // Initial values for local state
  initialFilename?: string;
  initialContent?: string;
  // Callbacks
  onContentChange: (description: string, filename: string, content: string) => void; // Still needed to update preview
  onConfirmPrint: () => void;
  // Function to request gist data from parent
  onRequestGistData: (urlOrId: string) => Promise<{ filename: string; content: string } | null>;
}

// Simple SVG path for a download icon (custom style)
const DownloadIcon = () => (
    <svg
        aria-hidden="true"
        height="16"
        // Adjust viewBox if needed based on the new path's coordinates
        viewBox="0 0 24 24" // Example: Using a 24x24 viewBox
        version="1.1"
        width="16"
        className="button-icon"
    >
        {/* New path data for the desired download icon style */}
        <path d="M12 16.5l-6-6h4V3h4v7.5h4l-6 6zM4 18h16v2H4v-2z"/>
    </svg>
);

const GistEditor: React.FC<GistEditorProps> = ({
  initialFilename = '', // Default initial values
  initialContent = '',
  onContentChange,
  onConfirmPrint,
  onRequestGistData
}) => {
  // Local state for editor fields, initialized from props
  // Description is removed as it's not directly used/updated in this simpler approach
  // const [description, setDescription] = useState('');
  const [filename, setFilename] = useState(initialFilename);
  const [content, setContent] = useState(initialContent);
  // Local state specifically for the URL input field
  const [gistUrl, setGistUrl] = useState('');
  const [showPrintConfirmPopup, setShowPrintConfirmPopup] = useState(false);
  const saveButtonContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false); // Optional: Add loading state

  // Effect to call onContentChange when local fields change (user typing)
  // This updates the preview pane via App's state
  useEffect(() => {
    // Pass empty string for description if it's not managed here
    onContentChange('', filename, content);
  }, [filename, content, onContentChange]); // Removed description dependency

  // Click outside handler to close the popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (saveButtonContainerRef.current && !saveButtonContainerRef.current.contains(event.target as Node)) {
        setShowPrintConfirmPopup(false);
      }
    };

    if (showPrintConfirmPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPrintConfirmPopup]); // Re-run when popup visibility changes

  // Toggle the confirmation popup
  const handleSavePdfClick = () => {
    setShowPrintConfirmPopup(prev => !prev);
  };

  // Request Gist data and update local state if successful
  const handleLoadGist = async () => {
    if (!gistUrl.trim()) {
        alert("Please enter a Gist URL or ID.");
        return;
    }
    setIsLoading(true); // Set loading state
    console.log('Requesting Gist data for input:', gistUrl);
    try {
        const loadedData = await onRequestGistData(gistUrl); // Call the function passed from App
        if (loadedData) {
            console.log('Received Gist data, updating editor state:', loadedData);
            // Update local state directly
            setFilename(loadedData.filename);
            setContent(loadedData.content);
            // Optionally clear the URL input after successful load
            // setGistUrl('');
        } else {
            // Error was likely already alerted in onRequestGistData
            console.log('Failed to load Gist data (null returned).');
        }
    } catch (error) {
        // Catch any unexpected errors from the promise itself
        console.error("Error during onRequestGistData call:", error);
        alert(`An unexpected error occurred while trying to load the Gist: ${error}`);
    } finally {
        setIsLoading(false); // Clear loading state
    }
  };

  // Trigger print preparation in App.tsx
  const handleTriggerPrint = () => {
    setShowPrintConfirmPopup(false);
    onConfirmPrint();
  };

  return (
    <div className="gist-editor">
      <div className="gist-editor-header">
        <div className="gist-url-container">
          <input
            type="text"
            className="gist-url-input"
            placeholder="Enter Gist URL or ID..."
            value={gistUrl}
            onChange={(e) => setGistUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLoadGist(); }}
            disabled={isLoading} // Disable input while loading
          />
          {/* Disable button while loading */}
          <button
            className="load-button"
            onClick={handleLoadGist}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load Gist'}
          </button>

          {/* Wrap Save Button and Popup in a relative container */}
          <div className="save-pdf-container" ref={saveButtonContainerRef}>
            <button className="save-pdf-button" onClick={handleSavePdfClick}>
               <DownloadIcon />
               Save to PDF
            </button>

            {/* Confirmation Popup Bubble */}
            {showPrintConfirmPopup && (
              <div className="print-confirm-bubble">
                <p>
                  Tip: When the print dialog appears, uncheck "Headers and footers"
                  (usually under "More settings"-&gt;"Options") for the cleanest PDF.
                </p>
                <div className="print-confirm-buttons">
                  <button onClick={handleTriggerPrint} className="confirm-button">Continue to Print</button>
                </div>
              </div>
            )}
          </div> {/* End save-pdf-container */}

        </div>
      </div>
      
      <div className="gist-editor-toolbar">
        <div className="filename-container">
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="filename-input"
            placeholder="Filename including extension..."
          />
        </div>
      </div>
      
      <div className="gist-content-editor">
        <textarea
          className="content-textarea"
          placeholder="Enter your code here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
    </div>
  );
};

export default GistEditor; 