/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/lifecycle", "vs/workbench/contrib/comments/browser/commentFormActions"], function (require, exports, dom, lifecycle_1, commentFormActions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentThreadAdditionalActions = void 0;
    class CommentThreadAdditionalActions extends lifecycle_1.Disposable {
        constructor(container, _commentThread, _contextKeyService, _commentMenus, _actionRunDelegate) {
            super();
            this._commentThread = _commentThread;
            this._contextKeyService = _contextKeyService;
            this._commentMenus = _commentMenus;
            this._actionRunDelegate = _actionRunDelegate;
            this._container = dom.append(container, dom.$('.comment-additional-actions'));
            dom.append(this._container, dom.$('.section-separator'));
            this._buttonBar = dom.append(this._container, dom.$('.button-bar'));
            this._createAdditionalActions(this._buttonBar);
        }
        _showMenu() {
            this._container?.classList.remove('hidden');
        }
        _hideMenu() {
            this._container?.classList.add('hidden');
        }
        _enableDisableMenu(menu) {
            const groups = menu.getActions({ shouldForwardArgs: true });
            // Show the menu if at least one action is enabled.
            for (const group of groups) {
                const [, actions] = group;
                for (const action of actions) {
                    if (action.enabled) {
                        this._showMenu();
                        return;
                    }
                    for (const subAction of action.actions ?? []) {
                        if (subAction.enabled) {
                            this._showMenu();
                            return;
                        }
                    }
                }
            }
            this._hideMenu();
        }
        _createAdditionalActions(container) {
            const menu = this._commentMenus.getCommentThreadAdditionalActions(this._contextKeyService);
            this._register(menu);
            this._register(menu.onDidChange(() => {
                this._commentFormActions.setActions(menu, /*hasOnlySecondaryActions*/ true);
                this._enableDisableMenu(menu);
            }));
            this._commentFormActions = new commentFormActions_1.CommentFormActions(container, async (action) => {
                this._actionRunDelegate?.();
                action.run({
                    thread: this._commentThread,
                    $mid: 8 /* MarshalledId.CommentThreadInstance */
                });
            }, 4);
            this._register(this._commentFormActions);
            this._commentFormActions.setActions(menu, /*hasOnlySecondaryActions*/ true);
            this._enableDisableMenu(menu);
        }
    }
    exports.CommentThreadAdditionalActions = CommentThreadAdditionalActions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudFRocmVhZEFkZGl0aW9uYWxBY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9icm93c2VyL2NvbW1lbnRUaHJlYWRBZGRpdGlvbmFsQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFlaEcsTUFBYSw4QkFBOEQsU0FBUSxzQkFBVTtRQUs1RixZQUNDLFNBQXNCLEVBQ2QsY0FBMEMsRUFDMUMsa0JBQXNDLEVBQ3RDLGFBQTJCLEVBQzNCLGtCQUF1QztZQUUvQyxLQUFLLEVBQUUsQ0FBQztZQUxBLG1CQUFjLEdBQWQsY0FBYyxDQUE0QjtZQUMxQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ3RDLGtCQUFhLEdBQWIsYUFBYSxDQUFjO1lBQzNCLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBcUI7WUFJL0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQztZQUM5RSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7WUFFekQsSUFBSSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUVPLFNBQVM7WUFDaEIsSUFBSSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFFTyxTQUFTO1lBQ2hCLElBQUksQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRU8sa0JBQWtCLENBQUMsSUFBVztZQUNyQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUU1RCxtREFBbUQ7WUFDbkQsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUUsQ0FBQztnQkFDNUIsTUFBTSxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUMxQixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUM5QixJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzt3QkFDcEIsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO3dCQUNqQixPQUFPO29CQUNSLENBQUM7b0JBRUQsS0FBSyxNQUFNLFNBQVMsSUFBSyxNQUE0QixDQUFDLE9BQU8sSUFBSSxFQUFFLEVBQUUsQ0FBQzt3QkFDckUsSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7NEJBQ3ZCLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQzs0QkFDakIsT0FBTzt3QkFDUixDQUFDO29CQUNGLENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7WUFFRCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDbEIsQ0FBQztRQUdPLHdCQUF3QixDQUFDLFNBQXNCO1lBQ3RELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsaUNBQWlDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDM0YsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFO2dCQUNwQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSwyQkFBMkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDNUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9CLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFSixJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSx1Q0FBa0IsQ0FBQyxTQUFTLEVBQUUsS0FBSyxFQUFFLE1BQWUsRUFBRSxFQUFFO2dCQUN0RixJQUFJLENBQUMsa0JBQWtCLEVBQUUsRUFBRSxDQUFDO2dCQUU1QixNQUFNLENBQUMsR0FBRyxDQUFDO29CQUNWLE1BQU0sRUFBRSxJQUFJLENBQUMsY0FBYztvQkFDM0IsSUFBSSw0Q0FBb0M7aUJBQ3hDLENBQUMsQ0FBQztZQUNKLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUVOLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFDekMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsMkJBQTJCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9CLENBQUM7S0FDRDtJQTNFRCx3RUEyRUMifQ==