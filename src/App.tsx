import React, { useState, useCallback, useRef, useEffect } from 'react';
import GistEditor from './components/GistEditor';
import GistPreview from './components/GistPreview';
import { GistData } from './types';
import './styles/GistEditor.css';

const MIN_PANE_WIDTH = 100;
const DEFAULT_EDITOR_WIDTH_PERCENT = 40;
const LS_EDITOR_WIDTH_KEY = 'splitView_editorWidthPercent'; // Key for localStorage
const LS_FILENAME_KEY = 'gistEditor_filename'; // Reuse key definition
const LS_CONTENT_KEY = 'gistEditor_content';   // Reuse key definition
const DEFAULT_GIST_URL = 'https://gist.github.com/nilayarya/9b0c8a66fbd6e7b8cd5223f3860ff248'; // Default Gist

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
  // --- Initialize shared state SYNCHRONOUSLY from localStorage ---
  // (Keep the useState initializer that reads localStorage first)
  const [gistData, setGistData] = useState<GistData>(() => {
    console.log("App: Initializing gistData state...");
    try {
      const savedFilename = localStorage.getItem(LS_FILENAME_KEY);
      const savedContent = localStorage.getItem(LS_CONTENT_KEY);

      if (savedFilename !== null && savedContent !== null) {
        console.log("App: Found saved data in localStorage.");
        return {
          description: '',
          files: [{ filename: savedFilename, content: savedContent }]
        };
      }
    } catch (error) {
      console.error("App: Error reading initial state from localStorage:", error);
    }
    console.log("App: No saved data found or error reading, using default empty state.");
    return {
      description: '',
      files: [{ filename: '', content: '' }]
    };
  });
  // -------------------------------------------------------------

  const [isDragging, setIsDragging] = useState(false);
  // Load editor width from localStorage on initial render
  const [editorWidth, setEditorWidth] = useState<number>(() => {
    try {
      const savedWidth = localStorage.getItem(LS_EDITOR_WIDTH_KEY);
      if (savedWidth !== null) {
        const parsedWidth = parseFloat(savedWidth);
        // Basic validation: ensure it's a number within a reasonable range (e.g., 5% to 95%)
        if (!isNaN(parsedWidth) && parsedWidth > 5 && parsedWidth < 95) {
          return parsedWidth;
        }
      }
    } catch (error) {
      console.error("Error reading editor width from localStorage:", error);
    }
    return DEFAULT_EDITOR_WIDTH_PERCENT; // Default value
  });

  const splitViewRef = useRef<HTMLDivElement>(null);
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  // --- Request Gist Data Logic (Moved up for use in useEffect) ---
  const requestGistData = useCallback(async (urlOrId: string): Promise<{ filename: string; content: string } | null> => {
    const gistId = extractGistId(urlOrId);

    if (!gistId) {
      alert('Invalid Gist URL or ID provided.');
      return null;
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
      return { filename, content };

    } catch (error) {
      console.error('Failed to request Gist data:', error);
      alert(`Failed to load Gist: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }, []); // Empty dependency array as it doesn't depend on component state/props

  // --- Effect to Load Default Gist (Adjusted - simplified check) ---
  useEffect(() => {
    const loadDefaultIfNeeded = async () => {
      // Check if the state (initialized from localStorage) is still empty
      const currentFile = gistData.files[0];
      if (!currentFile?.filename && !currentFile?.content) {
        console.log("App: Initial state is empty. Loading default Gist...");
        try {
          const defaultData = await requestGistData(DEFAULT_GIST_URL);
          if (defaultData) {
            console.log("App: Default Gist loaded:", defaultData);
            // Update App state AND save to localStorage using the handler
            handleContentChange(defaultData.filename, defaultData.content);
            console.log("App: Default Gist content set and saved via handleContentChange.");
          }
        } catch (error) {
           console.error("App: Error loading default Gist:", error);
           // Set error state
           handleContentChange('error.md', '# Error loading default content');
        }
      } else {
        console.log("App: Initial state loaded from localStorage, skipping default load.");
      }
    };

    loadDefaultIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // --- Centralized handler: Updates state AND saves to localStorage ---
  const handleContentChange = useCallback((newFilename: string, newContent: string) => {
    console.log("App: handleContentChange called.");
    // Update App state
    setGistData({ description: '', files: [{ filename: newFilename, content: newContent }] });

    // Save directly to localStorage
    try {
      console.log("App: Saving to localStorage via handleContentChange.");
      localStorage.setItem(LS_FILENAME_KEY, newFilename);
      localStorage.setItem(LS_CONTENT_KEY, newContent);
    } catch (error) {
      console.error("App: Error saving to localStorage:", error);
    }
  }, []); // No dependencies needed

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

    // Calculate min/max percentages based on fixed pixel width
    const minWidthPercent = (MIN_PANE_WIDTH / totalWidth) * 100;
    const maxWidthPercent = 100 - minWidthPercent; // Max width for editor is 100% minus min width for preview

    let newEditorPercent = (newEditorPixelWidth / totalWidth) * 100;

    // Clamp the value between min and max percentages
    newEditorPercent = Math.max(minWidthPercent, newEditorPercent);
    newEditorPercent = Math.min(maxWidthPercent, newEditorPercent); // Use maxWidthPercent

    setEditorWidth(newEditorPercent);

  }, [isDragging]); // Removed editorWidth dependency

  // Save width to localStorage when dragging stops
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // Save the current editorWidth to localStorage
      try {
        console.log(`Saving editor width to localStorage: ${editorWidth}%`);
        // Use editorWidth directly from state, as it was updated during mouseMove
        localStorage.setItem(LS_EDITOR_WIDTH_KEY, editorWidth.toString());
      } catch (error) {
        console.error("Error saving editor width to localStorage:", error);
      }
    }
  }, [isDragging, editorWidth]); // Add editorWidth dependency here

  // Effect to add/remove global listeners for dragging
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
    requestAnimationFrame(() => {
        window.print();
    });
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      console.log("After print event triggered");
      setIsPreparingPrint(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

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
          {/* Pass state and the updated handler down */}
          <GistEditor
            filename={gistData.files[0]?.filename ?? ''} // Pass current filename
            content={gistData.files[0]?.content ?? ''}   // Pass current content
            onContentChange={handleContentChange} // Pass the combined update/save handler
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