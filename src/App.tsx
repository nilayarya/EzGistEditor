import React, { useState, useCallback, useRef, useEffect } from 'react';
import GistEditor from './components/GistEditor';
import GistPreview from './components/GistPreview';
import { GistData } from './types';
import './styles/GistEditor.css';

const MIN_PANE_WIDTH = 100;

const App: React.FC = () => {
  const [gistData, setGistData] = useState<GistData>({
    description: '',
    files: [{
      filename: '',
      content: ''
    }]
  });

  const [isDragging, setIsDragging] = useState(false);
  const [editorWidth, setEditorWidth] = useState(50);
  const splitViewRef = useRef<HTMLDivElement>(null);

  const handleContentChange = (description: string, filename: string, content: string) => {
    setGistData({
      description,
      files: [{
        filename,
        content
      }]
    });
  };

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
    if (isDragging) {
      setIsDragging(false);
    }
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

  return (
    <div className="app">
      <div className="split-view" ref={splitViewRef}>
        <div
          className="editor-pane"
          style={{ flexBasis: `${editorWidth}%` }}
        >
          <GistEditor 
            data={gistData}
            onContentChange={handleContentChange}
          />
        </div>
        <div
          className="divider"
          onMouseDown={handleMouseDown}
          title="Drag to resize"
        />
        <div
          className="preview-pane"
          style={{ flexBasis: `${100 - editorWidth}%` }}
        >
          <GistPreview data={gistData} />
        </div>
      </div>
    </div>
  );
};

export default App; 