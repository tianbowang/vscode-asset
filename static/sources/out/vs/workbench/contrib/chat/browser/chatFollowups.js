/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/button/button", "vs/base/common/htmlContent", "vs/base/common/lifecycle", "vs/nls", "vs/platform/contextkey/common/contextkey"], function (require, exports, dom, button_1, htmlContent_1, lifecycle_1, nls_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ChatFollowups = void 0;
    const $ = dom.$;
    class ChatFollowups extends lifecycle_1.Disposable {
        constructor(container, followups, options, clickHandler, contextService) {
            super();
            this.options = options;
            this.clickHandler = clickHandler;
            this.contextService = contextService;
            const followupsContainer = dom.append(container, $('.interactive-session-followups'));
            followups.forEach(followup => this.renderFollowup(followupsContainer, followup));
        }
        renderFollowup(container, followup) {
            if (followup.kind === 'command' && followup.when && !this.contextService.contextMatchesRules(contextkey_1.ContextKeyExpr.deserialize(followup.when))) {
                return;
            }
            const tooltip = 'tooltip' in followup ? followup.tooltip : undefined;
            const button = this._register(new button_1.Button(container, { ...this.options, supportIcons: true, title: tooltip }));
            if (followup.kind === 'reply') {
                button.element.classList.add('interactive-followup-reply');
            }
            else if (followup.kind === 'command') {
                button.element.classList.add('interactive-followup-command');
            }
            button.element.ariaLabel = (0, nls_1.localize)('followUpAriaLabel', "Follow up question: {0}", followup.title);
            const label = followup.kind === 'reply' ?
                '$(sparkle) ' + (followup.title || followup.message) :
                followup.title;
            button.label = new htmlContent_1.MarkdownString(label, { supportThemeIcons: true });
            this._register(button.onDidClick(() => this.clickHandler(followup)));
        }
    }
    exports.ChatFollowups = ChatFollowups;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdEZvbGxvd3Vwcy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvY2hhdC9icm93c2VyL2NoYXRGb2xsb3d1cHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBVWhHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFFaEIsTUFBYSxhQUF1QyxTQUFRLHNCQUFVO1FBQ3JFLFlBQ0MsU0FBc0IsRUFDdEIsU0FBYyxFQUNHLE9BQWtDLEVBQ2xDLFlBQW1DLEVBQ25DLGNBQWtDO1lBRW5ELEtBQUssRUFBRSxDQUFDO1lBSlMsWUFBTyxHQUFQLE9BQU8sQ0FBMkI7WUFDbEMsaUJBQVksR0FBWixZQUFZLENBQXVCO1lBQ25DLG1CQUFjLEdBQWQsY0FBYyxDQUFvQjtZQUluRCxNQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUM7WUFDdEYsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNsRixDQUFDO1FBRU8sY0FBYyxDQUFDLFNBQXNCLEVBQUUsUUFBVztZQUV6RCxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLDJCQUFjLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pJLE9BQU87WUFDUixDQUFDO1lBRUQsTUFBTSxPQUFPLEdBQUcsU0FBUyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1lBQ3JFLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFNLENBQUMsU0FBUyxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLFlBQVksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM5RyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEtBQUssT0FBTyxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBQzVELENBQUM7aUJBQU0sSUFBSSxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUN4QyxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUM5RCxDQUFDO1lBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsSUFBQSxjQUFRLEVBQUMsbUJBQW1CLEVBQUUseUJBQXlCLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3BHLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEtBQUssT0FBTyxDQUFDLENBQUM7Z0JBQ3hDLGFBQWEsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELFFBQVEsQ0FBQyxLQUFLLENBQUM7WUFDaEIsTUFBTSxDQUFDLEtBQUssR0FBRyxJQUFJLDRCQUFjLENBQUMsS0FBSyxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUV0RSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEUsQ0FBQztLQUNEO0lBbkNELHNDQW1DQyJ9