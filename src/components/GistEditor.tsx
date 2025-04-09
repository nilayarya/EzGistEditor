import React, { useState, useEffect } from 'react';
import { GistData } from '../types';

interface GistEditorProps {
  data: GistData;
  onContentChange: (description: string, filename: string, content: string) => void;
}

const GistEditor: React.FC<GistEditorProps> = ({ data, onContentChange }) => {
  const [description, setDescription] = useState(data.description);
  const [filename, setFilename] = useState(data.files[0]?.filename || '');
  const [content, setContent] = useState(data.files[0]?.content || '');
  const [gistUrl, setGistUrl] = useState('');

  useEffect(() => {
    onContentChange(description, filename, content);
  }, [description, filename, content, onContentChange]);

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
          <button className="load-button">Load Gist</button>
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