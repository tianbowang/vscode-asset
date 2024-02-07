/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CSSPluginUtilities = exports.rewriteUrls = exports.getInlinedResources = exports.writeFile = exports.write = exports.load = void 0;
    const nodeReq = (module) => {
        if (typeof require.__$__nodeRequire === 'function') {
            return require.__$__nodeRequire(module);
        }
        return undefined;
    };
    const fs = nodeReq('fs');
    const path = nodeReq('path');
    let inlineResources = false;
    let inlineResourcesLimit = 5000;
    const contentsMap = {};
    const pathMap = {};
    const entryPoints = {};
    const inlinedResources = [];
    /**
     * Invoked by the loader at build-time
     */
    function load(name, req, load, config) {
        if (!fs) {
            throw new Error(`Cannot load files without 'fs'!`);
        }
        config = config || {};
        const myConfig = (config['vs/css'] || {});
        inlineResources = (typeof myConfig.inlineResources === 'undefined' ? false : myConfig.inlineResources);
        inlineResourcesLimit = (myConfig.inlineResourcesLimit || 5000);
        const cssUrl = req.toUrl(name + '.css');
        let contents = fs.readFileSync(cssUrl, 'utf8');
        if (contents.charCodeAt(0) === 65279 /* BOM */) {
            // Remove BOM
            contents = contents.substring(1);
        }
        if (config.isBuild) {
            contentsMap[name] = contents;
            pathMap[name] = cssUrl;
        }
        load({});
    }
    exports.load = load;
    /**
     * Invoked by the loader at build-time
     */
    function write(pluginName, moduleName, write) {
        const entryPoint = write.getEntryPoint();
        entryPoints[entryPoint] = entryPoints[entryPoint] || [];
        entryPoints[entryPoint].push({
            moduleName: moduleName,
            contents: contentsMap[moduleName],
            fsPath: pathMap[moduleName],
        });
        write.asModule(pluginName + '!' + moduleName, 'define([\'vs/css!' + entryPoint + '\'], {});');
    }
    exports.write = write;
    /**
     * Invoked by the loader at build-time
     */
    function writeFile(pluginName, moduleName, req, write, config) {
        if (entryPoints && entryPoints.hasOwnProperty(moduleName)) {
            const fileName = req.toUrl(moduleName + '.css');
            const contents = [
                '/*---------------------------------------------------------',
                ' * Copyright (c) Microsoft Corporation. All rights reserved.',
                ' *--------------------------------------------------------*/'
            ], entries = entryPoints[moduleName];
            for (let i = 0; i < entries.length; i++) {
                if (inlineResources) {
                    contents.push(rewriteOrInlineUrls(entries[i].fsPath, entries[i].moduleName, moduleName, entries[i].contents, inlineResources === 'base64', inlineResourcesLimit));
                }
                else {
                    contents.push(rewriteUrls(entries[i].moduleName, moduleName, entries[i].contents));
                }
            }
            write(fileName, contents.join('\r\n'));
        }
    }
    exports.writeFile = writeFile;
    function getInlinedResources() {
        return inlinedResources || [];
    }
    exports.getInlinedResources = getInlinedResources;
    function rewriteOrInlineUrls(originalFileFSPath, originalFile, newFile, contents, forceBase64, inlineByteLimit) {
        if (!fs || !path) {
            throw new Error(`Cannot rewrite or inline urls without 'fs' or 'path'!`);
        }
        return CSSPluginUtilities.replaceURL(contents, (url) => {
            if (/\.(svg|png)$/.test(url)) {
                const fsPath = path.join(path.dirname(originalFileFSPath), url);
                const fileContents = fs.readFileSync(fsPath);
                if (fileContents.length < inlineByteLimit) {
                    const normalizedFSPath = fsPath.replace(/\\/g, '/');
                    inlinedResources.push(normalizedFSPath);
                    const MIME = /\.svg$/.test(url) ? 'image/svg+xml' : 'image/png';
                    let DATA = ';base64,' + fileContents.toString('base64');
                    if (!forceBase64 && /\.svg$/.test(url)) {
                        // .svg => url encode as explained at https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
                        const newText = fileContents.toString()
                            .replace(/"/g, '\'')
                            .replace(/%/g, '%25')
                            .replace(/</g, '%3C')
                            .replace(/>/g, '%3E')
                            .replace(/&/g, '%26')
                            .replace(/#/g, '%23')
                            .replace(/\s+/g, ' ');
                        const encodedData = ',' + newText;
                        if (encodedData.length < DATA.length) {
                            DATA = encodedData;
                        }
                    }
                    return '"data:' + MIME + DATA + '"';
                }
            }
            const absoluteUrl = CSSPluginUtilities.joinPaths(CSSPluginUtilities.pathOf(originalFile), url);
            return CSSPluginUtilities.relativePath(newFile, absoluteUrl);
        });
    }
    function rewriteUrls(originalFile, newFile, contents) {
        return CSSPluginUtilities.replaceURL(contents, (url) => {
            const absoluteUrl = CSSPluginUtilities.joinPaths(CSSPluginUtilities.pathOf(originalFile), url);
            return CSSPluginUtilities.relativePath(newFile, absoluteUrl);
        });
    }
    exports.rewriteUrls = rewriteUrls;
    class CSSPluginUtilities {
        static startsWith(haystack, needle) {
            return haystack.length >= needle.length && haystack.substr(0, needle.length) === needle;
        }
        /**
         * Find the path of a file.
         */
        static pathOf(filename) {
            const lastSlash = filename.lastIndexOf('/');
            if (lastSlash !== -1) {
                return filename.substr(0, lastSlash + 1);
            }
            else {
                return '';
            }
        }
        /**
         * A conceptual a + b for paths.
         * Takes into account if `a` contains a protocol.
         * Also normalizes the result: e.g.: a/b/ + ../c => a/c
         */
        static joinPaths(a, b) {
            function findSlashIndexAfterPrefix(haystack, prefix) {
                if (CSSPluginUtilities.startsWith(haystack, prefix)) {
                    return Math.max(prefix.length, haystack.indexOf('/', prefix.length));
                }
                return 0;
            }
            let aPathStartIndex = 0;
            aPathStartIndex = aPathStartIndex || findSlashIndexAfterPrefix(a, '//');
            aPathStartIndex = aPathStartIndex || findSlashIndexAfterPrefix(a, 'http://');
            aPathStartIndex = aPathStartIndex || findSlashIndexAfterPrefix(a, 'https://');
            function pushPiece(pieces, piece) {
                if (piece === './') {
                    // Ignore
                    return;
                }
                if (piece === '../') {
                    const prevPiece = (pieces.length > 0 ? pieces[pieces.length - 1] : null);
                    if (prevPiece && prevPiece === '/') {
                        // Ignore
                        return;
                    }
                    if (prevPiece && prevPiece !== '../') {
                        // Pop
                        pieces.pop();
                        return;
                    }
                }
                // Push
                pieces.push(piece);
            }
            function push(pieces, path) {
                while (path.length > 0) {
                    const slashIndex = path.indexOf('/');
                    const piece = (slashIndex >= 0 ? path.substring(0, slashIndex + 1) : path);
                    path = (slashIndex >= 0 ? path.substring(slashIndex + 1) : '');
                    pushPiece(pieces, piece);
                }
            }
            let pieces = [];
            push(pieces, a.substr(aPathStartIndex));
            if (b.length > 0 && b.charAt(0) === '/') {
                pieces = [];
            }
            push(pieces, b);
            return a.substring(0, aPathStartIndex) + pieces.join('');
        }
        static commonPrefix(str1, str2) {
            const len = Math.min(str1.length, str2.length);
            for (let i = 0; i < len; i++) {
                if (str1.charCodeAt(i) !== str2.charCodeAt(i)) {
                    return str1.substring(0, i);
                }
            }
            return str1.substring(0, len);
        }
        static commonFolderPrefix(fromPath, toPath) {
            const prefix = CSSPluginUtilities.commonPrefix(fromPath, toPath);
            const slashIndex = prefix.lastIndexOf('/');
            if (slashIndex === -1) {
                return '';
            }
            return prefix.substring(0, slashIndex + 1);
        }
        static relativePath(fromPath, toPath) {
            if (CSSPluginUtilities.startsWith(toPath, '/') || CSSPluginUtilities.startsWith(toPath, 'http://') || CSSPluginUtilities.startsWith(toPath, 'https://')) {
                return toPath;
            }
            // Ignore common folder prefix
            const prefix = CSSPluginUtilities.commonFolderPrefix(fromPath, toPath);
            fromPath = fromPath.substr(prefix.length);
            toPath = toPath.substr(prefix.length);
            const upCount = fromPath.split('/').length;
            let result = '';
            for (let i = 1; i < upCount; i++) {
                result += '../';
            }
            return result + toPath;
        }
        static replaceURL(contents, replacer) {
            // Use ")" as the terminator as quotes are oftentimes not used at all
            return contents.replace(/url\(\s*([^\)]+)\s*\)?/g, (_, ...matches) => {
                let url = matches[0];
                // Eliminate starting quotes (the initial whitespace is not captured)
                if (url.charAt(0) === '"' || url.charAt(0) === '\'') {
                    url = url.substring(1);
                }
                // The ending whitespace is captured
                while (url.length > 0 && (url.charAt(url.length - 1) === ' ' || url.charAt(url.length - 1) === '\t')) {
                    url = url.substring(0, url.length - 1);
                }
                // Eliminate ending quotes
                if (url.charAt(url.length - 1) === '"' || url.charAt(url.length - 1) === '\'') {
                    url = url.substring(0, url.length - 1);
                }
                if (!CSSPluginUtilities.startsWith(url, 'data:') && !CSSPluginUtilities.startsWith(url, 'http://') && !CSSPluginUtilities.startsWith(url, 'https://')) {
                    url = replacer(url);
                }
                return 'url(' + url + ')';
            });
        }
    }
    exports.CSSPluginUtilities = CSSPluginUtilities;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3NzLmJ1aWxkLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9jc3MuYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNEJoRyxNQUFNLE9BQU8sR0FBRyxDQUFJLE1BQWMsRUFBaUIsRUFBRTtRQUNwRCxJQUFJLE9BQWEsT0FBUSxDQUFDLGdCQUFnQixLQUFLLFVBQVUsRUFBRSxDQUFDO1lBQzNELE9BQWEsT0FBUSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELENBQUM7UUFDRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDLENBQUM7SUFFRixNQUFNLEVBQUUsR0FBRyxPQUFPLENBQVUsSUFBSSxDQUFDLENBQUM7SUFDbEMsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFZLE1BQU0sQ0FBQyxDQUFDO0lBRXhDLElBQUksZUFBZSxHQUF1QixLQUFLLENBQUM7SUFDaEQsSUFBSSxvQkFBb0IsR0FBVyxJQUFJLENBQUM7SUFFeEMsTUFBTSxXQUFXLEdBQXFDLEVBQUUsQ0FBQztJQUN6RCxNQUFNLE9BQU8sR0FBcUMsRUFBRSxDQUFDO0lBQ3JELE1BQU0sV0FBVyxHQUFtRCxFQUFFLENBQUM7SUFDdkUsTUFBTSxnQkFBZ0IsR0FBYSxFQUFFLENBQUM7SUFFdEM7O09BRUc7SUFDSCxTQUFnQixJQUFJLENBQUMsSUFBWSxFQUFFLEdBQStCLEVBQUUsSUFBbUMsRUFBRSxNQUF1QztRQUMvSSxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDVCxNQUFNLElBQUksS0FBSyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUNELE1BQU0sR0FBRyxNQUFNLElBQUksRUFBRSxDQUFDO1FBQ3RCLE1BQU0sUUFBUSxHQUFxQixDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUM1RCxlQUFlLEdBQUcsQ0FBQyxPQUFPLFFBQVEsQ0FBQyxlQUFlLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUN2RyxvQkFBb0IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsSUFBSSxJQUFJLENBQUMsQ0FBQztRQUMvRCxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQztRQUN4QyxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztRQUMvQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hELGFBQWE7WUFDYixRQUFRLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsSUFBSSxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDcEIsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDO1FBQ3hCLENBQUM7UUFDRCxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDVixDQUFDO0lBbkJELG9CQW1CQztJQUVEOztPQUVHO0lBQ0gsU0FBZ0IsS0FBSyxDQUFDLFVBQWtCLEVBQUUsVUFBa0IsRUFBRSxLQUFxQztRQUNsRyxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFekMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDeEQsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUM1QixVQUFVLEVBQUUsVUFBVTtZQUN0QixRQUFRLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQztZQUNqQyxNQUFNLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQztTQUMzQixDQUFDLENBQUM7UUFFSCxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsR0FBRyxHQUFHLEdBQUcsVUFBVSxFQUMzQyxtQkFBbUIsR0FBRyxVQUFVLEdBQUcsV0FBVyxDQUM5QyxDQUFDO0lBQ0gsQ0FBQztJQWJELHNCQWFDO0lBRUQ7O09BRUc7SUFDSCxTQUFnQixTQUFTLENBQUMsVUFBa0IsRUFBRSxVQUFrQixFQUFFLEdBQStCLEVBQUUsS0FBeUMsRUFBRSxNQUF1QztRQUNwTCxJQUFJLFdBQVcsSUFBSSxXQUFXLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7WUFDM0QsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDaEQsTUFBTSxRQUFRLEdBQUc7Z0JBQ2hCLDZEQUE2RDtnQkFDN0QsOERBQThEO2dCQUM5RCw4REFBOEQ7YUFDOUQsRUFDQSxPQUFPLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ25DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQ3pDLElBQUksZUFBZSxFQUFFLENBQUM7b0JBQ3JCLFFBQVEsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLGVBQWUsS0FBSyxRQUFRLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO2dCQUNuSyxDQUFDO3FCQUFNLENBQUM7b0JBQ1AsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BGLENBQUM7WUFDRixDQUFDO1lBQ0QsS0FBSyxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDeEMsQ0FBQztJQUNGLENBQUM7SUFsQkQsOEJBa0JDO0lBRUQsU0FBZ0IsbUJBQW1CO1FBQ2xDLE9BQU8sZ0JBQWdCLElBQUksRUFBRSxDQUFDO0lBQy9CLENBQUM7SUFGRCxrREFFQztJQUVELFNBQVMsbUJBQW1CLENBQUMsa0JBQTBCLEVBQUUsWUFBb0IsRUFBRSxPQUFlLEVBQUUsUUFBZ0IsRUFBRSxXQUFvQixFQUFFLGVBQXVCO1FBQzlKLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLHVEQUF1RCxDQUFDLENBQUM7UUFDMUUsQ0FBQztRQUNELE9BQU8sa0JBQWtCLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ3RELElBQUksY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDaEUsTUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFFN0MsSUFBSSxZQUFZLENBQUMsTUFBTSxHQUFHLGVBQWUsRUFBRSxDQUFDO29CQUMzQyxNQUFNLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO29CQUNwRCxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFFeEMsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUM7b0JBQ2hFLElBQUksSUFBSSxHQUFHLFVBQVUsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO29CQUV4RCxJQUFJLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDeEMsK0ZBQStGO3dCQUMvRixNQUFNLE9BQU8sR0FBRyxZQUFZLENBQUMsUUFBUSxFQUFFOzZCQUNyQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQzs2QkFDbkIsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUM7NkJBQ3BCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDOzZCQUNwQixPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQzs2QkFDcEIsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUM7NkJBQ3BCLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDOzZCQUNwQixPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO3dCQUN2QixNQUFNLFdBQVcsR0FBRyxHQUFHLEdBQUcsT0FBTyxDQUFDO3dCQUNsQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDOzRCQUN0QyxJQUFJLEdBQUcsV0FBVyxDQUFDO3dCQUNwQixDQUFDO29CQUNGLENBQUM7b0JBQ0QsT0FBTyxRQUFRLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUM7Z0JBQ3JDLENBQUM7WUFDRixDQUFDO1lBRUQsTUFBTSxXQUFXLEdBQUcsa0JBQWtCLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUMvRixPQUFPLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDOUQsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBRUQsU0FBZ0IsV0FBVyxDQUFDLFlBQW9CLEVBQUUsT0FBZSxFQUFFLFFBQWdCO1FBQ2xGLE9BQU8sa0JBQWtCLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ3RELE1BQU0sV0FBVyxHQUFHLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDL0YsT0FBTyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQzlELENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUxELGtDQUtDO0lBRUQsTUFBYSxrQkFBa0I7UUFFdkIsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFnQixFQUFFLE1BQWM7WUFDeEQsT0FBTyxRQUFRLENBQUMsTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLE1BQU0sQ0FBQztRQUN6RixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQWdCO1lBQ3BDLE1BQU0sU0FBUyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUMsSUFBSSxTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDdEIsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDMUMsQ0FBQztpQkFBTSxDQUFDO2dCQUNQLE9BQU8sRUFBRSxDQUFDO1lBQ1gsQ0FBQztRQUNGLENBQUM7UUFFRDs7OztXQUlHO1FBQ0ksTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFTLEVBQUUsQ0FBUztZQUUzQyxTQUFTLHlCQUF5QixDQUFDLFFBQWdCLEVBQUUsTUFBYztnQkFDbEUsSUFBSSxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUM7b0JBQ3JELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN0RSxDQUFDO2dCQUNELE9BQU8sQ0FBQyxDQUFDO1lBQ1YsQ0FBQztZQUVELElBQUksZUFBZSxHQUFHLENBQUMsQ0FBQztZQUN4QixlQUFlLEdBQUcsZUFBZSxJQUFJLHlCQUF5QixDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4RSxlQUFlLEdBQUcsZUFBZSxJQUFJLHlCQUF5QixDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM3RSxlQUFlLEdBQUcsZUFBZSxJQUFJLHlCQUF5QixDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUU5RSxTQUFTLFNBQVMsQ0FBQyxNQUFnQixFQUFFLEtBQWE7Z0JBQ2pELElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO29CQUNwQixTQUFTO29CQUNULE9BQU87Z0JBQ1IsQ0FBQztnQkFDRCxJQUFJLEtBQUssS0FBSyxLQUFLLEVBQUUsQ0FBQztvQkFDckIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN6RSxJQUFJLFNBQVMsSUFBSSxTQUFTLEtBQUssR0FBRyxFQUFFLENBQUM7d0JBQ3BDLFNBQVM7d0JBQ1QsT0FBTztvQkFDUixDQUFDO29CQUNELElBQUksU0FBUyxJQUFJLFNBQVMsS0FBSyxLQUFLLEVBQUUsQ0FBQzt3QkFDdEMsTUFBTTt3QkFDTixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7d0JBQ2IsT0FBTztvQkFDUixDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsT0FBTztnQkFDUCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BCLENBQUM7WUFFRCxTQUFTLElBQUksQ0FBQyxNQUFnQixFQUFFLElBQVk7Z0JBQzNDLE9BQU8sSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDeEIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDckMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUMzRSxJQUFJLEdBQUcsQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQy9ELFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzFCLENBQUM7WUFDRixDQUFDO1lBRUQsSUFBSSxNQUFNLEdBQWEsRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLElBQUksQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztnQkFDekMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNiLENBQUM7WUFDRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWhCLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsZUFBZSxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFZLEVBQUUsSUFBWTtZQUNwRCxNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDOUIsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDL0MsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDN0IsQ0FBQztZQUNGLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLENBQUM7UUFFTSxNQUFNLENBQUMsa0JBQWtCLENBQUMsUUFBZ0IsRUFBRSxNQUFjO1lBQ2hFLE1BQU0sTUFBTSxHQUFHLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakUsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMzQyxJQUFJLFVBQVUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUN2QixPQUFPLEVBQUUsQ0FBQztZQUNYLENBQUM7WUFDRCxPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUM1QyxDQUFDO1FBRU0sTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFnQixFQUFFLE1BQWM7WUFDMUQsSUFBSSxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLElBQUksa0JBQWtCLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDO2dCQUN6SixPQUFPLE1BQU0sQ0FBQztZQUNmLENBQUM7WUFFRCw4QkFBOEI7WUFDOUIsTUFBTSxNQUFNLEdBQUcsa0JBQWtCLENBQUMsa0JBQWtCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZFLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMxQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFFdEMsTUFBTSxPQUFPLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFDM0MsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ2hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDbEMsTUFBTSxJQUFJLEtBQUssQ0FBQztZQUNqQixDQUFDO1lBQ0QsT0FBTyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3hCLENBQUM7UUFFTSxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQWdCLEVBQUUsUUFBaUM7WUFDM0UscUVBQXFFO1lBQ3JFLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLENBQVMsRUFBRSxHQUFHLE9BQWlCLEVBQUUsRUFBRTtnQkFDdEYsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQixxRUFBcUU7Z0JBQ3JFLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDckQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLENBQUM7Z0JBQ0Qsb0NBQW9DO2dCQUNwQyxPQUFPLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDdEcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hDLENBQUM7Z0JBQ0QsMEJBQTBCO2dCQUMxQixJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO29CQUMvRSxHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDeEMsQ0FBQztnQkFFRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxFQUFFLENBQUM7b0JBQ3ZKLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ3JCLENBQUM7Z0JBRUQsT0FBTyxNQUFNLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUMzQixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRDtJQTFJRCxnREEwSUMifQ==