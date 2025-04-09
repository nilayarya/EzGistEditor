import React, { useState, useEffect, useRef } from 'react';
import { GistData } from '../types';

interface GistEditorProps {
  data: GistData;
  onContentChange: (description: string, filename: string, content: string) => void;
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

const GistEditor: React.FC<GistEditorProps> = ({ data, onContentChange }) => {
  const [description, setDescription] = useState(data.description);
  const [filename, setFilename] = useState(data.files[0]?.filename || '');
  const [content, setContent] = useState(data.files[0]?.content || '');
  const [gistUrl, setGistUrl] = useState('');
  const [showPrintConfirmPopup, setShowPrintConfirmPopup] = useState(false); // State for popup visibility
  const saveButtonContainerRef = useRef<HTMLDivElement>(null); // Ref for the container

  useEffect(() => {
    onContentChange(description, filename, content);
  }, [description, filename, content, onContentChange]);

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

  const handleLoadGist = () => {
    // TODO: Implement Gist loading logic
    console.log('Load Gist clicked', gistUrl);
  };

  // Toggle the confirmation popup
  const handleSavePdfClick = () => {
    setShowPrintConfirmPopup(prev => !prev); // Toggle visibility
  };

  // Proceed with printing after confirmation
  const handleConfirmPrint = () => {
    setShowPrintConfirmPopup(false); // Hide the popup
    console.log('Triggering browser print dialog...');
    window.print(); // Trigger the browser's print functionality
  };

  // Optional: Remove this function if Cancel button is gone and click-outside handles closure
  const handleCancelPrint = () => {
     setShowPrintConfirmPopup(false);
  };

  return (
    <div className="gist-editor">
      <div className="gist-editor-header">
        <div className="gist-url-container">
          <input
            type="text"
            className="gist-url-input"
            placeholder="Enter Gist URL..."
            value={gistUrl}
            onChange={(e) => setGistUrl(e.target.value)}
          />
          <button className="load-button" onClick={handleLoadGist}>Load Gist</button>

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
                  <button onClick={handleConfirmPrint} className="confirm-button">Continue to Print</button>
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