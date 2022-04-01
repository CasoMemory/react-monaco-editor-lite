import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import * as monacoType from 'monaco-editor';
import { initFiles, worker } from '@utils';
import { configTheme } from '@utils/initEditor';

export function useDragLine(num: number): [
    {
        width: string,
    },
    (e: any) => void,
    (e: any) => void,
    (e: any) => void,
] {
    const [filelistWidth, setFilelistWidth] = useState(num);

    const dragStartRef = useRef<{
        pageX: number,
        width: number,
        start: boolean,
    }>({
        pageX: 0,
        width: 0,
        start: false,
    });
    const handleMoveStart = useCallback((e) => {
        dragStartRef.current = {
            pageX: e.pageX,
            width: filelistWidth,
            start: true
        };
    }, [filelistWidth]);

    const handleMove = useCallback((e) => {
        if (dragStartRef.current.start) {
            setFilelistWidth(dragStartRef.current.width + (e.pageX - dragStartRef.current.pageX));
        }
    }, []);

    const handleMoveEnd = useCallback((e) => {
        dragStartRef.current = {
            pageX: e.pageX,
            width: 0,
            start: false,
        };
    }, []);

    const styles = useMemo(() => ({
        width: `${filelistWidth}px`,
    }), [filelistWidth]);

    return [
        styles,
        handleMoveStart,
        handleMove,
        handleMoveEnd,
    ]
}

export function usePrettier(editorRef: React.MutableRefObject<monacoType.editor.IStandaloneCodeEditor | null>): [
    React.MutableRefObject<boolean>,
    (e: any) => void,
    () => Promise<void> | undefined,
] {
    const autoPrettierRef = useRef<boolean>(true);

    const handleSetAutoPrettier = useCallback((e) => {
        autoPrettierRef.current = e.target.checked;
    }, []);

    const handleFromat = useCallback(() => {
        return editorRef.current?.getAction('editor.action.formatDocument').run();
    }, [editorRef]);

    return [
        autoPrettierRef,
        handleSetAutoPrettier,
        handleFromat,
    ]
}

export function useInit(
    filesRef: React.MutableRefObject<{
        [key: string]: string | null,
    }>,
    editorRef: React.MutableRefObject<monacoType.editor.IStandaloneCodeEditor | null>,
    options: monacoType.editor.IStandaloneEditorConstructionOptions) {
    useEffect(() => {
        initFiles(filesRef.current);
    }, [filesRef]);

    useEffect(() => {
        if (editorRef.current) {
            if (options.theme) {
                configTheme(options.theme);
            }
            editorRef.current.updateOptions(options);
        }
    }, [options, editorRef]);

    useEffect(() => {
        worker.then(res => res.onmessage = function (event) {
            const { markers, version } = event.data;
            const model = editorRef.current?.getModel();
            if (model && model.getVersionId() === version) {
                window.monaco.editor.setModelMarkers(model, 'eslint', markers);
            }
        });
    }, [editorRef]);
}

export function useEditor(
    editorRef: React.MutableRefObject<monacoType.editor.IStandaloneCodeEditor | null>,
    optionsRef: React.MutableRefObject<monacoType.editor.IEditorConstructionOptions>,
    openOrFocusPath: (path: string) => void,
) {
    const editorNodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 创建editor 实例
        editorRef.current = window.monaco.editor.create(editorNodeRef.current!, {
            ...optionsRef.current,
            model: null,
        });

        const editorService = (editorRef.current as any)._codeEditorService;
        const openEditorBase = editorService.openCodeEditor.bind(editorService);
        editorService.openCodeEditor = async (input: any, source: any, sideBySide: any) => {
            const result = await openEditorBase(input, source);
            if (result === null) {
                const fullPath = input.resource.path
                source.setModel(window.monaco.editor.getModel(input.resource));
                openOrFocusPath(fullPath);
                source.setSelection(input.options.selection);
                source.revealLine(input.options.selection.startLineNumber);
            }
            return result; // always return the base result
        };

        return () => {
            // 销毁实例
            if (editorRef.current) {
                editorRef.current.dispose();
            }
        }
    }, [openOrFocusPath, editorRef, optionsRef]);

    return editorNodeRef;
}

export const useVarRef = (param: any) => {
    const varRef = useRef<any>(param);

    useEffect(() => {
        varRef.current = param;
    }, [param]);

    return varRef;
}
