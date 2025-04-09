import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    onContentChange(description, filename, content);
  }, [description, filename, content, onContentChange]);

  const handleLoadGist = () => {
    // TODO: Implement Gist loading logic
    console.log('Load Gist clicked', gistUrl);
  };

  const handleSavePdf = () => {
    // TODO: Implement PDF saving logic
    console.log('Save to PDF clicked');
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
          <button className="save-pdf-button" onClick={handleSavePdf}>
             <DownloadIcon />
             Save to PDF
          </button>
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