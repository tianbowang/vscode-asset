/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/uri", "vs/base/common/path", "vs/base/common/resources", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/editor/common/editorService", "vs/base/common/network", "vs/workbench/contrib/debug/common/debugUtils"], function (require, exports, nls, uri_1, path_1, resources, debug_1, editorService_1, network_1, debugUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getUriFromSource = exports.Source = exports.UNKNOWN_SOURCE_LABEL = void 0;
    exports.UNKNOWN_SOURCE_LABEL = nls.localize('unknownSource', "Unknown Source");
    /**
     * Debug URI format
     *
     * a debug URI represents a Source object and the debug session where the Source comes from.
     *
     *       debug:arbitrary_path?session=123e4567-e89b-12d3-a456-426655440000&ref=1016
     *       \___/ \____________/ \__________________________________________/ \______/
     *         |          |                             |                          |
     *      scheme   source.path                    session id            source.reference
     *
     *
     */
    class Source {
        constructor(raw_, sessionId, uriIdentityService, logService) {
            let path;
            if (raw_) {
                this.raw = raw_;
                path = this.raw.path || this.raw.name || '';
                this.available = true;
            }
            else {
                this.raw = { name: exports.UNKNOWN_SOURCE_LABEL };
                this.available = false;
                path = `${debug_1.DEBUG_SCHEME}:${exports.UNKNOWN_SOURCE_LABEL}`;
            }
            this.uri = getUriFromSource(this.raw, path, sessionId, uriIdentityService, logService);
        }
        get name() {
            return this.raw.name || resources.basenameOrAuthority(this.uri);
        }
        get origin() {
            return this.raw.origin;
        }
        get presentationHint() {
            return this.raw.presentationHint;
        }
        get reference() {
            return this.raw.sourceReference;
        }
        get inMemory() {
            return this.uri.scheme === debug_1.DEBUG_SCHEME;
        }
        openInEditor(editorService, selection, preserveFocus, sideBySide, pinned) {
            return !this.available ? Promise.resolve(undefined) : editorService.openEditor({
                resource: this.uri,
                description: this.origin,
                options: {
                    preserveFocus,
                    selection,
                    revealIfOpened: true,
                    selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */,
                    pinned
                }
            }, sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP);
        }
        static getEncodedDebugData(modelUri) {
            let path;
            let sourceReference;
            let sessionId;
            switch (modelUri.scheme) {
                case network_1.Schemas.file:
                    path = (0, path_1.normalize)(modelUri.fsPath);
                    break;
                case debug_1.DEBUG_SCHEME:
                    path = modelUri.path;
                    if (modelUri.query) {
                        const keyvalues = modelUri.query.split('&');
                        for (const keyvalue of keyvalues) {
                            const pair = keyvalue.split('=');
                            if (pair.length === 2) {
                                switch (pair[0]) {
                                    case 'session':
                                        sessionId = pair[1];
                                        break;
                                    case 'ref':
                                        sourceReference = parseInt(pair[1]);
                                        break;
                                }
                            }
                        }
                    }
                    break;
                default:
                    path = modelUri.toString();
                    break;
            }
            return {
                name: resources.basenameOrAuthority(modelUri),
                path,
                sourceReference,
                sessionId
            };
        }
    }
    exports.Source = Source;
    function getUriFromSource(raw, path, sessionId, uriIdentityService, logService) {
        const _getUriFromSource = (path) => {
            if (typeof raw.sourceReference === 'number' && raw.sourceReference > 0) {
                return uri_1.URI.from({
                    scheme: debug_1.DEBUG_SCHEME,
                    path: path?.replace(/^\/+/g, '/'), // #174054
                    query: `session=${sessionId}&ref=${raw.sourceReference}`
                });
            }
            if (path && (0, debugUtils_1.isUri)(path)) { // path looks like a uri
                return uriIdentityService.asCanonicalUri(uri_1.URI.parse(path));
            }
            // assume a filesystem path
            if (path && (0, path_1.isAbsolute)(path)) {
                return uriIdentityService.asCanonicalUri(uri_1.URI.file(path));
            }
            // path is relative: since VS Code cannot deal with this by itself
            // create a debug url that will result in a DAP 'source' request when the url is resolved.
            return uriIdentityService.asCanonicalUri(uri_1.URI.from({
                scheme: debug_1.DEBUG_SCHEME,
                path,
                query: `session=${sessionId}`
            }));
        };
        try {
            return _getUriFromSource(path);
        }
        catch (err) {
            logService.error('Invalid path from debug adapter: ' + path);
            return _getUriFromSource('/invalidDebugSource');
        }
    }
    exports.getUriFromSource = getUriFromSource;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdTb3VyY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2RlYnVnL2NvbW1vbi9kZWJ1Z1NvdXJjZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFnQm5GLFFBQUEsb0JBQW9CLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztJQUVwRjs7Ozs7Ozs7Ozs7T0FXRztJQUVILE1BQWEsTUFBTTtRQU1sQixZQUFZLElBQXNDLEVBQUUsU0FBaUIsRUFBRSxrQkFBdUMsRUFBRSxVQUF1QjtZQUN0SSxJQUFJLElBQVksQ0FBQztZQUNqQixJQUFJLElBQUksRUFBRSxDQUFDO2dCQUNWLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO2dCQUNoQixJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUM1QyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN2QixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsSUFBSSxDQUFDLEdBQUcsR0FBRyxFQUFFLElBQUksRUFBRSw0QkFBb0IsRUFBRSxDQUFDO2dCQUMxQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztnQkFDdkIsSUFBSSxHQUFHLEdBQUcsb0JBQVksSUFBSSw0QkFBb0IsRUFBRSxDQUFDO1lBQ2xELENBQUM7WUFFRCxJQUFJLENBQUMsR0FBRyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxrQkFBa0IsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN4RixDQUFDO1FBRUQsSUFBSSxJQUFJO1lBQ1AsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFD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