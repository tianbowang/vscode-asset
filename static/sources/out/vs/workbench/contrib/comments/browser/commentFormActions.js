/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/button/button", "vs/base/common/lifecycle", "vs/platform/theme/browser/defaultStyles"], function (require, exports, button_1, lifecycle_1, defaultStyles_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CommentFormActions = void 0;
    class CommentFormActions {
        constructor(container, actionHandler, maxActions) {
            this.container = container;
            this.actionHandler = actionHandler;
            this.maxActions = maxActions;
            this._buttonElements = [];
            this._toDispose = new lifecycle_1.DisposableStore();
            this._actions = [];
        }
        setActions(menu, hasOnlySecondaryActions = false) {
            this._toDispose.clear();
            this._buttonElements.forEach(b => b.remove());
            this._buttonElements = [];
            const groups = menu.getActions({ shouldForwardArgs: true });
            let isPrimary = !hasOnlySecondaryActions;
            for (const group of groups) {
                const [, actions] = group;
                this._actions = actions;
                for (const action of actions) {
                    const button = new button_1.Button(this.container, { secondary: !isPrimary, ...defaultStyles_1.defaultButtonStyles });
                    isPrimary = false;
                    this._buttonElements.push(button.element);
                    this._toDispose.add(button);
                    this._toDispose.add(button.onDidClick(() => this.actionHandler(action)));
                    button.enabled = action.enabled;
                    button.label = action.label;
                    if ((this.maxActions !== undefined) && (this._buttonElements.length >= this.maxActions)) {
                        console.warn(`An extension has contributed more than the allowable number of actions to a comments menu.`);
                        return;
                    }
                }
            }
        }
        triggerDefaultAction() {
            if (this._actions.length) {
                const lastAction = this._actions[0];
                if (lastAction.enabled) {
                    return this.actionHandler(lastAction);
                }
            }
        }
        dispose() {
            this._toDispose.dispose();
        }
    }
    exports.CommentFormActions = CommentFormActions;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudEZvcm1BY3Rpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jb21tZW50cy9icm93c2VyL2NvbW1lbnRGb3JtQWN0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRaEcsTUFBYSxrQkFBa0I7UUFLOUIsWUFDUyxTQUFzQixFQUN0QixhQUF3QyxFQUMvQixVQUFtQjtZQUY1QixjQUFTLEdBQVQsU0FBUyxDQUFhO1lBQ3RCLGtCQUFhLEdBQWIsYUFBYSxDQUEyQjtZQUMvQixlQUFVLEdBQVYsVUFBVSxDQUFTO1lBUDdCLG9CQUFlLEdBQWtCLEVBQUUsQ0FBQztZQUMzQixlQUFVLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7WUFDNUMsYUFBUSxHQUFjLEVBQUUsQ0FBQztRQU03QixDQUFDO1FBRUwsVUFBVSxDQUFDLElBQVcsRUFBRSwwQkFBbUMsS0FBSztZQUMvRCxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBRXhCLElBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7WUFDOUMsSUFBSSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUM7WUFFMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLGlCQUFpQixFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFDNUQsSUFBSSxTQUFTLEdBQVksQ0FBQyx1QkFBdUIsQ0FBQztZQUNsRCxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUM1QixNQUFNLENBQUMsRUFBRSxPQUFPLENBQUMsR0FBRyxLQUFLLENBQUM7Z0JBRTFCLElBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO2dCQUN4QixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO29CQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUUsU0FBUyxFQUFFLENBQUMsU0FBUyxFQUFFLEdBQUcsbUNBQW1CLEVBQUUsQ0FBQyxDQUFDO29CQUU3RixTQUFTLEdBQUcsS0FBSyxDQUFDO29CQUNsQixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBRTFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUM1QixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUV6RSxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7b0JBQ2hDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztvQkFDNUIsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQzt3QkFDekYsT0FBTyxDQUFDLElBQUksQ0FBQyw0RkFBNEYsQ0FBQyxDQUFDO3dCQUMzRyxPQUFPO29CQUNSLENBQUM7Z0JBQ0YsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRUQsb0JBQW9CO1lBQ25CLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDMUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFcEMsSUFBSSxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3hCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztnQkFDdkMsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTztZQUNOLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDM0IsQ0FBQztLQUNEO0lBdkRELGdEQXVEQyJ9