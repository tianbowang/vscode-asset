/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/path"], function (require, exports, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.normalizeMimeType = exports.getExtensionForMimeType = exports.getMediaMime = exports.getMediaOrTextMime = exports.Mimes = void 0;
    exports.Mimes = Object.freeze({
        text: 'text/plain',
        binary: 'application/octet-stream',
        unknown: 'application/unknown',
        markdown: 'text/markdown',
        latex: 'text/latex',
        uriList: 'text/uri-list',
    });
    const mapExtToTextMimes = {
        '.css': 'text/css',
        '.csv': 'text/csv',
        '.htm': 'text/html',
        '.html': 'text/html',
        '.ics': 'text/calendar',
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
        '.txt': 'text/plain',
        '.xml': 'text/xml'
    };
    // Known media mimes that we can handle
    const mapExtToMediaMimes = {
        '.aac': 'audio/x-aac',
        '.avi': 'video/x-msvideo',
        '.bmp': 'image/bmp',
        '.flv': 'video/x-flv',
        '.gif': 'image/gif',
        '.ico': 'image/x-icon',
        '.jpe': 'image/jpg',
        '.jpeg': 'image/jpg',
        '.jpg': 'image/jpg',
        '.m1v': 'video/mpeg',
        '.m2a': 'audio/mpeg',
        '.m2v': 'video/mpeg',
        '.m3a': 'audio/mpeg',
        '.mid': 'audio/midi',
        '.midi': 'audio/midi',
        '.mk3d': 'video/x-matroska',
        '.mks': 'video/x-matroska',
        '.mkv': 'video/x-matroska',
        '.mov': 'video/quicktime',
        '.movie': 'video/x-sgi-movie',
        '.mp2': 'audio/mpeg',
        '.mp2a': 'audio/mpeg',
        '.mp3': 'audio/mpeg',
        '.mp4': 'video/mp4',
        '.mp4a': 'audio/mp4',
        '.mp4v': 'video/mp4',
        '.mpe': 'video/mpeg',
        '.mpeg': 'video/mpeg',
        '.mpg': 'video/mpeg',
        '.mpg4': 'video/mp4',
        '.mpga': 'audio/mpeg',
        '.oga': 'audio/ogg',
        '.ogg': 'audio/ogg',
        '.opus': 'audio/opus',
        '.ogv': 'video/ogg',
        '.png': 'image/png',
        '.psd': 'image/vnd.adobe.photoshop',
        '.qt': 'video/quicktime',
        '.spx': 'audio/ogg',
        '.svg': 'image/svg+xml',
        '.tga': 'image/x-tga',
        '.tif': 'image/tiff',
        '.tiff': 'image/tiff',
        '.wav': 'audio/x-wav',
        '.webm': 'video/webm',
        '.webp': 'image/webp',
        '.wma': 'audio/x-ms-wma',
        '.wmv': 'video/x-ms-wmv',
        '.woff': 'application/font-woff',
    };
    function getMediaOrTextMime(path) {
        const ext = (0, path_1.extname)(path);
        const textMime = mapExtToTextMimes[ext.toLowerCase()];
        if (textMime !== undefined) {
            return textMime;
        }
        else {
            return getMediaMime(path);
        }
    }
    exports.getMediaOrTextMime = getMediaOrTextMime;
    function getMediaMime(path) {
        const ext = (0, path_1.extname)(path);
        return mapExtToMediaMimes[ext.toLowerCase()];
    }
    exports.getMediaMime = getMediaMime;
    function getExtensionForMimeType(mimeType) {
        for (const extension in mapExtToMediaMimes) {
            if (mapExtToMediaMimes[extension] === mimeType) {
                return extension;
            }
        }
        return undefined;
    }
    exports.getExtensionForMimeType = getExtensionForMimeType;
    const _simplePattern = /^(.+)\/(.+?)(;.+)?$/;
    function normalizeMimeType(mimeType, strict) {
        const match = _simplePattern.exec(mimeType);
        if (!match) {
            return strict
                ? undefined
                : mimeType;
        }
        // https://datatracker.ietf.org/doc/html/rfc2045#section-5.1
        // media and subtype must ALWAYS be lowercase, parameter not
        return `${match[1].toLowerCase()}/${match[2].toLowerCase()}${match[3] ?? ''}`;
    }
    exports.normalizeMimeType = normalizeMimeType;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWltZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9jb21tb24vbWltZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFJbkYsUUFBQSxLQUFLLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNsQyxJQUFJLEVBQUUsWUFBWTtRQUNsQixNQUFNLEVBQUUsMEJBQTBCO1FBQ2xDLE9BQU8sRUFBRSxxQkFBcUI7UUFDOUIsUUFBUSxFQUFFLGVBQWU7UUFDekIsS0FBSyxFQUFFLFlBQVk7UUFDbkIsT0FBTyxFQUFFLGVBQWU7S0FDeEIsQ0FBQyxDQUFDO0lBTUgsTUFBTSxpQkFBaUIsR0FBdUI7UUFDN0MsTUFBTSxFQUFFLFVBQVU7UUFDbEIsTUFBTSxFQUFFLFVBQVU7UUFDbEIsTUFBTSxFQUFFLFdBQVc7UUFDbkIsT0FBTyxFQUFFLFdBQVc7UUFDcEIsTUFBTSxFQUFFLGVBQWU7UUFDdkIsS0FBSyxFQUFFLGlCQUFpQjtRQUN4QixNQUFNLEVBQUUsaUJBQWlCO1FBQ3pCLE1BQU0sRUFBRSxZQUFZO1FBQ3BCLE1BQU0sRUFBRSxVQUFVO0tBQ2xCLENBQUM7SUFFRix1Q0FBdUM7SUFDdkMsTUFBTSxrQkFBa0IsR0FBdUI7UUFDOUMsTUFBTSxFQUFFLGFBQWE7UUFDckIsTUFBTSxFQUFFLGlCQUFpQjtRQUN6QixNQUFNLEVBQUUsV0FBVztRQUNuQixNQUFNLEVBQUUsYUFBYTtRQUNyQixNQUFNLEVBQUUsV0FBVztRQUNuQixNQUFNLEVBQUUsY0FBYztRQUN0QixNQUFNLEVBQUUsV0FBVztRQUNuQixPQUFPLEVBQUUsV0FBVztRQUNwQixNQUFNLEVBQUUsV0FBVztRQUNuQixNQUFNLEVBQUUsWUFBWTtRQUNwQixNQUFNLEVBQUUsWUFBWTtRQUNwQixNQUFNLEVBQUUsWUFBWTtRQUNwQixNQUFNLEVBQUUsWUFBWTtRQUNwQixNQUFNLEVBQUUsWUFBWTtRQUNwQixPQUFPLEVBQUUsWUFBWTtRQUNyQixPQUFPLEVBQUUsa0JBQWtCO1FBQzNCLE1BQU0sRUFBRSxrQkFBa0I7UUFDMUIsTUFBTSxFQUFFLGtCQUFrQjtRQUMxQixNQUFNLEVBQUUsaUJBQWlCO1FBQ3pCLFFBQVEsRUFBRSxtQkFBbUI7UUFDN0IsTUFBTSxFQUFFLFlBQVk7UUFDcEIsT0FBTyxFQUFFLFlBQVk7UUFDckIsTUFBTSxFQUFFLFlBQVk7UUFDcEIsTUFBTSxFQUFFLFdBQVc7UUFDbkIsT0FBTyxFQUFFLFdBQVc7UUFDcEIsT0FBTyxFQUFFLFdBQVc7UUFDcEIsTUFBTSxFQUFFLFlBQVk7UUFDcEIsT0FBTyxFQUFFLFlBQVk7UUFDckIsTUFBTSxFQUFFLFlBQVk7UUFDcEIsT0FBTyxFQUFFLFdBQVc7UUFDcEIsT0FBTyxFQUFFLFlBQVk7UUFDckIsTUFBTSxFQUFFLFdBQVc7UUFDbkIsTUFBTSxFQUFFLFdBQVc7UUFDbkIsT0FBTyxFQUFFLFlBQVk7UUFDckIsTUFBTSxFQUFFLFdBQVc7UUFDbkIsTUFBTSxFQUFFLFdBQVc7UUFDbkIsTUFBTSxFQUFFLDJCQUEyQjtRQUNuQyxLQUFLLEVBQUUsaUJBQWlCO1FBQ3hCLE1BQU0sRUFBRSxXQUFXO1FBQ25CLE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLE1BQU0sRUFBRSxhQUFhO1FBQ3JCLE1BQU0sRUFBRSxZQUFZO1FBQ3BCLE9BQU8sRUFBRSxZQUFZO1FBQ3JCLE1BQU0sRUFBRSxhQUFhO1FBQ3JCLE9BQU8sRUFBRSxZQUFZO1FBQ3JCLE9BQU8sRUFBRSxZQUFZO1FBQ3JCLE1BQU0sRUFBRSxnQkFBZ0I7UUFDeEIsTUFBTSxFQUFFLGdCQUFnQjtRQUN4QixPQUFPLEVBQUUsdUJBQXVCO0tBQ2hDLENBQUM7SUFFRixTQUFnQixrQkFBa0IsQ0FBQyxJQUFZO1FBQzlDLE1BQU0sR0FBRyxHQUFHLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFCLE1BQU0sUUFBUSxHQUFHLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQzVCLE9BQU8sUUFBUSxDQUFDO1FBQ2pCLENBQUM7YUFBTSxDQUFDO1lBQ1AsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDM0IsQ0FBQztJQUNGLENBQUM7SUFSRCxnREFRQztJQUVELFNBQWdCLFlBQVksQ0FBQyxJQUFZO1FBQ3hDLE1BQU0sR0FBRyxHQUFHLElBQUEsY0FBTyxFQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFCLE9BQU8sa0JBQWtCLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUhELG9DQUdDO0lBRUQsU0FBZ0IsdUJBQXVCLENBQUMsUUFBZ0I7UUFDdkQsS0FBSyxNQUFNLFNBQVMsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO1lBQzVDLElBQUksa0JBQWtCLENBQUMsU0FBUyxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7Z0JBQ2hELE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQVJELDBEQVFDO0lBRUQsTUFBTSxjQUFjLEdBQUcscUJBQXFCLENBQUM7SUFJN0MsU0FBZ0IsaUJBQWlCLENBQUMsUUFBZ0IsRUFBRSxNQUFhO1FBRWhFLE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ1osT0FBTyxNQUFNO2dCQUNaLENBQUMsQ0FBQyxTQUFTO2dCQUNYLENBQUMsQ0FBQyxRQUFRLENBQUM7UUFDYixDQUFDO1FBQ0QsNERBQTREO1FBQzVELDREQUE0RDtRQUM1RCxPQUFPLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7SUFDL0UsQ0FBQztJQVhELDhDQVdDIn0=