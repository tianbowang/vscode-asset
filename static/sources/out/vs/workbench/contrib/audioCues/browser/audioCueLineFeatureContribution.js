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
define(["require", "exports", "vs/base/common/cache", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/observable", "vs/editor/browser/editorBrowser", "vs/editor/contrib/folding/browser/folding", "vs/platform/audioCues/browser/audioCueService", "vs/platform/configuration/common/configuration", "vs/platform/instantiation/common/instantiation", "vs/platform/markers/common/markers", "vs/workbench/contrib/debug/common/debug", "vs/workbench/services/editor/common/editorService"], function (require, exports, cache_1, event_1, lifecycle_1, observable_1, editorBrowser_1, folding_1, audioCueService_1, configuration_1, instantiation_1, markers_1, debug_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AudioCueLineFeatureContribution = void 0;
    let AudioCueLineFeatureContribution = class AudioCueLineFeatureContribution extends lifecycle_1.Disposable {
        constructor(editorService, instantiationService, audioCueService, _configurationService) {
            super();
            this.editorService = editorService;
            this.instantiationService = instantiationService;
            this.audioCueService = audioCueService;
            this._configurationService = _configurationService;
            this.store = this._register(new lifecycle_1.DisposableStore());
            this.features = [
                this.instantiationService.createInstance(MarkerLineFeature, audioCueService_1.AudioCue.error, markers_1.MarkerSeverity.Error),
                this.instantiationService.createInstance(MarkerLineFeature, audioCueService_1.AudioCue.warning, markers_1.MarkerSeverity.Warning),
                this.instantiationService.createInstance(FoldedAreaLineFeature),
                this.instantiationService.createInstance(BreakpointLineFeature),
            ];
            this.isEnabledCache = new cache_1.CachedFunction((cue) => (0, observable_1.observableFromEvent)(this.audioCueService.onEnabledChanged(cue), () => this.audioCueService.isCueEnabled(cue)));
            this.isAlertEnabledCache = new cache_1.CachedFunction((cue) => (0, observable_1.observableFromEvent)(this.audioCueService.onAlertEnabledChanged(cue), () => this.audioCueService.isAlertEnabled(cue)));
            const someAudioCueFeatureIsEnabled = (0, observable_1.derived)((reader) => /** @description someAudioCueFeatureIsEnabled */ this.features.some((feature) => this.isEnabledCache.get(feature.audioCue).read(reader) || this.isAlertEnabledCache.get(feature.audioCue).read(reader)));
            const activeEditorObservable = (0, observable_1.observableFromEvent)(this.editorService.onDidActiveEditorChange, (_) => {
                const activeTextEditorControl = this.editorService.activeTextEditorControl;
                const editor = (0, editorBrowser_1.isDiffEditor)(activeTextEditorControl)
                    ? activeTextEditorControl.getOriginalEditor()
                    : (0, editorBrowser_1.isCodeEditor)(activeTextEditorControl)
                        ? activeTextEditorControl
                        : undefined;
                return editor && editor.hasModel() ? { editor, model: editor.getModel() } : undefined;
            });
            this._register((0, observable_1.autorun)(reader => {
                /** @description updateAudioCuesEnabled */
                this.store.clear();
                if (!someAudioCueFeatureIsEnabled.read(reader)) {
                    return;
                }
                const activeEditor = activeEditorObservable.read(reader);
                if (activeEditor) {
                    this.registerAudioCuesForEditor(activeEditor.editor, activeEditor.model, this.store);
                }
            }));
        }
        registerAudioCuesForEditor(editor, editorModel, store) {
            const curPosition = (0, observable_1.observableFromEvent)(editor.onDidChangeCursorPosition, (args) => {
                /** @description editor.onDidChangeCursorPosition (caused by user) */
                if (args &&
                    args.reason !== 3 /* CursorChangeReason.Explicit */ &&
                    args.reason !== 0 /* CursorChangeReason.NotSet */) {
                    // Ignore cursor changes caused by navigation (e.g. which happens when execution is paused).
                    return undefined;
                }
                return editor.getPosition();
            });
            const debouncedPosition = (0, observable_1.debouncedObservable)(curPosition, this._configurationService.getValue('audioCues.debouncePositionChanges') ? 300 : 0, store);
            const isTyping = (0, observable_1.wasEventTriggeredRecently)(editorModel.onDidChangeContent.bind(editorModel), 1000, store);
            const featureStates = this.features.map((feature) => {
                const lineFeatureState = feature.getObservableState(editor, editorModel);
                const isFeaturePresent = (0, observable_1.derivedOpts)({ debugName: `isPresentInLine:${feature.audioCue.name}` }, (reader) => {
                    if (!this.isEnabledCache.get(feature.audioCue).read(reader) && !this.isAlertEnabledCache.get(feature.audioCue).read(reader)) {
                        return false;
                    }
                    const position = debouncedPosition.read(reader);
                    if (!position) {
                        return false;
                    }
                    return lineFeatureState.read(reader).isPresent(position);
                });
                return (0, observable_1.derivedOpts)({ debugName: `typingDebouncedFeatureState:\n${feature.audioCue.name}` }, (reader) => feature.debounceWhileTyping && isTyping.read(reader)
                    ? (debouncedPosition.read(reader), isFeaturePresent.get())
                    : isFeaturePresent.read(reader));
            });
            const state = (0, observable_1.derived)((reader) => /** @description states */ ({
                lineNumber: debouncedPosition.read(reader),
                featureStates: new Map(this.features.map((feature, idx) => [
                    feature,
                    featureStates[idx].read(reader),
                ])),
            }));
            store.add((0, observable_1.autorunDelta)(state, ({ lastValue, newValue }) => {
                /** @description Play Audio Cue */
                const newFeatures = this.features.filter(feature => newValue?.featureStates.get(feature) &&
                    (!lastValue?.featureStates?.get(feature) || newValue.lineNumber !== lastValue.lineNumber));
                this.audioCueService.playAudioCues(newFeatures.map(f => f.audioCue));
            }));
        }
    };
    exports.AudioCueLineFeatureContribution = AudioCueLineFeatureContribution;
    exports.AudioCueLineFeatureContribution = AudioCueLineFeatureContribution = __decorate([
        __param(0, editorService_1.IEditorService),
        __param(1, instantiation_1.IInstantiationService),
        __param(2, audioCueService_1.IAudioCueService),
        __param(3, configuration_1.IConfigurationService)
    ], AudioCueLineFeatureContribution);
    let MarkerLineFeature = class MarkerLineFeature {
        constructor(audioCue, severity, markerService) {
            this.audioCue = audioCue;
            this.severity = severity;
            this.markerService = markerService;
            this.debounceWhileTyping = true;
            this._previousLine = 0;
        }
        getObservableState(editor, model) {
            return (0, observable_1.observableFromEvent)(event_1.Event.filter(this.markerService.onMarkerChanged, (changedUris) => changedUris.some((u) => u.toString() === model.uri.toString())), () => /** @description this.markerService.onMarkerChanged */ ({
                isPresent: (position) => {
                    const lineChanged = position.lineNumber !== this._previousLine;
                    this._previousLine = position.lineNumber;
                    const hasMarker = this.markerService
                        .read({ resource: model.uri })
                        .some((m) => {
                        const onLine = m.severity === this.severity && m.startLineNumber <= position.lineNumber && position.lineNumber <= m.endLineNumber;
                        return lineChanged ? onLine : onLine && (position.lineNumber <= m.endLineNumber && m.startColumn <= position.column && m.endColumn >= position.column);
                    });
                    return hasMarker;
                },
            }));
        }
    };
    MarkerLineFeature = __decorate([
        __param(2, markers_1.IMarkerService)
    ], MarkerLineFeature);
    class FoldedAreaLineFeature {
        constructor() {
            this.audioCue = audioCueService_1.AudioCue.foldedArea;
        }
        getObservableState(editor, model) {
            const foldingController = folding_1.FoldingController.get(editor);
            if (!foldingController) {
                return (0, observable_1.constObservable)({
                    isPresent: () => false,
                });
            }
            const foldingModel = (0, observable_1.observableFromPromise)(foldingController.getFoldingModel() ?? Promise.resolve(undefined));
            return foldingModel.map((v) => ({
                isPresent: (position) => {
                    const regionAtLine = v.value?.getRegionAtLine(position.lineNumber);
                    const hasFolding = !regionAtLine
                        ? false
                        : regionAtLine.isCollapsed &&
                            regionAtLine.startLineNumber === position.lineNumber;
                    return hasFolding;
                },
            }));
        }
    }
    let BreakpointLineFeature = class BreakpointLineFeature {
        constructor(debugService) {
            this.debugService = debugService;
            this.audioCue = audioCueService_1.AudioCue.break;
        }
        getObservableState(editor, model) {
            return (0, observable_1.observableFromEvent)(this.debugService.getModel().onDidChangeBreakpoints, () => /** @description debugService.getModel().onDidChangeBreakpoints */ ({
                isPresent: (position) => {
                    const breakpoints = this.debugService
                        .getModel()
                        .getBreakpoints({ uri: model.uri, lineNumber: position.lineNumber });
                    const hasBreakpoints = breakpoints.length > 0;
                    return hasBreakpoints;
                },
            }));
        }
    };
    BreakpointLineFeature = __decorate([
        __param(0, debug_1.IDebugService)
    ], BreakpointLineFeature);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXVkaW9DdWVMaW5lRmVhdHVyZUNvbnRyaWJ1dGlvbi5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvYXVkaW9DdWVzL2Jyb3dzZXIvYXVkaW9DdWVMaW5lRmVhdHVyZUNvbnRyaWJ1dGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7Ozs7Ozs7Ozs7SUFtQnpGLElBQU0sK0JBQStCLEdBQXJDLE1BQU0sK0JBQ1osU0FBUSxzQkFBVTtRQXFCbEIsWUFDaUIsYUFBOEMsRUFDdkMsb0JBQTRELEVBQ2pFLGVBQWtELEVBQzdDLHFCQUE2RDtZQUVwRixLQUFLLEVBQUUsQ0FBQztZQUx5QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7WUFDdEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUF1QjtZQUNoRCxvQkFBZSxHQUFmLGVBQWUsQ0FBa0I7WUFDNUIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtZQXZCcEUsVUFBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSwyQkFBZSxFQUFFLENBQUMsQ0FBQztZQUU5QyxhQUFRLEdBQWtCO2dCQUMxQyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLDBCQUFRLENBQUMsS0FBSyxFQUFFLHdCQUFjLENBQUMsS0FBSyxDQUFDO2dCQUNqRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLDBCQUFRLENBQUMsT0FBTyxFQUFFLHdCQUFjLENBQUMsT0FBTyxDQUFDO2dCQUNyRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFDO2dCQUMvRCxJQUFJLENBQUMsb0JBQW9CLENBQUMsY0FBYyxDQUFDLHFCQUFxQixDQUFDO2FBQy9ELENBQUM7WUFFZSxtQkFBYyxHQUFHLElBQUksc0JBQWMsQ0FBaUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLElBQUEsZ0NBQW1CLEVBQ2hILElBQUksQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLEVBQzFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUM1QyxDQUFDLENBQUM7WUFFYyx3QkFBbUIsR0FBRyxJQUFJLHNCQUFjLENBQWlDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxJQUFBLGdDQUFtQixFQUNySCxJQUFJLENBQUMsZUFBZSxDQUFDLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxFQUMvQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FDOUMsQ0FBQyxDQUFDO1lBVUYsTUFBTSw0QkFBNEIsR0FBRyxJQUFBLG9CQUFPLEVBQzNDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxnREFBZ0QsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQzNGLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUNySCxDQUNELENBQUM7WUFFRixNQUFNLHNCQUFzQixHQUFHLElBQUEsZ0NBQW1CLEVBQ2pELElBQUksQ0FBQyxhQUFhLENBQUMsdUJBQXVCLEVBQzFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQ0wsTUFBTSx1QkFBdUIsR0FDNUIsSUFBSSxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQztnQkFFNUMsTUFBTSxNQUFNLEdBQUcsSUFBQSw0QkFBWSxFQUFDLHVCQUF1QixDQUFDO29CQUNuRCxDQUFDLENBQUMsdUJBQXVCLENBQUMsaUJBQWlCLEVBQUU7b0JBQzdDLENBQUMsQ0FBQyxJQUFBLDRCQUFZLEVBQUMsdUJBQXVCLENBQUM7d0JBQ3RDLENBQUMsQ0FBQyx1QkFBdUI7d0JBQ3pCLENBQUMsQ0FBQyxTQUFTLENBQUM7Z0JBRWQsT0FBTyxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUN2RixDQUFDLENBQ0QsQ0FBQztZQUVGLElBQUksQ0FBQyxTQUFTLENBQ2IsSUFBQSxvQkFBTyxFQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNoQiwwQ0FBMEM7Z0JBQzFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBRW5CLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztvQkFDaEQsT0FBTztnQkFDUixDQUFDO2dCQUVELE1BQU0sWUFBWSxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDekQsSUFBSSxZQUFZLEVBQUUsQ0FBQztvQkFDbEIsSUFBSSxDQUFDLDBCQUEwQixDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RGLENBQUM7WUFDRixDQUFDLENBQUMsQ0FDRixDQUFDO1FBQ0gsQ0FBQztRQUVPLDBCQUEwQixDQUNqQyxNQUFtQixFQUNuQixXQUF1QixFQUN2QixLQUFzQjtZQUV0QixNQUFNLFdBQVcsR0FBRyxJQUFBLGdDQUFtQixFQUN0QyxNQUFNLENBQUMseUJBQXlCLEVBQ2hDLENBQUMsSUFBSSxFQUFFLEVBQUU7Z0JBQ1IscUVBQXFFO2dCQUNyRSxJQUNDLElBQUk7b0JBQ0osSUFBSSxDQUFDLE1BQU0sd0NBQWdDO29CQUMzQyxJQUFJLENBQUMsTUFBTSxzQ0FBOEIsRUFDeEMsQ0FBQztvQkFDRiw0RkFBNEY7b0JBQzVGLE9BQU8sU0FBUyxDQUFDO2dCQUNsQixDQUFDO2dCQUNELE9BQU8sTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQzdCLENBQUMsQ0FDRCxDQUFDO1lBQ0YsTUFBTSxpQkFBaUIsR0FBRyxJQUFBLGdDQUFtQixFQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLG1DQUFtQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RKLE1BQU0sUUFBUSxHQUFHLElBQUEsc0NBQXlCLEVBQ3pDLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQ2hELElBQUksRUFDSixLQUFLLENBQ0wsQ0FBQztZQUVGLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7Z0JBQ25ELE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztnQkFDekUsTUFBTSxnQkFBZ0IsR0FBRyxJQUFBLHdCQUFXLEVBQ25DLEVBQUUsU0FBUyxFQUFFLG1CQUFtQixPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQ3pELENBQUMsTUFBTSxFQUFFLEVBQUU7b0JBQ1YsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQzt3QkFDN0gsT0FBTyxLQUFLLENBQUM7b0JBQ2QsQ0FBQztvQkFDRCxNQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2hELElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3QkFDZixPQUFPLEtBQUssQ0FBQztvQkFDZCxDQUFDO29CQUNELE9BQU8sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDMUQsQ0FBQyxDQUNELENBQUM7Z0JBQ0YsT0FBTyxJQUFBLHdCQUFXLEVBQ2pCLEVBQUUsU0FBUyxFQUFFLGlDQUFpQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLEVBQ3ZFLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FDVixPQUFPLENBQUMsbUJBQW1CLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7b0JBQ25ELENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDMUQsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FDakMsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxLQUFLLEdBQUcsSUFBQSxvQkFBTyxFQUNwQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsMEJBQTBCLENBQUEsQ0FBQztnQkFDdEMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQzFDLGFBQWEsRUFBRSxJQUFJLEdBQUcsQ0FDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQztvQkFDbkMsT0FBTztvQkFDUCxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztpQkFDL0IsQ0FBQyxDQUNGO2FBQ0QsQ0FBQyxDQUNGLENBQUM7WUFFRixLQUFLLENBQUMsR0FBRyxDQUNSLElBQUEseUJBQVksRUFBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFO2dCQUMvQyxrQ0FBa0M7Z0JBQ2xDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUN2QyxPQUFPLENBQUMsRUFBRSxDQUNULFFBQVEsRUFBRSxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQztvQkFDcEMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLFFBQVEsQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUMxRixDQUFDO2dCQUVGLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUN0RSxDQUFDLENBQUMsQ0FDRixDQUFDO1FBQ0gsQ0FBQztLQUNELENBQUE7SUFqSlksMEVBQStCOzhDQUEvQiwrQkFBK0I7UUF1QnpDLFdBQUEsOEJBQWMsQ0FBQTtRQUNkLFdBQUEscUNBQXFCLENBQUE7UUFDckIsV0FBQSxrQ0FBZ0IsQ0FBQTtRQUNoQixXQUFBLHFDQUFxQixDQUFBO09BMUJYLCtCQUErQixDQWlKM0M7SUFlRCxJQUFNLGlCQUFpQixHQUF2QixNQUFNLGlCQUFpQjtRQUd0QixZQUNpQixRQUFrQixFQUNqQixRQUF3QixFQUN6QixhQUE4QztZQUY5QyxhQUFRLEdBQVIsUUFBUSxDQUFVO1lBQ2pCLGFBQVEsR0FBUixRQUFRLENBQWdCO1lBQ1Isa0JBQWEsR0FBYixhQUFhLENBQWdCO1lBTC9DLHdCQUFtQixHQUFHLElBQUksQ0FBQztZQUNuQyxrQkFBYSxHQUFXLENBQUMsQ0FBQztRQU05QixDQUFDO1FBRUwsa0JBQWtCLENBQUMsTUFBbUIsRUFBRSxLQUFpQjtZQUN4RCxPQUFPLElBQUEsZ0NBQW1CLEVBQ3pCLGFBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUNoRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUM5RCxFQUNELEdBQUcsRUFBRSxDQUFDLHNEQUFzRCxDQUFBLENBQUM7Z0JBQzVELFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFO29CQUN2QixNQUFNLFdBQVcsR0FBRyxRQUFRLENBQUMsVUFBVSxLQUFLLElBQUksQ0FBQyxhQUFhLENBQUM7b0JBQy9ELElBQUksQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLFVBQVUsQ0FBQztvQkFDekMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWE7eUJBQ2xDLElBQUksQ0FBQyxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7eUJBQzdCLElBQUksQ0FDSixDQUFDLENBQUMsRUFBRSxFQUFFO3dCQUNMLE1BQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUMsZUFBZSxJQUFJLFFBQVEsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDO3dCQUNsSSxPQUFPLFdBQVcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLFdBQVcsSUFBSSxRQUFRLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxTQUFTLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUN4SixDQUFDLENBQUMsQ0FBQztvQkFDTCxPQUFPLFNBQVMsQ0FBQztnQkFDbEIsQ0FBQzthQUNELENBQUMsQ0FDRixDQUFDO1FBQ0gsQ0FBQztLQUNELENBQUE7SUEvQkssaUJBQWlCO1FBTXBCLFdBQUEsd0JBQWMsQ0FBQTtPQU5YLGlCQUFpQixDQStCdEI7SUFFRCxNQUFNLHFCQUFxQjtRQUEzQjtZQUNpQixhQUFRLEdBQUcsMEJBQVEsQ0FBQyxVQUFVLENBQUM7UUF3QmhELENBQUM7UUF0QkEsa0JBQWtCLENBQUMsTUFBbUIsRUFBRSxLQUFpQjtZQUN4RCxNQUFNLGlCQUFpQixHQUFHLDJCQUFpQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDeEIsT0FBTyxJQUFBLDRCQUFlLEVBQUM7b0JBQ3RCLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxLQUFLO2lCQUN0QixDQUFDLENBQUM7WUFDSixDQUFDO1lBRUQsTUFBTSxZQUFZLEdBQUcsSUFBQSxrQ0FBcUIsRUFDekMsaUJBQWlCLENBQUMsZUFBZSxFQUFFLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FDakUsQ0FBQztZQUNGLE9BQU8sWUFBWSxDQUFDLEdBQUcsQ0FBbUIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ2pELFNBQVMsRUFBRSxDQUFDLFFBQVEsRUFBRSxFQUFFO29CQUN2QixNQUFNLFlBQVksR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7b0JBQ25FLE1BQU0sVUFBVSxHQUFHLENBQUMsWUFBWTt3QkFDL0IsQ0FBQyxDQUFDLEtBQUs7d0JBQ1AsQ0FBQyxDQUFDLFlBQVksQ0FBQyxXQUFXOzRCQUMxQixZQUFZLENBQUMsZUFBZSxLQUFLLFFBQVEsQ0FBQyxVQUFVLENBQUM7b0JBQ3RELE9BQU8sVUFBVSxDQUFDO2dCQUNuQixDQUFDO2FBQ0QsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0tBQ0Q7SUFFRCxJQUFNLHFCQUFxQixHQUEzQixNQUFNLHFCQUFxQjtRQUcxQixZQUEyQixZQUE0QztZQUEzQixpQkFBWSxHQUFaLFlBQVksQ0FBZTtZQUZ2RCxhQUFRLEdBQUcsMEJBQVEsQ0FBQyxLQUFLLENBQUM7UUFFaUMsQ0FBQztRQUU1RSxrQkFBa0IsQ0FBQyxNQUFtQixFQUFFLEtBQWlCO1lBQ3hELE9BQU8sSUFBQSxnQ0FBbUIsRUFDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLEVBQUUsQ0FBQyxzQkFBc0IsRUFDbkQsR0FBRyxFQUFFLENBQUMsa0VBQWtFLENBQUEsQ0FBQztnQkFDeEUsU0FBUyxFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQ3ZCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZO3lCQUNuQyxRQUFRLEVBQUU7eUJBQ1YsY0FBYyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO29CQUN0RSxNQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztvQkFDOUMsT0FBTyxjQUFjLENBQUM7Z0JBQ3ZCLENBQUM7YUFDRCxDQUFDLENBQ0YsQ0FBQztRQUNILENBQUM7S0FDRCxDQUFBO0lBbkJLLHFCQUFxQjtRQUdiLFdBQUEscUJBQWEsQ0FBQTtPQUhyQixxQkFBcUIsQ0FtQjFCIn0=