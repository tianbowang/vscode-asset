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
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/nls", "vs/platform/quickinput/common/quickInput", "vs/workbench/contrib/terminal/browser/terminal", "vs/base/common/lifecycle", "vs/workbench/contrib/accessibility/browser/accessibleView"], function (require, exports, dom_1, event_1, nls_1, quickInput_1, terminal_1, lifecycle_1, accessibleView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TerminalLinkQuickpick = void 0;
    let TerminalLinkQuickpick = class TerminalLinkQuickpick extends lifecycle_1.DisposableStore {
        constructor(_quickInputService, _accessibleViewService) {
            super();
            this._quickInputService = _quickInputService;
            this._accessibleViewService = _accessibleViewService;
            this._onDidRequestMoreLinks = this.add(new event_1.Emitter());
            this.onDidRequestMoreLinks = this._onDidRequestMoreLinks.event;
        }
        async show(links) {
            // Get raw link picks
            const wordPicks = links.viewport.wordLinks ? await this._generatePicks(links.viewport.wordLinks) : undefined;
            const filePicks = links.viewport.fileLinks ? await this._generatePicks(links.viewport.fileLinks) : undefined;
            const folderPicks = links.viewport.folderLinks ? await this._generatePicks(links.viewport.folderLinks) : undefined;
            const webPicks = links.viewport.webLinks ? await this._generatePicks(links.viewport.webLinks) : undefined;
            const picks = [];
            if (webPicks) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.urlLinks', "Url") });
                picks.push(...webPicks);
            }
            if (filePicks) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.localFileLinks', "File") });
                picks.push(...filePicks);
            }
            if (folderPicks) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.localFolderLinks', "Folder") });
                picks.push(...folderPicks);
            }
            if (wordPicks) {
                picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.searchLinks', "Workspace Search") });
                picks.push(...wordPicks);
            }
            // Create and show quick pick
            const pick = this._quickInputService.createQuickPick();
            pick.items = picks;
            pick.placeholder = (0, nls_1.localize)('terminal.integrated.openDetectedLink', "Select the link to open, type to filter all links");
            pick.sortByLabel = false;
            pick.show();
            // Show all results only when filtering begins, this is done so the quick pick will show up
            // ASAP with only the viewport entries.
            let accepted = false;
            const disposables = new lifecycle_1.DisposableStore();
            disposables.add(event_1.Event.once(pick.onDidChangeValue)(async () => {
                const allLinks = await links.all;
                if (accepted) {
                    return;
                }
                const wordIgnoreLinks = [...(allLinks.fileLinks ?? []), ...(allLinks.folderLinks ?? []), ...(allLinks.webLinks ?? [])];
                const wordPicks = allLinks.wordLinks ? await this._generatePicks(allLinks.wordLinks, wordIgnoreLinks) : undefined;
                const filePicks = allLinks.fileLinks ? await this._generatePicks(allLinks.fileLinks) : undefined;
                const folderPicks = allLinks.folderLinks ? await this._generatePicks(allLinks.folderLinks) : undefined;
                const webPicks = allLinks.webLinks ? await this._generatePicks(allLinks.webLinks) : undefined;
                const picks = [];
                if (webPicks) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.urlLinks', "Url") });
                    picks.push(...webPicks);
                }
                if (filePicks) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.localFileLinks', "File") });
                    picks.push(...filePicks);
                }
                if (folderPicks) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.localFolderLinks', "Folder") });
                    picks.push(...folderPicks);
                }
                if (wordPicks) {
                    picks.push({ type: 'separator', label: (0, nls_1.localize)('terminal.integrated.searchLinks', "Workspace Search") });
                    picks.push(...wordPicks);
                }
                pick.items = picks;
            }));
            return new Promise(r => {
                disposables.add(pick.onDidHide(() => {
                    disposables.dispose();
                    if (pick.selectedItems.length === 0) {
                        this._accessibleViewService.showLastProvider("terminal" /* AccessibleViewProviderId.Terminal */);
                    }
                    r();
                }));
                disposables.add(event_1.Event.once(pick.onDidAccept)(() => {
                    accepted = true;
                    const event = new terminal_1.TerminalLinkQuickPickEvent(dom_1.EventType.CLICK);
                    const activeItem = pick.activeItems?.[0];
                    if (activeItem && 'link' in activeItem) {
                        activeItem.link.activate(event, activeItem.label);
                    }
                    disposables.dispose();
                    r();
                }));
            });
        }
        /**
         * @param ignoreLinks Links with labels to not include in the picks.
         */
        async _generatePicks(links, ignoreLinks) {
            if (!links) {
                return;
            }
            const linkKeys = new Set();
            const picks = [];
            for (const link of links) {
                const label = link.text;
                if (!linkKeys.has(label) && (!ignoreLinks || !ignoreLinks.some(e => e.text === label))) {
                    linkKeys.add(label);
                    picks.push({ label, link });
                }
            }
            return picks.length > 0 ? picks : undefined;
        }
    };
    exports.TerminalLinkQuickpick = TerminalLinkQuickpick;
    exports.TerminalLinkQuickpick = TerminalLinkQuickpick = __decorate([
        __param(0, quickInput_1.IQuickInputService),
        __param(1, accessibleView_1.IAccessibleViewService)
    ], TerminalLinkQuickpick);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMaW5rUXVpY2twaWNrLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvbGlua3MvYnJvd3Nlci90ZXJtaW5hbExpbmtRdWlja3BpY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7Ozs7Ozs7Ozs7O0lBYXpGLElBQU0scUJBQXFCLEdBQTNCLE1BQU0scUJBQXNCLFNBQVEsMkJBQWU7UUFLekQsWUFDcUIsa0JBQXVELEVBQ25ELHNCQUErRDtZQUV2RixLQUFLLEVBQUUsQ0FBQztZQUg2Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1lBQ2xDLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7WUFMdkUsMkJBQXNCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLGVBQU8sRUFBUSxDQUFDLENBQUM7WUFDL0QsMEJBQXFCLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQztRQU9uRSxDQUFDO1FBRUQsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFpRTtZQUMzRSxxQkFBcUI7WUFDckIsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDN0csTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7WUFDN0csTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxX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