import React from 'react';

import { SimpleTiptapEditor } from '../SimpleTiptapEditor';

interface TiptapWordEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  placeholder?: string;
}

const TiptapWordEditor: React.FC<TiptapWordEditorProps> = ({
  initialContent = '',
  onContentChange,
  placeholder = 'Start typing...',
}) => {
  return (
    <SimpleTiptapEditor 
      initialContent={initialContent}
      onContentChange={onContentChange}
      placeholder={placeholder}
    />
  );
};

export default TiptapWordEditor;
