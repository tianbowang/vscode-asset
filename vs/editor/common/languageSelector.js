(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/glob", "vs/base/common/path"], function (require, exports, glob_1, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.score = void 0;
    function score(selector, candidateUri, candidateLanguage, candidateIsSynchronized, candidateNotebookUri, candidateNotebookType) {
        if (Array.isArray(selector)) {
            // array -> take max individual value
            let ret = 0;
            for (const filter of selector) {
                const value = score(filter, candidateUri, candidateLanguage, candidateIsSynchronized, candidateNotebookUri, candidateNotebookType);
                if (value === 10) {
                    return value; // already at the highest
                }
                if (value > ret) {
                    ret = value;
                }
            }
            return ret;
        }
        else if (typeof selector === 'string') {
            if (!candidateIsSynchronized) {
                return 0;
            }
            // short-hand notion, desugars to
            // 'fooLang' -> { language: 'fooLang'}
            // '*' -> { language: '*' }
            if (selector === '*') {
                return 5;
            }
            else if (selector === candidateLanguage) {
                return 10;
            }
            else {
                return 0;
            }
        }
        else if (selector) {
            // filter -> select accordingly, use defaults for scheme
            const { language, pattern, scheme, hasAccessToAllModels, notebookType } = selector; // TODO: microsoft/TypeScript#42768
            if (!candidateIsSynchronized && !hasAccessToAllModels) {
                return 0;
            }
            // selector targets a notebook -> use the notebook uri instead
            // of the "normal" document uri.
            if (notebookType && candidateNotebookUri) {
                candidateUri = candidateNotebookUri;
            }
            let ret = 0;
            if (scheme) {
                if (scheme === candidateUri.scheme) {
                    ret = 10;
                }
                else if (scheme === '*') {
                    ret = 5;
                }
                else {
                    return 0;
                }
            }
            if (language) {
                if (language === candidateLanguage) {
                    ret = 10;
                }
                else if (language === '*') {
                    ret = Math.max(ret, 5);
                }
                else {
                    return 0;
                }
            }
            if (notebookType) {
                if (notebookType === candidateNotebookType) {
                    ret = 10;
                }
                else if (notebookType === '*' && candidateNotebookType !== undefined) {
                    ret = Math.max(ret, 5);
                }
                else {
                    return 0;
                }
            }
            if (pattern) {
                let normalizedPattern;
                if (typeof pattern === 'string') {
                    normalizedPattern = pattern;
                }
                else {
                    // Since this pattern has a `base` property, we need
                    // to normalize this path first before passing it on
                    // because we will compare it against `Uri.fsPath`
                    // which uses platform specific separators.
                    // Refs: https://github.com/microsoft/vscode/issues/99938
                    normalizedPattern = { ...pattern, base: (0, path_1.normalize)(pattern.base) };
                }
                if (normalizedPattern === candidateUri.fsPath || (0, glob_1.match)(normalizedPattern, candidateUri.fsPath)) {
                    ret = 10;
                }
                else {
                    return 0;
                }
            }
            return ret;
        }
        else {
            return 0;
        }
    }
    exports.score = score;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2VTZWxlY3Rvci5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2NvbW1vbi9sYW5ndWFnZVNlbGVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQXlCaEcsU0FBZ0IsS0FBSyxDQUFDLFFBQXNDLEVBQUUsWUFBaUIsRUFBRSxpQkFBeUIsRUFBRSx1QkFBZ0MsRUFBRSxvQkFBcUMsRUFBRSxxQkFBeUM7UUFFN04sSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDN0IscUNBQXFDO1lBQ3JDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQztZQUNaLEtBQUssTUFBTSxNQUFNLElBQUksUUFBUSxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLHVCQUF1QixFQUFFLG9CQUFvQixFQUFFLHFCQUFxQixDQUFDLENBQUM7Z0JBQ25JLElBQUksS0FBSyxLQUFLLEVBQUUsRUFBRSxDQUFDO29CQUNsQixPQUFPLEtBQUssQ0FBQyxDQUFDLHlCQUF5QjtnQkFDeEMsQ0FBQztnQkFDRCxJQUFJLEtBQUssR0FBRyxHQUFHLEVBQUUsQ0FBQztvQkFDakIsR0FBRyxHQUFHLEtBQUssQ0FBQztnQkFDYixDQUFDO1lBQ0YsQ0FBQztZQUNELE9BQU8sR0FBRyxDQUFDO1FBRVosQ0FBQzthQUFNLElBQUksT0FBTyxRQUFRLEtBQUssUUFBUSxFQUFFLENBQUM7WUFFekMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7Z0JBQzlCLE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztZQUVELGlDQUFpQztZQUNqQyxzQ0FBc0M7WUFDdEMsMkJBQTJCO1lBQzNCLElBQUksUUFBUSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUN0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
//# sourceURL=../../../vs/editor/common/languageSelector.js
})