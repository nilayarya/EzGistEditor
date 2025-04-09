import React, { useState, useCallback, useRef, useEffect } from 'react';
import GistEditor from './components/GistEditor';
import GistPreview from './components/GistPreview';
import { GistData } from './types';
import './styles/GistEditor.css';

const MIN_PANE_WIDTH = 100;

// Helper function to extract Gist ID (Keep this)
const extractGistId = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
    const potentialId = pathSegments[pathSegments.length - 1];
    if (potentialId && /^[a-z0-9]+$/i.test(potentialId) && potentialId.length >= 20) {
       return potentialId;
    }
  } catch (e) {
     if (/^[a-z0-9]+$/i.test(url) && url.length >= 20) {
        return url;
     }
  }
  const match = url.match(/[a-f0-9]{20,}/i);
  if (match) {
      return match[0];
  }
  return null;
};

const App: React.FC = () => {
  // Shared state - only updated by GistEditor's onContentChange now
  const [gistData, setGistData] = useState<GistData>({
    description: '', // Description might not be used if not loading into shared state
    files: [{
      filename: '',
      content: ''
    }]
  });

  const [isDragging, setIsDragging] = useState(false);
  const [editorWidth, setEditorWidth] = useState(50);
  const splitViewRef = useRef<HTMLDivElement>(null);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  // Updates the PREVIEW based on editor typing
  const handleContentChange = useCallback((description: string, filename: string, content: string) => {
    setGistData(prevData => {
      // Prevent unnecessary updates if data hasn't changed
      if (prevData.description !== description ||
          prevData.files[0]?.filename !== filename ||
          prevData.files[0]?.content !== content) {
        return { description, files: [{ filename, content }] };
      }
      return prevData;
    });
  }, []);

  // --- Dragging Logic ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !splitViewRef.current) return;
    const container = splitViewRef.current;
    const containerRect = container.getBoundingClientRect();
    const newEditorPixelWidth = e.clientX - containerRect.left;
    const totalWidth = containerRect.width;
    const minWidthPercent = (MIN_PANE_WIDTH / totalWidth) * 100;
    let newEditorPercent = (newEditorPixelWidth / totalWidth) * 100;
    newEditorPercent = Math.max(minWidthPercent, newEditorPercent);
    newEditorPercent = Math.min(100 - minWidthPercent, newEditorPercent);
    setEditorWidth(newEditorPercent);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) setIsDragging(false);
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // --- Print Preparation Logic ---
  const handleConfirmPrint = () => {
    setIsPreparingPrint(true);
    setTimeout(() => { window.print(); }, 0);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      console.log("After print event triggered");
      setIsPreparingPrint(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  // --- Request Gist Data Logic ---
  // Fetches data and RETURNS it, does NOT set state here
  const requestGistData = async (urlOrId: string): Promise<{ filename: string; content: string } | null> => {
    const gistId = extractGistId(urlOrId);

    if (!gistId) {
      alert('Invalid Gist URL or ID provided.');
      return null; // Indicate failure
    }

    console.log(`Requesting Gist data for ID: ${gistId}`);
    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (!response.ok) {
         if (response.status === 404) throw new Error('Gist not found (404).');
         let errorMsg = `GitHub API error: ${response.status}`;
         try { const errData = await response.json(); errorMsg += ` - ${errData.message}`; } catch { /* ignore */ }
         throw new Error(errorMsg);
      }
      const data = await response.json();

      const files = data.files;
      if (!files || Object.keys(files).length === 0) throw new Error('Gist contains no files.');

      const firstFileName = Object.keys(files)[0];
      const firstFile = files[firstFileName];
      if (!firstFile) throw new Error('Could not access file data.');

      const filename = firstFile.filename || 'untitled';
      const content = firstFile.content || '';

      console.log('Gist data retrieved successfully.');
      return { filename, content }; // Return the data

    } catch (error) {
      console.error('Failed to request Gist data:', error);
      alert(`Failed to load Gist: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null; // Indicate failure
    }
  };

  return (
    <div className="app">
      <div
        className={`split-view ${isPreparingPrint ? 'preparing-print' : ''}`}
        ref={splitViewRef}
      >
        <div
          className={`editor-pane ${isPreparingPrint ? 'preparing-print' : ''}`}
          style={!isPreparingPrint ? { flexBasis: `${editorWidth}%` } : {}}
        >
          <GistEditor
            // Pass initial data (likely empty or default)
            initialFilename={gistData.files[0]?.filename}
            initialContent={gistData.files[0]?.content}
            // Pass callbacks
            onContentChange={handleContentChange} // Updates preview
            onConfirmPrint={handleConfirmPrint}
            onRequestGistData={requestGistData} // Pass the request function
          />
        </div>
        <div
          className={`divider ${isPreparingPrint ? 'preparing-print' : ''}`}
          onMouseDown={handleMouseDown}
          title="Drag to resize"
        />
        <div
          className={`preview-pane ${isPreparingPrint ? 'preparing-print' : ''}`}
          style={!isPreparingPrint ? { flexBasis: `${100 - editorWidth}%` } : {}}
        >
          {/* Preview uses the shared gistData state */}
          <GistPreview data={gistData} />
        </div>
      </div>
    </div>
  );
};

export default App; 