import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import '../styles/MonacoEditor.css';

const MonacoEditor = ({ 
  language = 'typescript',
  theme = 'vs-dark',
  value = '',
  onChange,
  readOnly = false,
  height = '100%'
}) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Set up TermIntel v2 Navy Blue theme
    monaco.editor.defineTheme('termintel-navy', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // TypeScript/JavaScript syntax
        { token: 'comment', foreground: '304a65', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff375f' },
        { token: 'keyword.control', foreground: 'ff375f' },
        { token: 'keyword.operator', foreground: 'ff9500' },
        { token: 'keyword.other', foreground: 'ff375f' },
        { token: 'string', foreground: 'ffd60a' },
        { token: 'string.template', foreground: 'ffd60a' },
        { token: 'string.regexp', foreground: 'ffd60a' },
        { token: 'number', foreground: 'bf5af2' },
        { token: 'number.float', foreground: 'bf5af2' },
        { token: 'type', foreground: '00e676' },
        { token: 'type.identifier', foreground: '00e676' },
        { token: 'class', foreground: '00e676' },
        { token: 'function', foreground: '5ac8fa' },
        { token: 'function.method', foreground: '5ac8fa' },
        { token: 'variable', foreground: '1a9fff' },
        { token: 'variable.parameter', foreground: '4fc3f7' },
        { token: 'variable.other', foreground: '1a9fff' },
        { token: 'property', foreground: '4fc3f7' },
        { token: 'attribute', foreground: 'ffd60a' },
        { token: 'tag', foreground: 'ff375f' },
        { token: 'delimiter', foreground: '6a8aaa' },
        { token: 'delimiter.bracket', foreground: 'bdd0e8' },
        { token: 'operator', foreground: 'ff9500' },
        
        // Shell script syntax
        { token: 'shell.comment', foreground: '304a65', fontStyle: 'italic' },
        { token: 'shell.keyword', foreground: 'ff375f' },
        { token: 'shell.string', foreground: 'ffd60a' },
        { token: 'shell.variable', foreground: '1a9fff' },
        { token: 'shell.command', foreground: '5ac8fa' },
        { token: 'shell.option', foreground: '4fc3f7' },
        { token: 'shell.param', foreground: 'bf5af2' },
      ],
      colors: {
        'editor.background': '#000000',
        'editor.foreground': '#bdd0e8',
        'editorCursor.foreground': '#1a9fff',
        'editor.lineHighlightBackground': '#0d1b2a',
        'editorLineNumber.foreground': '#304a65',
        'editorLineNumber.activeForeground': '#1a9fff',
        'editor.selectionBackground': '#1a9fff40',
        'editor.inactiveSelectionBackground': '#1a9fff20',
        'editorIndentGuide.background': '#162338',
        'editorIndentGuide.activeBackground': '#1e3352',
        'editorWhitespace.foreground': '#162338',
        'editorBracketMatch.background': '#1a9fff20',
        'editorBracketMatch.border': '#1a9fff',
        'editorRuler.foreground': '#162338',
        'editorCodeLens.foreground': '#304a65',
        'editorOverviewRuler.border': '#162338',
      }
    });
    
    monaco.editor.setTheme('termintel-navy');
    
    // Configure editor for terminal-like feel
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      cursorBlinking: 'solid',
      cursorStyle: 'line',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      automaticLayout: true,
      padding: { top: 10 },
      cursorWidth: 2,
      renderLineHighlight: 'line',
      smoothScrolling: true,
      bracketPairColorization: { enabled: true },
      guides: {
        indentation: true,
        bracketPairs: true,
        bracketPairsHorizontal: true,
        highlightActiveIndentation: true,
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showClasses: true,
        showFunctions: true,
        showVariables: true,
        showConstants: true,
        showInterfaces: true,
        showProperties: true,
        showEvents: true,
        showOperators: true,
        showUnits: true,
        showValues: true,
        showColors: true,
        showFiles: true,
        showReferences: true,
        showFolders: true,
        showTypeParameters: true,
        showWords: true,
      },
    });
  };

  const handleEditorChange = (value) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="monaco-editor-container">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="termintel-navy"
        options={{
          readOnly: readOnly,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          cursorBlinking: 'solid',
          cursorStyle: 'line',
          lineNumbers: 'on',
          renderLineHighlight: 'all',
          wordWrap: 'on',
          padding: { top: 10 },
          cursorWidth: 2,
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
        }}
      />
    </div>
  );
};

export default MonacoEditor;
