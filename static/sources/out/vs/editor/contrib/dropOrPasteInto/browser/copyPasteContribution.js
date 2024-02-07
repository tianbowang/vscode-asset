/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/editor/browser/editorExtensions", "vs/editor/common/editorContextKeys", "vs/editor/common/editorFeatures", "vs/editor/contrib/dropOrPasteInto/browser/copyPasteController", "vs/editor/contrib/dropOrPasteInto/browser/defaultProviders", "vs/nls"], function (require, exports, editorExtensions_1, editorContextKeys_1, editorFeatures_1, copyPasteController_1, defaultProviders_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, editorExtensions_1.registerEditorContribution)(copyPasteController_1.CopyPasteController.ID, copyPasteController_1.CopyPasteController, 0 /* EditorContributionInstantiation.Eager */); // eager because it listens to events on the container dom node of the editor
    (0, editorFeatures_1.registerEditorFeature)(defaultProviders_1.DefaultPasteProvidersFeature);
    (0, editorExtensions_1.registerEditorCommand)(new class extends editorExtensions_1.EditorCommand {
        constructor() {
            super({
                id: copyPasteController_1.changePasteTypeCommandId,
                precondition: copyPasteController_1.pasteWidgetVisibleCtx,
                kbOpts: {
                    weight: 100 /* KeybindingWeight.EditorContrib */,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 89 /* KeyCode.Period */,
                }
            });
        }
        runEditorCommand(_accessor, editor, _args) {
            return copyPasteController_1.CopyPasteController.get(editor)?.changePasteType();
        }
    });
    (0, editorExtensions_1.registerEditorAction)(class extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.pasteAs',
                label: nls.localize('pasteAs', "Paste As..."),
                alias: 'Paste As...',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
                metadata: {
                    description: 'Paste as',
                    args: [{
                            name: 'args',
                            schema: {
                                type: 'object',
                                properties: {
                                    'id': {
                                        type: 'string',
                                        description: nls.localize('pasteAs.id', "The id of the paste edit to try applying. If not provided, the editor will show a picker."),
                                    }
                                },
                            }
                        }]
                }
            });
        }
        run(_accessor, editor, args) {
            const id = typeof args?.id === 'string' ? args.id : undefined;
            return copyPasteController_1.CopyPasteController.get(editor)?.pasteAs(id);
        }
    });
    (0, editorExtensions_1.registerEditorAction)(class extends editorExtensions_1.EditorAction {
        constructor() {
            super({
                id: 'editor.action.pasteAsText',
                label: nls.localize('pasteAsText', "Paste as Text"),
                alias: 'Paste as Text',
                precondition: editorContextKeys_1.EditorContextKeys.writable,
            });
        }
        run(_accessor, editor, args) {
            return copyPasteController_1.CopyPasteController.get(editor)?.pasteAs('text');
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29weVBhc3RlQ29udHJpYnV0aW9uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvY29udHJpYi9kcm9wT3JQYXN0ZUludG8vYnJvd3Nlci9jb3B5UGFzdGVDb250cmlidXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFZaEcsSUFBQSw2Q0FBMEIsRUFBQyx5Q0FBbUIsQ0FBQyxFQUFFLEVBQUUseUNBQW1CLGdEQUF3QyxDQUFDLENBQUMsNkVBQTZFO0lBRTdMLElBQUEsc0NBQXFCLEVBQUMsK0NBQTRCLENBQUMsQ0FBQztJQUVwRCxJQUFBLHdDQUFxQixFQUFDLElBQUksS0FBTSxTQUFRLGdDQUFhO1FBQ3BEO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSw4Q0FBd0I7Z0JBQzVCLFlBQVksRUFBRSwyQ0FBcUI7Z0JBQ25DLE1BQU0sRUFBRTtvQkFDUCxNQUFNLDBDQUFnQztvQkFDdEMsT0FBTyxFQUFFLG1EQUErQjtpQkFDeEM7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRWUsZ0JBQWdCLENBQUMsU0FBa0MsRUFBRSxNQUFtQixFQUFFLEtBQVU7WUFDbkcsT0FBTyx5Q0FBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsZUFBZSxFQUFFLENBQUM7UUFDM0QsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEsdUNBQW9CLEVBQUMsS0FBTSxTQUFRLCtCQUFZO1FBQzlDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSx1QkFBdUI7Z0JBQzNCLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUM7Z0JBQzdDLEtBQUssRUFBRSxhQUFhO2dCQUNwQixZQUFZLEVBQUUscUNBQWlCLENBQUMsUUFBUTtnQkFDeEMsUUFBUSxFQUFFO29CQUNULFdBQVcsRUFBRSxVQUFVO29CQUN2QixJQUFJLEVBQUUsQ0FBQzs0QkFDTixJQUFJLEVBQUUsTUFBTTs0QkFDWixNQUFNLEVBQUU7Z0NBQ1AsSUFBSSxFQUFFLFFBQVE7Z0NBQ2QsVUFBVSxFQUFFO29DQUNYLElBQUksRUFBRTt3Q0FDTCxJQUFJLEVBQUUsUUFBUTt3Q0FDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxZQUFZLEVBQUUsMkZBQTJGLENBQUM7cUNBQ3BJO2lDQUNEOzZCQUNEO3lCQUNELENBQUM7aUJBQ0Y7YUFDRCxDQUFDLENBQUM7UUFDSixDQUFDO1FBRWUsR0FBRyxDQUFDLFNBQTJCLEVBQUUsTUFBbUIsRUFBRSxJQUFTO1lBQzlFLE1BQU0sRUFBRSxHQUFHLE9BQU8sSUFBSSxFQUFFLEVBQUUsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUM5RCxPQUFPLHlDQUFtQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckQsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEsdUNBQW9CLEVBQUMsS0FBTSxTQUFRLCtCQUFZO1FBQzlDO1lBQ0MsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSwyQkFBMkI7Z0JBQy9CLEtBQUssRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLGFBQWEsRUFBRSxlQUFlLENBQUM7Z0JBQ25ELEtBQUssRUFBRSxlQUFlO2dCQUN0QixZQUFZLEVBQUUscUNBQWlCLENBQUMsUUFBUTthQUN4QyxDQUFDLENBQUM7UUFDSixDQUFDO1FBRWUsR0FBRyxDQUFDLFNBQTJCLEVBQUUsTUFBbUIsRUFBRSxJQUFTO1lBQzlFLE9BQU8seUNBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6RCxDQUFDO0tBQ0QsQ0FBQyxDQUFDIn0=