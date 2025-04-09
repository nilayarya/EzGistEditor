import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GistData } from '../types';

interface GistPreviewProps {
  data: GistData;
}

// Simple SVG path for a file icon (adjust path data 'd' as needed)
const FileIcon = () => (
  <svg
    aria-hidden="true"
    height="16"
    viewBox="0 0 16 16"
    version="1.1"
    width="16"
    className="file-icon" // Add class for styling
  >
    <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16H3.75A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-2.938-2.938Z"></path>
  </svg>
);

const GistPreview: React.FC<GistPreviewProps> = ({ data }) => {
  return (
    <div className="preview-content-wrapper">
      <div className="gist-preview">
        {data.files.map((file, index) => (
          <div key={index} className="gist-file">
            <div className="file-header">
              <FileIcon />
              <span className="filename">{file.filename || 'untitled'}</span>
            </div>
            <div className="file-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {file.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GistPreview; 