/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/marshalling", "vs/editor/browser/services/bulkEditService", "vs/platform/log/common/log", "vs/platform/uriIdentity/common/uriIdentity", "vs/workbench/api/common/extHost.protocol", "vs/workbench/contrib/bulkEdit/browser/bulkCellEdits", "vs/workbench/services/extensions/common/extHostCustomers"], function (require, exports, buffer_1, marshalling_1, bulkEditService_1, log_1, uriIdentity_1, extHost_protocol_1, bulkCellEdits_1, extHostCustomers_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reviveWorkspaceEditDto = exports.MainThreadBulkEdits = void 0;
    let MainThreadBulkEdits = class MainThreadBulkEdits {
        constructor(_extHostContext, _bulkEditService, _logService, _uriIdentService) {
            this._bulkEditService = _bulkEditService;
            this._logService = _logService;
            this._uriIdentService = _uriIdentService;
        }
        dispose() { }
        $tryApplyWorkspaceEdit(dto, undoRedoGroupId, isRefactoring) {
            const edits = reviveWorkspaceEditDto(dto, this._uriIdentService);
            return this._bulkEditService.apply(edits, { undoRedoGroupId, respectAutoSaveConfig: isRefactoring }).then((res) => res.isApplied, err => {
                this._logService.warn(`IGNORING workspace edit: ${err}`);
                return false;
            });
        }
    };
    exports.MainThreadBulkEdits = MainThreadBulkEdits;
    exports.MainThreadBulkEdits = MainThreadBulkEdits = __decorate([
        (0, extHostCustomers_1.extHostNamedCustomer)(extHost_protocol_1.MainContext.MainThreadBulkEdits),
        __param(1, bulkEditService_1.IBulkEditService),
        __param(2, log_1.ILogService),
        __param(3, uriIdentity_1.IUriIdentityService)
    ], MainThreadBulkEdits);
    function reviveWorkspaceEditDto(data, uriIdentityService, resolveDataTransferFile) {
        if (!data || !data.edits) {
            return data;
        }
        const result = (0, marshalling_1.revive)(data);
        for (const edit of result.edits) {
            if (bulkEditService_1.ResourceTextEdit.is(edit)) {
                edit.resource = uriIdentityService.asCanonicalUri(edit.resource);
            }
            if (bulkEditService_1.ResourceFileEdit.is(edit)) {
                if (edit.options) {
                    const inContents = edit.options?.contents;
                    if (inContents) {
                        if (inContents.type === 'base64') {
                            edit.options.contents = Promise.resolve((0, buffer_1.decodeBase64)(inContents.value));
                        }
                        else {
                            if (resolveDataTransferFile) {
                                edit.options.contents = resolveDataTransferFile(inContents.id);
                            }
                            else {
                                throw new Error('Could not revive data transfer file');
                            }
                        }
                    }
                }
                edit.newResource = edit.newResource && uriIdentityService.asCanonicalUri(edit.newResource);
                edit.oldResource = edit.oldResource && uriIdentityService.asCanonicalUri(edit.oldResource);
            }
            if (bulkCellEdits_1.ResourceNotebookCellEdit.is(edit)) {
                edit.resource = uriIdentityService.asCanonicalUri(edit.resource);
            }
        }
        return data;
    }
    exports.reviveWorkspaceEditDto = reviveWorkspaceEditDto;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZEJ1bGtFZGl0cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS9icm93c2VyL21haW5UaHJlYWRCdWxrRWRpdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBY3pGLElBQU0sbUJBQW1CLEdBQXpCLE1BQU0sbUJBQW1CO1FBRS9CLFlBQ0MsZUFBZ0MsRUFDRyxnQkFBa0MsRUFDdkMsV0FBd0IsRUFDaEIsZ0JBQXFDO1lBRnhDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7WUFDdkMsZ0JBQVcsR0FBWCxXQUFXLENBQWE7WUFDaEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFxQjtRQUN4RSxDQUFDO1FBRUwsT0FBTyxLQUFXLENBQUM7UUFFbkIsc0JBQXNCLENBQUMsR0FBc0IsRUFBRSxlQUF3QixFQUFFLGFBQXVCO1lBQy9GLE1BQU0sS0FBSyxHQUFHLHNCQUFzQixDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNqRSxPQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsZUFBZSxFQUFFLHFCQUFxQixFQUFFLGFBQWEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxFQUFFO2dCQUN2SSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyw0QkFBNEIsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDekQsT0FBTyxLQUFLLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUM7S0FDRCxDQUFBO0lBbEJZLGtEQUFtQjtrQ0FBbkIsbUJBQW1CO1FBRC9CLElBQUEsdUNBQW9CLEVBQUMsOEJBQVcsQ0FBQyxtQkFBbUIsQ0FBQztRQUtuRCxXQUFBLGtDQUFnQixDQUFBO1FBQ2hCLFdBQUEsaUJBQVcsQ0FBQTtRQUNYLFdBQUEsaUNBQW1CLENBQUE7T0FOVCxtQkFBbUIsQ0FrQi9CO0lBSUQsU0FBZ0Isc0JBQXNCLENBQUMsSUFBbUMsRUFBRSxrQkFBdUMsRUFBRSx1QkFBMkQ7UUFDL0ssSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMxQixPQUFzQixJQUFJLENBQUM7UUFDNUIsQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUEsb0JBQU0sRUFBZ0IsSUFBSSxDQUFDLENBQUM7UUFDM0MsS0FBSyxNQUFNLElBQUksSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDakMsSUFBSSxrQ0FBZ0IsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLFFBQVEsR0FBRyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xFLENBQUM7WUFDRCxJQUFJLGtDQUFnQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUMvQixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDbEIsTUFBTSxVQUFVLEdBQUksSUFBOEIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO29CQUNyRSxJQUFJLFVBQVUsRUFBRSxDQUFDO3dCQUNoQixJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFLENBQUM7NEJBQ2xDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBQSxxQkFBWSxFQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO3dCQUN6RSxDQUFDOzZCQUFNLENBQUM7NEJBQ1AsSUFBSSx1QkFBdUIsRUFBRSxDQUFDO2dDQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsR0FBRyx1QkFBdUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7NEJBQ2hFLENBQUM7aUNBQU0sQ0FBQztnQ0FDUCxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7NEJBQ3hELENBQUM7d0JBQ0YsQ0FBQztvQkFDRixDQUFDO2dCQUNGLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsV0FBVyxJQUFJLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzNGLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsSUFBSSxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzVGLENBQUM7WUFDRCxJQUFJLHdDQUF3QixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO2dCQUN2QyxJQUFJLENBQUMsUUFBUSxHQUFHLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEUsQ0FBQztRQUNGLENBQUM7UUFDRCxPQUFzQixJQUFJLENBQUM7SUFDNUIsQ0FBQztJQWhDRCx3REFnQ0MifQ==