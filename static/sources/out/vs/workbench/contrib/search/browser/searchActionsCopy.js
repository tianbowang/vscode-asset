define(["require", "exports", "vs/nls", "vs/platform/clipboard/common/clipboardService", "vs/platform/label/common/label", "vs/workbench/services/views/common/viewsService", "vs/workbench/contrib/search/common/constants", "vs/workbench/contrib/search/browser/searchModel", "vs/platform/actions/common/actions", "vs/workbench/contrib/search/browser/searchActionsBase", "vs/base/common/platform"], function (require, exports, nls, clipboardService_1, label_1, viewsService_1, Constants, searchModel_1, actions_1, searchActionsBase_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lineDelimiter = void 0;
    //#region Actions
    (0, actions_1.registerAction2)(class CopyMatchCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.CopyMatchCommandId,
                title: {
                    value: nls.localize('copyMatchLabel', "Copy"),
                    original: 'Copy'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.FileMatchOrMatchFocusKey,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 33 /* KeyCode.KeyC */,
                },
                menu: [{
                        id: actions_1.MenuId.SearchContext,
                        when: Constants.FileMatchOrMatchFocusKey,
                        group: 'search_2',
                        order: 1
                    }]
            });
        }
        async run(accessor, match) {
            await copyMatchCommand(accessor, match);
        }
    });
    (0, actions_1.registerAction2)(class CopyPathCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.CopyPathCommandId,
                title: {
                    value: nls.localize('copyPathLabel', "Copy Path"),
                    original: 'Copy Path'
                },
                category: searchActionsBase_1.category,
                keybinding: {
                    weight: 200 /* KeybindingWeight.WorkbenchContrib */,
                    when: Constants.FileMatchOrFolderMatchWithResourceFocusKey,
                    primary: 2048 /* KeyMod.CtrlCmd */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */,
                    win: {
                        primary: 1024 /* KeyMod.Shift */ | 512 /* KeyMod.Alt */ | 33 /* KeyCode.KeyC */
                    },
                },
                menu: [{
                        id: actions_1.MenuId.SearchContext,
                        when: Constants.FileMatchOrFolderMatchWithResourceFocusKey,
                        group: 'search_2',
                        order: 2
                    }]
            });
        }
        async run(accessor, fileMatch) {
            await copyPathCommand(accessor, fileMatch);
        }
    });
    (0, actions_1.registerAction2)(class CopyAllCommandAction extends actions_1.Action2 {
        constructor() {
            super({
                id: Constants.CopyAllCommandId,
                title: {
                    value: nls.localize('copyAllLabel', "Copy All"),
                    original: 'Copy All'
                },
                category: searchActionsBase_1.category,
                menu: [{
                        id: actions_1.MenuId.SearchContext,
                        when: Constants.HasSearchResults,
                        group: 'search_2',
                        order: 3
                    }]
            });
        }
        async run(accessor) {
            await copyAllCommand(accessor);
        }
    });
    //#endregion
    //#region Helpers
    exports.lineDelimiter = platform_1.isWindows ? '\r\n' : '\n';
    async function copyPathCommand(accessor, fileMatch) {
        if (!fileMatch) {
            const selection = getSelectedRow(accessor);
            if (!(selection instanceof searchModel_1.FileMatch || selection instanceof searchModel_1.FolderMatchWithResource)) {
                return;
            }
            fileMatch = selection;
        }
        const clipboardService = accessor.get(clipboardService_1.IClipboardService);
        const labelService = accessor.get(label_1.ILabelService);
        const text = labelService.getUriLabel(fileMatch.resource, { noPrefix: true });
        await clipboardService.writeText(text);
    }
    async function copyMatchCommand(accessor, match) {
        if (!match) {
            const selection = getSelectedRow(accessor);
            if (!selection) {
                return;
            }
            match = selection;
        }
        const clipboardService = accessor.get(clipboardService_1.IClipboardService);
        const labelService = accessor.get(label_1.ILabelService);
        let text;
        if (match instanceof searchModel_1.Match) {
            text = matchToString(match);
        }
        else if (match instanceof searchModel_1.FileMatch) {
            text = fileMatchToString(match, labelService).text;
        }
        else if (match instanceof searchModel_1.FolderMatch) {
            text = folderMatchToString(match, labelService).text;
        }
        if (text) {
            await clipboardService.writeText(text);
        }
    }
    async function copyAllCommand(accessor) {
        const viewsService = accessor.get(viewsService_1.IViewsService);
        const clipboardService = accessor.get(clipboardService_1.IClipboardService);
        const labelService = accessor.get(label_1.ILabelService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        if (searchView) {
            const root = searchView.searchResult;
            const text = allFolderMatchesToString(root.folderMatches(), labelService);
            await clipboardService.writeText(text);
        }
    }
    function matchToString(match, indent = 0) {
        const getFirstLinePrefix = () => `${match.range().startLineNumber},${match.range().startColumn}`;
        const getOtherLinePrefix = (i) => match.range().startLineNumber + i + '';
        const fullMatchLines = match.fullPreviewLines();
        const largestPrefixSize = fullMatchLines.reduce((largest, _, i) => {
            const thisSize = i === 0 ?
                getFirstLinePrefix().length :
                getOtherLinePrefix(i).length;
            return Math.max(thisSize, largest);
        }, 0);
        const formattedLines = fullMatchLines
            .map((line, i) => {
            const prefix = i === 0 ?
                getFirstLinePrefix() :
                getOtherLinePrefix(i);
            const paddingStr = ' '.repeat(largestPrefixSize - prefix.length);
            const indentStr = ' '.repeat(indent);
            return `${indentStr}${prefix}: ${paddingStr}${line}`;
        });
        return formattedLines.join('\n');
    }
    function fileFolderMatchToString(match, labelService) {
        if (match instanceof searchModel_1.FileMatch) {
            return fileMatchToString(match, labelService);
        }
        else {
            return folderMatchToString(match, labelService);
        }
    }
    function fileMatchToString(fileMatch, labelService) {
        const matchTextRows = fileMatch.matches()
            .sort(searchModel_1.searchMatchComparer)
            .map(match => matchToString(match, 2));
        const uriString = labelService.getUriLabel(fileMatch.resource, { noPrefix: true });
        return {
            text: `${uriString}${exports.lineDelimiter}${matchTextRows.join(exports.lineDelimiter)}`,
            count: matchTextRows.length
        };
    }
    function folderMatchToString(folderMatch, labelService) {
        const results = [];
        let numMatches = 0;
        const matches = folderMatch.matches().sort(searchModel_1.searchMatchComparer);
        matches.forEach(match => {
            const result = fileFolderMatchToString(match, labelService);
            numMatches += result.count;
            results.push(result.text);
        });
        return {
            text: results.join(exports.lineDelimiter + exports.lineDelimiter),
            count: numMatches
        };
    }
    function allFolderMatchesToString(folderMatches, labelService) {
        const folderResults = [];
        folderMatches = folderMatches.sort(searchModel_1.searchMatchComparer);
        for (let i = 0; i < folderMatches.length; i++) {
            const folderResult = folderMatchToString(folderMatches[i], labelService);
            if (folderResult.count) {
                folderResults.push(folderResult.text);
            }
        }
        return folderResults.join(exports.lineDelimiter + exports.lineDelimiter);
    }
    function getSelectedRow(accessor) {
        const viewsService = accessor.get(viewsService_1.IViewsService);
        const searchView = (0, searchActionsBase_1.getSearchView)(viewsService);
        return searchView?.getControl().getSelection()[0];
    }
});
//#endregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoQWN0aW9uc0NvcHkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9icm93c2VyL3NlYXJjaEFjdGlvbnNDb3B5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7SUFpQkEsaUJBQWlCO0lBQ2pCLElBQUEseUJBQWUsRUFBQyxNQUFNLHNCQUF1QixTQUFRLGlCQUFPO1FBRTNEO1lBRUMsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsa0JBQWtCO2dCQUNoQyxLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDO29CQUM3QyxRQUFRLEVBQUUsTUFBTTtpQkFDaEI7Z0JBQ0QsUUFBUSxFQUFSLDRCQUFRO2dCQUNSLFVBQVUsRUFBRTtvQkFDWCxNQUFNLDZDQUFtQztvQkFDekMsSUFBSSxFQUFFLFNBQVMsQ0FBQyx3QkFBd0I7b0JBQ3hDLE9BQU8sRUFBRSxpREFBNkI7aUJBQ3RDO2dCQUNELElBQUksRUFBRSxDQUFDO3dCQUNOLEVBQUUsRUFBRSxnQkFBTSxDQUFDLGFBQWE7d0JBQ3hCLElBQUksRUFBRSxTQUFTLENBQUMsd0JBQXdCO3dCQUN4QyxLQUFLLEVBQUUsVUFBVTt3QkFDakIsS0FBSyxFQUFFLENBQUM7cUJBQ1IsQ0FBQzthQUNGLENBQUMsQ0FBQztRQUVKLENBQUM7UUFFUSxLQUFLLENBQUMsR0FBRyxDQUFDLFFBQTBCLEVBQUUsS0FBa0M7WUFDaEYsTUFBTSxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekMsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLHFCQUFzQixTQUFRLGlCQUFPO1FBRTFEO1lBRUMsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsaUJBQWlCO2dCQUMvQixLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLFdBQVcsQ0FBQztvQkFDakQsUUFBUSxFQUFFLFdBQVc7aUJBQ3JCO2dCQUNELFFBQVEsRUFBUiw0QkFBUTtnQkFDUixVQUFVLEVBQUU7b0JBQ1gsTUFBTSw2Q0FBbUM7b0JBQ3pDLElBQUksRUFBRSxTQUFTLENBQUMsMENBQTBDO29CQUMxRCxPQUFPLEVBQUUsZ0RBQTJCLHdCQUFlO29CQUNuRCxHQUFHLEVBQUU7d0JBQ0osT0FBTyxFQUFFLDhDQUF5Qix3QkFBZTtxQkFDakQ7aUJBQ0Q7Z0JBQ0QsSUFBSSxFQUFFLENBQUM7d0JBQ04sRUFBRSxFQUFFLGdCQUFNLENBQUMsYUFBYTt3QkFDeEIsSUFBSSxFQUFFLFNBQVMsQ0FBQywwQ0FBMEM7d0JBQzFELEtBQUssRUFBRSxVQUFVO3dCQUNqQixLQUFLLEVBQUUsQ0FBQztxQkFDUixDQUFDO2FBQ0YsQ0FBQyxDQUFDO1FBRUosQ0FBQztRQUVRLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBMEIsRUFBRSxTQUEwRDtZQUN4RyxNQUFNLGVBQWUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDNUMsQ0FBQztLQUNELENBQUMsQ0FBQztJQUVILElBQUEseUJBQWUsRUFBQyxNQUFNLG9CQUFxQixTQUFRLGlCQUFPO1FBRXpEO1lBRUMsS0FBSyxDQUFDO2dCQUNMLEVBQUUsRUFBRSxTQUFTLENBQUMsZ0JBQWdCO2dCQUM5QixLQUFLLEVBQUU7b0JBQ04sS0FBSyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQztvQkFDL0MsUUFBUSxFQUFFLFVBQVU7aUJBQ3BCO2dCQUNELFFBQVEsRUFBUiw0QkFBUTtnQkFDUixJQUFJLEVBQUUsQ0FBQzt3QkFDTixFQUFFLEVBQUUsZ0JBQU0sQ0FBQyxhQUFhO3dCQUN4QixJQUFJLEVBQUUsU0FBUyxDQUFDLGdCQUFnQjt3QkFDaEMsS0FBSyxFQUFFLFVBQVU7d0JBQ2pCLEtBQUssRUFBRSxDQUFDO3FCQUNSLENBQUM7YUFDRixDQUFDLENBQUM7UUFFSixDQUFDO1FBRVEsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUEwQjtZQUM1QyxNQUFNLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxDQUFDO0tBQ0QsQ0FBQyxDQUFDO0lBRUgsWUFBWTtJQUVaLGlCQUFpQjtJQUNKLFFBQUEsYUFBYSxHQUFHLG9CQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBRXZELEtBQUssVUFBVSxlQUFlLENBQUMsUUFBMEIsRUFBRSxTQUEwRDtRQUNwSCxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDaEIsTUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxDQUFDLFNBQVMsWUFBWSx1QkFBUyxJQUFJLFNBQVMsWUFBWSxxQ0FBdUIsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZGLE9BQU87WUFDUixDQUFDO1lBRUQsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUN2QixDQUFDO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUM7UUFDekQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7UUFFakQsTUFBTSxJQUFJLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDOUUsTUFBTSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELEtBQUssVUFBVSxnQkFBZ0IsQ0FBQyxRQUEwQixFQUFFLEtBQWtDO1FBQzdGLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNaLE1BQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ2hCLE9BQU87WUFDUixDQUFDO1lBRUQsS0FBSyxHQUFHLFNBQVMsQ0FBQztRQUNuQixDQUFDO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLG9DQUFpQixDQUFDLENBQUM7UUFDekQsTUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxxQkFBYSxDQUFDLENBQUM7UUFFakQsSUFBSSxJQUF3QixDQUFDO1FBQzdCLElBQUksS0FBSyxZQUFZLG1CQUFLLEVBQUUsQ0FBQztZQUM1QixJQUFJLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzdCLENBQUM7YUFBTSxJQUFJLEtBQUssWUFBWSx1QkFBUyxFQUFFLENBQUM7WUFDdkMsSUFBSSxHQUFHLGlCQUFpQixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDcEQsQ0FBQzthQUFNLElBQUksS0FBSyxZQUFZLHlCQUFXLEVBQUUsQ0FBQztZQUN6QyxJQUFJLEdBQUcsbUJBQW1CLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQztRQUN0RCxDQUFDO1FBRUQsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNWLE1BQU0sZ0JBQWdCLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hDLENBQUM7SUFDRixDQUFDO0lBRUQsS0FBSyxVQUFVLGNBQWMsQ0FBQyxRQUEwQjtRQUN2RCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDRCQUFhLENBQUMsQ0FBQztRQUNqRCxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0NBQWlCLENBQUMsQ0FBQztRQUN6RCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFhLENBQUMsQ0FBQztRQUVqRCxNQUFNLFVBQVUsR0FBRyxJQUFBLGlDQUFhLEVBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0MsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUNoQixNQUFNLElBQUksR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDO1lBRXJDLE1BQU0sSUFBSSxHQUFHLHdCQUF3QixDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUMxRSxNQUFNLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QyxDQUFDO0lBQ0YsQ0FBQztJQUVELFNBQVMsYUFBYSxDQUFDLEtBQVksRUFBRSxNQUFNLEdBQUcsQ0FBQztRQUM5QyxNQUFNLGtCQUFrQixHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLGVBQWUsSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakcsTUFBTSxrQkFBa0IsR0FBRyxDQUFDLENBQVMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDLGVBQWUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRWpGLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ2hELE1BQU0saUJBQWlCLEdBQUcsY0FBYyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDakUsTUFBTSxRQUFRLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixrQkFBa0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3QixrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7WUFFOUIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFFTixNQUFNLGNBQWMsR0FBRyxjQUFjO2FBQ25DLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUNoQixNQUFNLE1BQU0sR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZCLGtCQUFrQixFQUFFLENBQUMsQ0FBQztnQkFDdEIsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFdkIsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDakUsTUFBTSxTQUFTLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQyxPQUFPLEdBQUcsU0FBUyxHQUFHLE1BQU0sS0FBSyxVQUFVLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDdEQsQ0FBQyxDQUFDLENBQUM7UUFFSixPQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELFNBQVMsdUJBQXVCLENBQUMsS0FBd0QsRUFBRSxZQUEyQjtRQUNySCxJQUFJLEtBQUssWUFBWSx1QkFBUyxFQUFFLENBQUM7WUFDaEMsT0FBTyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDL0MsQ0FBQzthQUFNLENBQUM7WUFDUCxPQUFPLG1CQUFtQixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztRQUNqRCxDQUFDO0lBQ0YsQ0FBQztJQUVELFNBQVMsaUJBQWlCLENBQUMsU0FBb0IsRUFBRSxZQUEyQjtRQUMzRSxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUMsT0FBTyxFQUFFO2FBQ3ZDLElBQUksQ0FBQyxpQ0FBbUIsQ0FBQzthQUN6QixHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEMsTUFBTSxTQUFTLEdBQUcsWUFBWSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDbkYsT0FBTztZQUNOLElBQUksRUFBRSxHQUFHLFNBQVMsR0FBRyxxQkFBYSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMscUJBQWEsQ0FBQyxFQUFFO1lBQ3hFLEtBQUssRUFBRSxhQUFhLENBQUMsTUFBTTtTQUMzQixDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQVMsbUJBQW1CLENBQUMsV0FBa0QsRUFBRSxZQUEyQjtRQUMzRyxNQUFNLE9BQU8sR0FBYSxFQUFFLENBQUM7UUFDN0IsSUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO1FBRW5CLE1BQU0sT0FBTyxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUNBQW1CLENBQUMsQ0FBQztRQUVoRSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3ZCLE1BQU0sTUFBTSxHQUFHLHVCQUF1QixDQUFDLEtBQUssRUFBRSxZQUFZLENBQUMsQ0FBQztZQUM1RCxVQUFVLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztZQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUMsQ0FBQztRQUVILE9BQU87WUFDTixJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxxQkFBYSxHQUFHLHFCQUFhLENBQUM7WUFDakQsS0FBSyxFQUFFLFVBQVU7U0FDakIsQ0FBQztJQUNILENBQUM7SUFFRCxTQUFTLHdCQUF3QixDQUFDLGFBQTJELEVBQUUsWUFBMkI7UUFDekgsTUFBTSxhQUFhLEdBQWEsRUFBRSxDQUFDO1FBQ25DLGFBQWEsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLGlDQUFtQixDQUFDLENBQUM7UUFDeEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUMvQyxNQUFNLFlBQVksR0FBRyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDekUsSUFBSSxZQUFZLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ3hCLGFBQWEsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7UUFDRixDQUFDO1FBRUQsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLHFCQUFhLEdBQUcscUJBQWEsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxTQUFTLGNBQWMsQ0FBQyxRQUEwQjtRQUNqRCxNQUFNLFlBQVksR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLDRCQUFhLENBQUMsQ0FBQztRQUNqRCxNQUFNLFVBQVUsR0FBRyxJQUFBLGlDQUFhLEVBQUMsWUFBWSxDQUFDLENBQUM7UUFDL0MsT0FBTyxVQUFVLEVBQUUsVUFBVSxFQUFFLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkQsQ0FBQzs7QUFFRCxZQUFZIn0=