/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/workbench/contrib/notebook/common/notebookCommon"], function (require, exports, notebookCommon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TEXT_BASED_MIMETYPES = exports.copyCellOutput = void 0;
    async function copyCellOutput(mimeType, outputViewModel, clipboardService, logService) {
        const cellOutput = outputViewModel.model;
        const output = mimeType && exports.TEXT_BASED_MIMETYPES.includes(mimeType) ?
            cellOutput.outputs.find(output => output.mime === mimeType) :
            cellOutput.outputs.find(output => exports.TEXT_BASED_MIMETYPES.includes(output.mime));
        mimeType = output?.mime;
        if (!mimeType || !output) {
            return;
        }
        const decoder = new TextDecoder();
        let text = decoder.decode(output.data.buffer);
        // append adjacent text streams since they are concatenated in the renderer
        if ((0, notebookCommon_1.isTextStreamMime)(mimeType)) {
            const cellViewModel = outputViewModel.cellViewModel;
            let index = cellViewModel.outputsViewModels.indexOf(outputViewModel) + 1;
            while (index < cellViewModel.model.outputs.length) {
                const nextCellOutput = cellViewModel.model.outputs[index];
                const nextOutput = nextCellOutput.outputs.find(output => (0, notebookCommon_1.isTextStreamMime)(output.mime));
                if (!nextOutput) {
                    break;
                }
                text = text + decoder.decode(nextOutput.data.buffer);
                index = index + 1;
            }
        }
        if (mimeType.endsWith('error')) {
            text = text.replace(/\\u001b\[[0-9;]*m/gi, '').replaceAll('\\n', '\n');
        }
        try {
            await clipboardService.writeText(text);
        }
        catch (e) {
            logService.error(`Failed to copy content: ${e}`);
        }
    }
    exports.copyCellOutput = copyCellOutput;
    exports.TEXT_BASED_MIMETYPES = [
        'text/latex',
        'text/html',
        'application/vnd.code.notebook.error',
        'application/vnd.code.notebook.stdout',
        'application/x.notebook.stdout',
        'application/x.notebook.stream',
        'application/vnd.code.notebook.stderr',
        'application/x.notebook.stderr',
        'text/plain',
        'text/markdown',
        'application/json'
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2VsbE91dHB1dENsaXBib2FyZC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvbm90ZWJvb2svYnJvd3Nlci9jb250cmliL2NsaXBib2FyZC9jZWxsT3V0cHV0Q2xpcGJvYXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU96RixLQUFLLFVBQVUsY0FBYyxDQUFDLFFBQTRCLEVBQUUsZUFBcUMsRUFBRSxnQkFBbUMsRUFBRSxVQUF1QjtRQUNySyxNQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLFFBQVEsSUFBSSw0QkFBb0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNuRSxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQztZQUM3RCxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLDRCQUFvQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUUvRSxRQUFRLEdBQUcsTUFBTSxFQUFFLElBQUksQ0FBQztRQUV4QixJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDMUIsT0FBTztRQUNSLENBQUM7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ2xDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUU5QywyRUFBMkU7UUFDM0UsSUFBSSxJQUFBLGlDQUFnQixFQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7WUFDaEMsTUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLGFBQStCLENBQUM7WUFDdEUsSUFBSSxLQUFLLEdBQUcsYUFBYSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDekUsT0FBTyxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ25ELE1BQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxRCxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUEsaUNBQWdCLEVBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQ3hGLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztvQkFDakIsTUFBTTtnQkFDUCxDQUFDO2dCQUVELElBQUksR0FBRyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNyRCxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNuQixDQUFDO1FBQ0YsQ0FBQztRQUVELElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ2hDLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFLEVBQUUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEUsQ0FBQztRQUdELElBQUksQ0FBQztZQUNKLE1BQU0sZ0JBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXhDLENBQUM7UUFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ1osVUFBVSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxDQUFDO0lBQ0YsQ0FBQztJQTFDRCx3Q0EwQ0M7SUFFWSxRQUFBLG9CQUFvQixHQUFHO1FBQ25DLFlBQVk7UUFDWixXQUFXO1FBQ1gscUNBQXFDO1FBQ3JDLHNDQUFzQztRQUN0QywrQkFBK0I7UUFDL0IsK0JBQStCO1FBQy9CLHNDQUFzQztRQUN0QywrQkFBK0I7UUFDL0IsWUFBWTtRQUNaLGVBQWU7UUFDZixrQkFBa0I7S0FDbEIsQ0FBQyJ9