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
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

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

  const handleConfirmPrint = () => {
    setIsPreparingPrint(true);
    setTimeout(() => {
      window.print();
    }, 0);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      console.log("After print event triggered");
      setIsPreparingPrint(false);
    };

    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
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
          <GistEditor 
            data={gistData}
            onContentChange={handleContentChange}
            onConfirmPrint={handleConfirmPrint}
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
          <GistPreview data={gistData} />
        </div>
      </div>
    </div>
  );
};

export default App; 