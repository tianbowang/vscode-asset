/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/extpath", "vs/base/common/network", "vs/base/common/path", "vs/base/common/uri", "vs/platform/files/common/files", "vs/platform/webview/common/mimeTypes"], function (require, exports, extpath_1, network_1, path_1, uri_1, files_1, mimeTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadLocalResource = exports.WebviewResourceResponse = void 0;
    var WebviewResourceResponse;
    (function (WebviewResourceResponse) {
        let Type;
        (function (Type) {
            Type[Type["Success"] = 0] = "Success";
            Type[Type["Failed"] = 1] = "Failed";
            Type[Type["AccessDenied"] = 2] = "AccessDenied";
            Type[Type["NotModified"] = 3] = "NotModified";
        })(Type = WebviewResourceResponse.Type || (WebviewResourceResponse.Type = {}));
        class StreamSuccess {
            constructor(stream, etag, mtime, mimeType) {
                this.stream = stream;
                this.etag = etag;
                this.mtime = mtime;
                this.mimeType = mimeType;
                this.type = Type.Success;
            }
        }
        WebviewResourceResponse.StreamSuccess = StreamSuccess;
        WebviewResourceResponse.Failed = { type: Type.Failed };
        WebviewResourceResponse.AccessDenied = { type: Type.AccessDenied };
        class NotModified {
            constructor(mimeType, mtime) {
                this.mimeType = mimeType;
                this.mtime = mtime;
                this.type = Type.NotModified;
            }
        }
        WebviewResourceResponse.NotModified = NotModified;
    })(WebviewResourceResponse || (exports.WebviewResourceResponse = WebviewResourceResponse = {}));
    async function loadLocalResource(requestUri, options, fileService, logService, token) {
        logService.debug(`loadLocalResource - begin. requestUri=${requestUri}`);
        const resourceToLoad = getResourceToLoad(requestUri, options.roots);
        logService.debug(`loadLocalResource - found resource to load. requestUri=${requestUri}, resourceToLoad=${resourceToLoad}`);
        if (!resourceToLoad) {
            return WebviewResourceResponse.AccessDenied;
        }
        const mime = (0, mimeTypes_1.getWebviewContentMimeType)(requestUri); // Use the original path for the mime
        try {
            const result = await fileService.readFileStream(resourceToLoad, { etag: options.ifNoneMatch }, token);
            return new WebviewResourceResponse.StreamSuccess(result.value, result.etag, result.mtime, mime);
        }
        catch (err) {
            if (err instanceof files_1.FileOperationError) {
                const result = err.fileOperationResult;
                // NotModified status is expected and can be handled gracefully
                if (result === 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */) {
                    return new WebviewResourceResponse.NotModified(mime, err.options?.mtime);
                }
            }
            // Otherwise the error is unexpected.
            logService.debug(`loadLocalResource - Error using fileReader. requestUri=${requestUri}`);
            console.log(err);
            return WebviewResourceResponse.Failed;
        }
    }
    exports.loadLocalResource = loadLocalResource;
    function getResourceToLoad(requestUri, roots) {
        for (const root of roots) {
            if (containsResource(root, requestUri)) {
                return normalizeResourcePath(requestUri);
            }
        }
        return undefined;
    }
    function containsResource(root, resource) {
        if (root.scheme !== resource.scheme) {
            return false;
        }
        let resourceFsPath = (0, path_1.normalize)(resource.fsPath);
        let rootPath = (0, path_1.normalize)(root.fsPath + (root.fsPath.endsWith(path_1.sep) ? '' : path_1.sep));
        if ((0, extpath_1.isUNC)(root.fsPath) && (0, extpath_1.isUNC)(resource.fsPath)) {
            rootPath = rootPath.toLowerCase();
            resourceFsPath = resourceFsPath.toLowerCase();
        }
        return resourceFsPath.startsWith(rootPath);
    }
    function normalizeResourcePath(resource) {
        // Rewrite remote uris to a path that the remote file system can understand
        if (resource.scheme === network_1.Schemas.vscodeRemote) {
            return uri_1.URI.from({
                scheme: network_1.Schemas.vscodeRemote,
                authority: resource.authority,
                path: '/vscode-resource',
                query: JSON.stringify({
                    requestResourcePath: resource.path
                })
            });
        }
        return resource;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb3VyY2VMb2FkaW5nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi93ZWJ2aWV3L2Jyb3dzZXIvcmVzb3VyY2VMb2FkaW5nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVloRyxJQUFpQix1QkFBdUIsQ0EyQnZDO0lBM0JELFdBQWlCLHVCQUF1QjtRQUN2QyxJQUFZLElBQW1EO1FBQS9ELFdBQVksSUFBSTtZQUFHLHFDQUFPLENBQUE7WUFBRSxtQ0FBTSxDQUFBO1lBQUUsK0NBQVksQ0FBQTtZQUFFLDZDQUFXLENBQUE7UUFBQyxDQUFDLEVBQW5ELElBQUksR0FBSiw0QkFBSSxLQUFKLDRCQUFJLFFBQStDO1FBRS9ELE1BQWEsYUFBYTtZQUd6QixZQUNpQixNQUE4QixFQUM5QixJQUF3QixFQUN4QixLQUF5QixFQUN6QixRQUFnQjtnQkFIaEIsV0FBTSxHQUFOLE1BQU0sQ0FBd0I7Z0JBQzlCLFNBQUksR0FBSixJQUFJLENBQW9CO2dCQUN4QixVQUFLLEdBQUwsS0FBSyxDQUFvQjtnQkFDekIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtnQkFOeEIsU0FBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFPekIsQ0FBQztTQUNMO1FBVFkscUNBQWEsZ0JBU3pCLENBQUE7UUFFWSw4QkFBTSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQVcsQ0FBQztRQUN4QyxvQ0FBWSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQVcsQ0FBQztRQUVqRSxNQUFhLFdBQVc7WUFHdkIsWUFDaUIsUUFBZ0IsRUFDaEIsS0FBeUI7Z0JBRHpCLGFBQVEsR0FBUixRQUFRLENBQVE7Z0JBQ2hCLFVBQUssR0FBTCxLQUFLLENBQW9CO2dCQUpqQyxTQUFJLEdBQUcsSUFBSSxDQUFDLFdB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