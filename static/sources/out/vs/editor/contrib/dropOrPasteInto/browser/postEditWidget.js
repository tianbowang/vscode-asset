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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/button/button", "vs/base/common/actions", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/services/bulkEditService", "vs/editor/contrib/dropOrPasteInto/browser/edit", "vs/platform/contextkey/common/contextkey", "vs/platform/contextview/browser/contextView", "vs/platform/instantiation/common/instantiation", "vs/platform/keybinding/common/keybinding", "vs/css!./postEditWidget"], function (require, exports, dom, button_1, actions_1, event_1, lifecycle_1, bulkEditService_1, edit_1, contextkey_1, contextView_1, instantiation_1, keybinding_1) {
    "use strict";
    var PostEditWidget_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PostEditWidgetManager = void 0;
    let PostEditWidget = class PostEditWidget extends lifecycle_1.Disposable {
        static { PostEditWidget_1 = this; }
        static { this.baseId = 'editor.widget.postEditWidget'; }
        constructor(typeId, editor, visibleContext, showCommand, range, edits, onSelectNewEdit, _contextMenuService, contextKeyService, _keybindingService) {
            super();
            this.typeId = typeId;
            this.editor = editor;
            this.showCommand = showCommand;
            this.range = range;
            this.edits = edits;
            this.onSelectNewEdit = onSelectNewEdit;
            this._contextMenuService = _contextMenuService;
            this._keybindingService = _keybindingService;
            this.allowEditorOverflow = true;
            this.suppressMouseDown = true;
            this.create();
            this.visibleContext = visibleContext.bindTo(contextKeyService);
            this.visibleContext.set(true);
            this._register((0, lifecycle_1.toDisposable)(() => this.visibleContext.reset()));
            this.editor.addContentWidget(this);
            this.editor.layoutContentWidget(this);
            this._register((0, lifecycle_1.toDisposable)((() => this.editor.removeContentWidget(this))));
            this._register(this.editor.onDidChangeCursorPosition(e => {
                if (!range.containsPosition(e.position)) {
                    this.dispose();
                }
            }));
            this._register(event_1.Event.runAndSubscribe(_keybindingService.onDidUpdateKeybindings, () => {
                this._updateButtonTitle();
            }));
        }
        _updateButtonTitle() {
            const binding = this._keybindingService.lookupKeybinding(this.showCommand.id)?.getLabel();
            this.button.element.title = this.showCommand.label + (binding ? ` (${binding})` : '');
        }
        create() {
            this.domNode = dom.$('.post-edit-widget');
            this.button = this._register(new button_1.Button(this.domNode, {
                supportIcons: true,
            }));
            this.button.label = '$(insert)';
            this._register(dom.addDisposableListener(this.domNode, dom.EventType.CLICK, () => this.showSelector()));
        }
        getId() {
            return PostEditWidget_1.baseId + '.' + this.typeId;
        }
        getDomNode() {
            return this.domNode;
        }
        getPosition() {
            return {
                position: this.range.getEndPosition(),
                preference: [2 /* ContentWidgetPositionPreference.BELOW */]
            };
        }
        showSelector() {
            this._contextMenuService.showContextMenu({
                getAnchor: () => {
                    const pos = dom.getDomNodePagePosition(this.button.element);
                    return { x: pos.left + pos.width, y: pos.top + pos.height };
                },
                getActions: () => {
                    return this.edits.allEdits.map((edit, i) => (0, actions_1.toAction)({
                        id: '',
                        label: edit.label,
                        checked: i === this.edits.activeEditIndex,
                        run: () => {
                            if (i !== this.edits.activeEditIndex) {
                                return this.onSelectNewEdit(i);
                            }
                        },
                    }));
                }
            });
        }
    };
    PostEditWidget = PostEditWidget_1 = __decorate([
        __param(7, contextView_1.IContextMenuService),
        __param(8, contextkey_1.IContextKeyService),
        __param(9, keybinding_1.IKeybindingService)
    ], PostEditWidget);
    let PostEditWidgetManager = class PostEditWidgetManager extends lifecycle_1.Disposable {
        constructor(_id, _editor, _visibleContext, _showCommand, _instantiationService, _bulkEditService) {
            super();
            this._id = _id;
            this._editor = _editor;
            this._visibleContext = _visibleContext;
            this._showCommand = _showCommand;
            this._instantiationService = _instantiationService;
            this._bulkEditService = _bulkEditService;
            this._currentWidget = this._register(new lifecycle_1.MutableDisposable());
            this._register(event_1.Event.any(_editor.onDidChangeModel, _editor.onDidChangeModelContent)(() => this.clear()));
        }
        async applyEditAndShowIfNeeded(ranges, edits, canShowWidget, token) {
            const model = this._editor.getModel();
            if (!model || !ranges.length) {
                return;
            }
            const edit = edits.allEdits[edits.activeEditIndex];
            if (!edit) {
                return;
            }
            const combinedWorkspaceEdit = (0, edit_1.createCombinedWorkspaceEdit)(model.uri, ranges, edit);
            // Use a decoration to track edits around the trigger range
            const primaryRange = ranges[0];
            const editTrackingDecoration = model.deltaDecorations([], [{
                    range: primaryRange,
                    options: { description: 'paste-line-suffix', stickiness: 0 /* TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges */ }
                }]);
            let editResult;
            let editRange;
            try {
                editResult = await this._bulkEditService.apply(combinedWorkspaceEdit, { editor: this._editor, token });
                editRange = model.getDecorationRange(editTrackingDecoration[0]);
            }
            finally {
                model.deltaDecorations(editTrackingDecoration, []);
            }
            if (canShowWidget && editResult.isApplied && edits.allEdits.length > 1) {
                this.show(editRange ?? primaryRange, edits, async (newEditIndex) => {
                    const model = this._editor.getModel();
                    if (!model) {
                        return;
                    }
                    await model.undo();
                    this.applyEditAndShowIfNeeded(ranges, { activeEditIndex: newEditIndex, allEdits: edits.allEdits }, canShowWidget, token);
                });
            }
        }
        show(range, edits, onDidSelectEdit) {
            this.clear();
            if (this._editor.hasModel()) {
                this._currentWidget.value = this._instantiationService.createInstance(PostEditWidget, this._id, this._editor, this._visibleContext, this._showCommand, range, edits, onDidSelectEdit);
            }
        }
        clear() {
            this._currentWidget.clear();
        }
        tryShowSelector() {
            this._currentWidget.value?.showSelector();
        }
    };
    exports.PostEditWidgetManager = PostEditWidgetManager;
    exports.PostEditWidgetManager = PostEditWidgetManager = __decorate([
        __param(4, instantiation_1.IInstantiationService),
        __param(5, bulkEditService_1.IBulkEditService)
    ], PostEditWidgetManager);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9zdEVkaXRXaWRnZXQuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2Ryb3BPclBhc3RlSW50by9icm93c2VyL3Bvc3RFZGl0V2lkZ2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUFtQ2hHLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWUsU0FBUSxzQkFBVTs7aUJBQ2QsV0FBTSxHQUFHLDhCQUE4QixBQUFqQyxDQUFrQztRQVVoRSxZQUNrQixNQUFjLEVBQ2QsTUFBbUIsRUFDcEMsY0FBc0MsRUFDckIsV0FBd0IsRUFDeEIsS0FBWSxFQUNaLEtBQWMsRUFDZCxlQUE0QyxFQUN4QyxtQkFBeUQsRUFDMUQsaUJBQXFDLEVBQ3JDLGtCQUF1RDtZQUUzRSxLQUFLLEVBQUUsQ0FBQztZQVhTLFdBQU0sR0FBTixNQUFNLENBQVE7WUFDZCxXQUFNLEdBQU4sTUFBTSxDQUFhO1lBRW5CLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1lBQ3hCLFVBQUssR0FBTCxLQUFLLENBQU87WUFDWixVQUFLLEdBQUwsS0FBSyxDQUFTO1lBQ2Qsb0JBQWUsR0FBZixlQUFlLENBQTZCO1lBQ3ZCLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBcUI7WUFFekMsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtZQWxCbkUsd0JBQW1CLEdBQUcsSUFBSSxDQUFDO1lBQzNCLHNCQUFpQixHQUFHLElBQUksQ0FBQztZQXFCakMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBRWQsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDOUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFBLHdC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