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
define(["require", "exports", "vs/platform/registry/common/platform", "vs/workbench/common/contributions", "vs/editor/contrib/gotoError/browser/markerNavigationService", "vs/workbench/contrib/notebook/common/notebookCommon", "vs/platform/markers/common/markers", "vs/platform/configuration/common/configuration", "vs/base/common/lifecycle", "vs/workbench/contrib/notebook/browser/notebookBrowser", "vs/workbench/contrib/notebook/browser/notebookEditorExtensions", "vs/base/common/decorators", "vs/platform/theme/common/colorRegistry", "vs/base/common/resources"], function (require, exports, platform_1, contributions_1, markerNavigationService_1, notebookCommon_1, markers_1, configuration_1, lifecycle_1, notebookBrowser_1, notebookEditorExtensions_1, decorators_1, colorRegistry_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let MarkerListProvider = class MarkerListProvider {
        constructor(_markerService, markerNavigation, _configService) {
            this._markerService = _markerService;
            this._configService = _configService;
            this._dispoables = markerNavigation.registerProvider(this);
        }
        dispose() {
            this._dispoables.dispose();
        }
        getMarkerList(resource) {
            if (!resource) {
                return undefined;
            }
            const data = notebookCommon_1.CellUri.parse(resource);
            if (!data) {
                return undefined;
            }
            return new markerNavigationService_1.MarkerList(uri => {
                const otherData = notebookCommon_1.CellUri.parse(uri);
                return otherData?.notebook.toString() === data.notebook.toString();
            }, this._markerService, this._configService);
        }
    };
    MarkerListProvider = __decorate([
        __param(0, markers_1.IMarkerService),
        __param(1, markerNavigationService_1.IMarkerNavigationService),
        __param(2, configuration_1.IConfigurationService)
    ], MarkerListProvider);
    let NotebookMarkerDecorationContribution = class NotebookMarkerDecorationContribution extends lifecycle_1.Disposable {
        static { this.id = 'workbench.notebook.markerDecoration'; }
        constructor(_notebookEditor, _markerService) {
            super();
            this._notebookEditor = _notebookEditor;
            this._markerService = _markerService;
            this._markersOverviewRulerDecorations = [];
            this._update();
            this._register(this._notebookEditor.onDidChangeModel(() => this._update()));
            this._register(this._markerService.onMarkerChanged(e => {
                if (e.some(uri => this._notebookEditor.getCellsInRange().some(cell => (0, resources_1.isEqual)(cell.uri, uri)))) {
                    this._update();
                }
            }));
        }
        _update() {
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            const cellDecorations = [];
            this._notebookEditor.getCellsInRange().forEach(cell => {
                const marker = this._markerService.read({ resource: cell.uri, severities: markers_1.MarkerSeverity.Error | markers_1.MarkerSeverity.Warning });
                marker.forEach(m => {
                    const color = m.severity === markers_1.MarkerSeverity.Error ? colorRegistry_1.editorErrorForeground : colorRegistry_1.editorWarningForeground;
                    const range = { startLineNumber: m.startLineNumber, startColumn: m.startColumn, endLineNumber: m.endLineNumber, endColumn: m.endColumn };
                    cellDecorations.push({
                        handle: cell.handle,
                        options: {
                            overviewRuler: {
                                color: color,
                                modelRanges: [range],
                                includeOutput: false,
                                position: notebookBrowser_1.NotebookOverviewRulerLane.Right
                            }
                        }
                    });
                });
            });
            this._markersOverviewRulerDecorations = this._notebookEditor.deltaCellDecorations(this._markersOverviewRulerDecorations, cellDecorations);
        }
    };
    __decorate([
        (0, decorators_1.throttle)(100)
    ], NotebookMarkerDecorationContribution.prototype, "_update", null);
    NotebookMarkerDecorationContribution = __decorate([
        __param(1, markers_1.IMarkerService)
    ], NotebookMarkerDecorationContribution);
    platform_1.Registry
        .as(contributions_1.Extensions.Workbench)
        .registerWorkbenchContribution(MarkerListProvider, 2 /* LifecyclePhase.Ready */);
    (0, notebookEditorExtensions_1.registerNotebookContribution)(NotebookMarkerDecorationContribution.id, NotebookMarkerDecorationContribution);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFya2VyUHJvdmlkZXIuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL25vdGVib29rL2Jyb3dzZXIvY29udHJpYi9tYXJrZXIvbWFya2VyUHJvdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7SUFpQmhHLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQWtCO1FBSXZCLFlBQ2tDLGNBQThCLEVBQ3JDLGdCQUEwQyxFQUM1QixjQUFxQztZQUY1QyxtQkFBYyxHQUFkLGNBQWMsQ0FBZ0I7WUFFdkIsbUJBQWMsR0FBZCxjQUFjLENBQXVCO1lBRTdFLElBQUksQ0FBQyxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVELE9BQU87WUFDTixJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQzVCLENBQUM7UUFFRCxhQUFhLENBQUMsUUFBeUI7WUFDdEMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNmLE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUM7WUFDRCxNQUFNLElBQUksR0FBRyx3QkFBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ1gsT0FBTyxTQUFTLENBQUM7WUFDbEIsQ0FBQztZQUNELE9BQU8sSUFBSSxvQ0FBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUMzQixNQUFNLFNBQVMsR0FBRyx3QkFBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDckMsT0FBTyxTQUFTLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxLQUFLLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDcEUsQ0FBQyxF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