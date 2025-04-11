import React, { useState, useEffect, useRef } from 'react';
// No longer need GistData type here if not receiving the full object as prop
// import { GistData } from '../types';

// LocalStorage keys
const LS_FILENAME_KEY = 'gistEditor_filename';
const LS_CONTENT_KEY = 'gistEditor_content';
const LS_GIST_URL_KEY = 'gistEditor_lastUrl';

interface GistEditorProps {
  // Receive current values as props
  filename: string;
  content: string;
  // Callbacks
  onContentChange: (filename: string, content: string) => void; // Simplified signature
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
  // Destructure props directly
  filename,
  content,
  onContentChange,
  onConfirmPrint,
  onRequestGistData
}) => {
  // --- REMOVE internal state and effects for filename and content ---
  // const [filename, setFilename] = useState<string>(initialFilename);
  // const [content, setContent] = useState<string>(initialContent);
  // const isMounted = useRef(false);
  // useEffect(() => { ... }, [initialFilename, initialContent]); // Effect 1 removed
  // useEffect(() => { ... }, [filename, content, onContentChange]); // Effect 2 removed

  // --- Keep state for URL input, print popup, loading ---
  const [gistUrl, setGistUrl] = useState<string>(() => {
    try {
      return localStorage.getItem(LS_GIST_URL_KEY) ?? '';
    } catch (error) {
      console.error("Error reading Gist URL from localStorage:", error);
      return '';
    }
  });
  const [showPrintConfirmPopup, setShowPrintConfirmPopup] = useState(false);
  const saveButtonContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Keep click outside effect for print popup ---
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
  }, [showPrintConfirmPopup]);

  // --- Keep handlers for print, load gist, url change ---
  const handleSavePdfClick = () => {
    setShowPrintConfirmPopup(prev => !prev);
  };

  // Modified handleLoadGist: Call parent, which should update state & save
  const handleLoadGist = async () => {
    if (!gistUrl.trim()) {
        alert("Please enter a Gist URL or ID.");
        return;
    }
    setIsLoading(true);
    console.log('Requesting Gist data for input:', gistUrl);
    try {
        const loadedData = await onRequestGistData(gistUrl);
        if (loadedData) {
            console.log('Received Gist data. Telling App to update state.');
            // Tell App to update its state with the newly loaded data
            onContentChange(loadedData.filename, loadedData.content);
        } else {
            console.log('Failed to load Gist data (null returned).');
        }
    } catch (error) {
        console.error("Error during onRequestGistData call:", error);
        alert(`An unexpected error occurred while trying to load the Gist: ${error}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleTriggerPrint = () => {
    setShowPrintConfirmPopup(false);
    onConfirmPrint();
  };

  const handleGistUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;
    setGistUrl(newUrl);
    try {
      localStorage.setItem(LS_GIST_URL_KEY, newUrl);
    } catch (error) {
      console.error("Error saving Gist URL to localStorage:", error);
    }
  };

  // --- Update input/textarea onChange handlers ---
  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Call parent handler with the NEW filename and the CURRENT content prop
    onContentChange(e.target.value, content);
  };

  const handleContentTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
     // Call parent handler with the CURRENT filename prop and the NEW content
    onContentChange(filename, e.target.value);
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
            onChange={handleGistUrlChange}
            onKeyDown={(e) => { if (e.key === 'Enter') handleLoadGist(); }}
            disabled={isLoading}
          />
          <button
            className="load-button"
            onClick={handleLoadGist}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load Gist'}
          </button>

          <div className="save-pdf-container" ref={saveButtonContainerRef}>
            <button className="save-pdf-button" onClick={handleSavePdfClick}>
               <DownloadIcon />
               Save to PDF
            </button>

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
          </div>

        </div>
      </div>
      
      <div className="gist-editor-toolbar">
        <div className="filename-container">
          <input
            type="text"
            value={filename}
            onChange={handleFilenameChange}
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
          onChange={handleContentTextChange}
        />
      </div>
    </div>
  );
};

export default GistEditor; 