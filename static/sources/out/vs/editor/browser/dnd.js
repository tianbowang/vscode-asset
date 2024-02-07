/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dnd", "vs/base/common/dataTransfer", "vs/base/common/mime", "vs/base/common/uri", "vs/platform/dnd/browser/dnd"], function (require, exports, dnd_1, dataTransfer_1, mime_1, uri_1, dnd_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toExternalVSDataTransfer = exports.toVSDataTransfer = void 0;
    function toVSDataTransfer(dataTransfer) {
        const vsDataTransfer = new dataTransfer_1.VSDataTransfer();
        for (const item of dataTransfer.items) {
            const type = item.type;
            if (item.kind === 'string') {
                const asStringValue = new Promise(resolve => item.getAsString(resolve));
                vsDataTransfer.append(type, (0, dataTransfer_1.createStringDataTransferItem)(asStringValue));
            }
            else if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    vsDataTransfer.append(type, createFileDataTransferItemFromFile(file));
                }
            }
        }
        return vsDataTransfer;
    }
    exports.toVSDataTransfer = toVSDataTransfer;
    function createFileDataTransferItemFromFile(file) {
        const uri = file.path ? uri_1.URI.parse(file.path) : undefined;
        return (0, dataTransfer_1.createFileDataTransferItem)(file.name, uri, async () => {
            return new Uint8Array(await file.arrayBuffer());
        });
    }
    const INTERNAL_DND_MIME_TYPES = Object.freeze([
        dnd_2.CodeDataTransfers.EDITORS,
        dnd_2.CodeDataTransfers.FILES,
        dnd_1.DataTransfers.RESOURCES,
        dnd_1.DataTransfers.INTERNAL_URI_LIST,
    ]);
    function toExternalVSDataTransfer(sourceDataTransfer, overwriteUriList = false) {
        const vsDataTransfer = toVSDataTransfer(sourceDataTransfer);
        // Try to expose the internal uri-list type as the standard type
        const uriList = vsDataTransfer.get(dnd_1.DataTransfers.INTERNAL_URI_LIST);
        if (uriList) {
            vsDataTransfer.replace(mime_1.Mimes.uriList, uriList);
        }
        else {
            if (overwriteUriList || !vsDataTransfer.has(mime_1.Mimes.uriList)) {
                // Otherwise, fallback to adding dragged resources to the uri list
                const editorData = [];
                for (const item of sourceDataTransfer.items) {
                    const file = item.getAsFile();
                    if (file) {
                        const path = file.path;
                        try {
                            if (path) {
                                editorData.push(uri_1.URI.file(path).toString());
                            }
                            else {
                                editorData.push(uri_1.URI.parse(file.name, true).toString());
                            }
                        }
                        catch {
                            // Parsing failed. Leave out from list
                        }
                    }
                }
                if (editorData.length) {
                    vsDataTransfer.replace(mime_1.Mimes.uriList, (0, dataTransfer_1.createStringDataTransferItem)(dataTransfer_1.UriList.create(editorData)));
                }
            }
        }
        for (const internal of INTERNAL_DND_MIME_TYPES) {
            vsDataTransfer.delete(internal);
        }
        return vsDataTransfer;
    }
    exports.toExternalVSDataTransfer = toExternalVSDataTransfer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG5kLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci9kbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBU2hHLFNBQWdCLGdCQUFnQixDQUFDLFlBQTBCO1FBQzFELE1BQU0sY0FBYyxHQUFHLElBQUksNkJBQWMsRUFBRSxDQUFDO1FBQzVDLEtBQUssTUFBTSxJQUFJLElBQUksWUFBWSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDdkIsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUM1QixNQUFNLGFBQWEsR0FBRyxJQUFJLE9BQU8sQ0FBUyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztnQkFDaEYsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBQSwyQ0FBNEIsRUFBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQzFFLENBQUM7aUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO2dCQUNqQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzlCLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQ1YsY0FBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsa0NBQWtDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdkUsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBQ0QsT0FBTyxjQUFjLENBQUM7SUFDdkIsQ0FBQztJQWZELDRDQWVDO0lBRUQsU0FBUyxrQ0FBa0MsQ0FBQyxJQUFVO1FBQ3JELE1BQU0sR0FBRyxHQUFJLElBQXVDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxT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