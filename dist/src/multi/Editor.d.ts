import React from 'react';
import * as monacoType from 'monaco-editor';
export interface filelist {
    [key: string]: string | null;
}
export interface MultiEditorIProps {
    ideConfig?: {
        disableFileOps?: boolean;
        disableEslint?: boolean;
        disableSetting?: boolean;
        disablePrettier?: boolean;
    };
    defaultPath?: string;
    defaultTheme?: string;
    onPathChange?: (key: string) => void;
    onValueChange?: (v: string) => void;
    onFileChange?: (key: string, value: string) => void;
    onFileSave?: (key: string, value: string) => void;
    defaultFiles?: filelist;
    options: monacoType.editor.IStandaloneEditorConstructionOptions;
}
export interface MultiRefType {
    getValue: (path: string) => string | null;
    getAllValue: () => filelist;
    getSupportThemes: () => Array<string>;
    setTheme: (name: string) => void;
    refresh: (files: filelist, path?: string) => void;
}
export declare const MultiEditorComp: React.ForwardRefExoticComponent<MultiEditorIProps & React.RefAttributes<MultiRefType>>;
export default MultiEditorComp;
