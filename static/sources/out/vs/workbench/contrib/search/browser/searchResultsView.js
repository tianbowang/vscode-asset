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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/countBadge/countBadge", "vs/base/common/lifecycle", "vs/base/common/path", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/label/common/label", "vs/platform/workspace/common/workspace", "vs/workbench/contrib/search/browser/searchModel", "vs/base/common/resources", "vs/platform/actions/common/actions", "vs/platform/instantiation/common/instantiation", "vs/platform/actions/browser/toolbar", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/serviceCollection", "vs/workbench/contrib/search/common/constants", "vs/platform/theme/browser/defaultStyles"], function (require, exports, DOM, countBadge_1, lifecycle_1, paths, nls, configuration_1, files_1, label_1, workspace_1, searchModel_1, resources_1, actions_1, instantiation_1, toolbar_1, contextkey_1, serviceCollection_1, constants_1, defaultStyles_1) {
    "use strict";
    var FolderMatchRenderer_1, FileMatchRenderer_1, MatchRenderer_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SearchAccessibilityProvider = exports.MatchRenderer = exports.FileMatchRenderer = exports.FolderMatchRenderer = exports.SearchDelegate = void 0;
    class SearchDelegate {
        static { this.ITEM_HEIGHT = 22; }
        getHeight(element) {
            return SearchDelegate.ITEM_HEIGHT;
        }
        getTemplateId(element) {
            if (element instanceof searchModel_1.FolderMatch) {
                return FolderMatchRenderer.TEMPLATE_ID;
            }
            else if (element instanceof searchModel_1.FileMatch) {
                return FileMatchRenderer.TEMPLATE_ID;
            }
            else if (element instanceof searchModel_1.Match) {
                return MatchRenderer.TEMPLATE_ID;
            }
            console.error('Invalid search tree element', element);
            throw new Error('Invalid search tree element');
        }
    }
    exports.SearchDelegate = SearchDelegate;
    let FolderMatchRenderer = class FolderMatchRenderer extends lifecycle_1.Disposable {
        static { FolderMatchRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'folderMatch'; }
        constructor(searchView, labels, contextService, labelService, instantiationService, contextKeyService) {
            super();
            this.searchView = searchView;
            this.labels = labels;
            this.contextService = contextService;
            this.labelService = labelService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.templateId = FolderMatchRenderer_1.TEMPLATE_ID;
        }
        renderCompressedElements(node, index, templateData, height) {
            const compressed = node.element;
            const folder = compressed.elements[compressed.elements.length - 1];
            const label = compressed.elements.map(e => e.name());
            if (folder.resource) {
                const fileKind = (folder instanceof searchModel_1.FolderMatchWorkspaceRoot) ? files_1.FileKind.ROOT_FOLDER : files_1.FileKind.FOLDER;
                templateData.label.setResource({ resource: folder.resource, name: label }, {
                    fileKind,
                    separator: this.labelService.getSeparator(folder.resource.scheme),
                });
            }
            else {
                templateData.label.setLabel(nls.localize('searchFolderMatch.other.label', "Other files"));
            }
            this.renderFolderDetails(folder, templateData);
        }
        renderTemplate(container) {
            const disposables = new lifecycle_1.DisposableStore();
            const folderMatchElement = DOM.append(container, DOM.$('.foldermatch'));
            const label = this.labels.create(folderMatchElement, { supportDescriptionHighlights: true, supportHighlights: true });
            disposables.add(label);
            const badge = new countBadge_1.CountBadge(DOM.append(folderMatchElement, DOM.$('.badge')), {}, defaultStyles_1.defaultCountBadgeStyles);
            const actionBarContainer = DOM.append(folderMatchElement, DOM.$('.actionBarContainer'));
            const elementDisposables = new lifecycle_1.DisposableStore();
            disposables.add(elementDisposables);
            const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container));
            constants_1.MatchFocusKey.bindTo(contextKeyServiceMain).set(false);
            constants_1.FileFocusKey.bindTo(contextKeyServiceMain).set(false);
            constants_1.FolderFocusKey.bindTo(contextKeyServiceMain).set(true);
            const instantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyServiceMain]));
            const actions = disposables.add(instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, actionBarContainer, actions_1.MenuId.SearchActionMenu, {
                menuOptions: {
                    shouldForwardArgs: true
                },
                hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
                toolbarOptions: {
                    primaryGroup: (g) => /^inline/.test(g),
                },
            }));
            return {
                label,
                badge,
                actions,
                disposables,
                elementDisposables,
                contextKeyService: contextKeyServiceMain
            };
        }
        renderElement(node, index, templateData) {
            const folderMatch = node.element;
            if (folderMatch.resource) {
                const workspaceFolder = this.contextService.getWorkspaceFolder(folderMatch.resource);
                if (workspaceFolder && (0, resources_1.isEqual)(workspaceFolder.uri, folderMatch.resource)) {
                    templateData.label.setFile(folderMatch.resource, { fileKind: files_1.FileKind.ROOT_FOLDER, hidePath: true });
                }
                else {
                    templateData.label.setFile(folderMatch.resource, { fileKind: files_1.FileKind.FOLDER, hidePath: this.searchView.isTreeLayoutViewVisible });
                }
            }
            else {
                templateData.label.setLabel(nls.localize('searchFolderMatch.other.label', "Other files"));
            }
            constants_1.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!folderMatch.hasOnlyReadOnlyMatches());
            templateData.elementDisposables.add(folderMatch.onChange(() => {
                constants_1.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!folderMatch.hasOnlyReadOnlyMatches());
            }));
            this.renderFolderDetails(folderMatch, templateData);
        }
        disposeElement(element, index, templateData) {
            templateData.elementDisposables.clear();
        }
        disposeCompressedElements(node, index, templateData, height) {
            templateData.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
        renderFolderDetails(folder, templateData) {
            const count = folder.recursiveMatchCount();
            templateData.badge.setCount(count);
            templateData.badge.setTitleFormat(count > 1 ? nls.localize('searchFileMatches', "{0} files found", count) : nls.localize('searchFileMatch', "{0} file found", count));
            templateData.actions.context = { viewer: this.searchView.getControl(), element: folder };
        }
    };
    exports.FolderMatchRenderer = FolderMatchRenderer;
    exports.FolderMatchRenderer = FolderMatchRenderer = FolderMatchRenderer_1 = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, label_1.ILabelService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, contextkey_1.IContextKeyService)
    ], FolderMatchRenderer);
    let FileMatchRenderer = class FileMatchRenderer extends lifecycle_1.Disposable {
        static { FileMatchRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'fileMatch'; }
        constructor(searchView, labels, contextService, configurationService, instantiationService, contextKeyService) {
            super();
            this.searchView = searchView;
            this.labels = labels;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.templateId = FileMatchRenderer_1.TEMPLATE_ID;
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Should never happen since node is incompressible.');
        }
        renderTemplate(container) {
            const disposables = new lifecycle_1.DisposableStore();
            const elementDisposables = new lifecycle_1.DisposableStore();
            disposables.add(elementDisposables);
            const fileMatchElement = DOM.append(container, DOM.$('.filematch'));
            const label = this.labels.create(fileMatchElement);
            disposables.add(label);
            const badge = new countBadge_1.CountBadge(DOM.append(fileMatchElement, DOM.$('.badge')), {}, defaultStyles_1.defaultCountBadgeStyles);
            const actionBarContainer = DOM.append(fileMatchElement, DOM.$('.actionBarContainer'));
            const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container));
            constants_1.MatchFocusKey.bindTo(contextKeyServiceMain).set(false);
            constants_1.FileFocusKey.bindTo(contextKeyServiceMain).set(true);
            constants_1.FolderFocusKey.bindTo(contextKeyServiceMain).set(false);
            const instantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyServiceMain]));
            const actions = disposables.add(instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, actionBarContainer, actions_1.MenuId.SearchActionMenu, {
                menuOptions: {
                    shouldForwardArgs: true
                },
                hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
                toolbarOptions: {
                    primaryGroup: (g) => /^inline/.test(g),
                },
            }));
            return {
                el: fileMatchElement,
                label,
                badge,
                actions,
                disposables,
                elementDisposables,
                contextKeyService: contextKeyServiceMain
            };
        }
        renderElement(node, index, templateData) {
            const fileMatch = node.element;
            templateData.el.setAttribute('data-resource', fileMatch.resource.toString());
            const decorationConfig = this.configurationService.getValue('search').decorations;
            templateData.label.setFile(fileMatch.resource, { hidePath: this.searchView.isTreeLayoutViewVisible && !(fileMatch.parent() instanceof searchModel_1.FolderMatchNoRoot), hideIcon: false, fileDecorations: { colors: decorationConfig.colors, badges: decorationConfig.badges } });
            const count = fileMatch.count();
            templateData.badge.setCount(count);
            templateData.badge.setTitleFormat(count > 1 ? nls.localize('searchMatches', "{0} matches found", count) : nls.localize('searchMatch', "{0} match found", count));
            templateData.actions.context = { viewer: this.searchView.getControl(), element: fileMatch };
            constants_1.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!fileMatch.hasOnlyReadOnlyMatches());
            templateData.elementDisposables.add(fileMatch.onChange(() => {
                constants_1.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!fileMatch.hasOnlyReadOnlyMatches());
            }));
            // when hidesExplorerArrows: true, then the file nodes should still have a twistie because it would otherwise
            // be hard to tell whether the node is collapsed or expanded.
            const twistieContainer = templateData.el.parentElement?.parentElement?.querySelector('.monaco-tl-twistie');
            twistieContainer?.classList.add('force-twistie');
        }
        disposeElement(element, index, templateData) {
            templateData.elementDisposables.clear();
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
    };
    exports.FileMatchRenderer = FileMatchRenderer;
    exports.FileMatchRenderer = FileMatchRenderer = FileMatchRenderer_1 = __decorate([
        __param(2, workspace_1.IWorkspaceContextService),
        __param(3, configuration_1.IConfigurationService),
        __param(4, instantiation_1.IInstantiationService),
        __param(5, contextkey_1.IContextKeyService)
    ], FileMatchRenderer);
    let MatchRenderer = class MatchRenderer extends lifecycle_1.Disposable {
        static { MatchRenderer_1 = this; }
        static { this.TEMPLATE_ID = 'match'; }
        constructor(searchView, contextService, configurationService, instantiationService, contextKeyService) {
            super();
            this.searchView = searchView;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.instantiationService = instantiationService;
            this.contextKeyService = contextKeyService;
            this.templateId = MatchRenderer_1.TEMPLATE_ID;
        }
        renderCompressedElements(node, index, templateData, height) {
            throw new Error('Should never happen since node is incompressible.');
        }
        renderTemplate(container) {
            container.classList.add('linematch');
            const lineNumber = DOM.append(container, DOM.$('span.matchLineNum'));
            const parent = DOM.append(container, DOM.$('a.plain.match'));
            const before = DOM.append(parent, DOM.$('span'));
            const match = DOM.append(parent, DOM.$('span.findInFileMatch'));
            const replace = DOM.append(parent, DOM.$('span.replaceMatch'));
            const after = DOM.append(parent, DOM.$('span'));
            const actionBarContainer = DOM.append(container, DOM.$('span.actionBarContainer'));
            const disposables = new lifecycle_1.DisposableStore();
            const contextKeyServiceMain = disposables.add(this.contextKeyService.createScoped(container));
            constants_1.MatchFocusKey.bindTo(contextKeyServiceMain).set(true);
            constants_1.FileFocusKey.bindTo(contextKeyServiceMain).set(false);
            constants_1.FolderFocusKey.bindTo(contextKeyServiceMain).set(false);
            const instantiationService = this.instantiationService.createChild(new serviceCollection_1.ServiceCollection([contextkey_1.IContextKeyService, contextKeyServiceMain]));
            const actions = disposables.add(instantiationService.createInstance(toolbar_1.MenuWorkbenchToolBar, actionBarContainer, actions_1.MenuId.SearchActionMenu, {
                menuOptions: {
                    shouldForwardArgs: true
                },
                hiddenItemStrategy: 0 /* HiddenItemStrategy.Ignore */,
                toolbarOptions: {
                    primaryGroup: (g) => /^inline/.test(g),
                },
            }));
            return {
                parent,
                before,
                match,
                replace,
                after,
                lineNumber,
                actions,
                disposables,
                contextKeyService: contextKeyServiceMain
            };
        }
        renderElement(node, index, templateData) {
            const match = node.element;
            const preview = match.preview();
            const replace = this.searchView.model.isReplaceActive() &&
                !!this.searchView.model.replaceString &&
                !(match instanceof searchModel_1.MatchInNotebook && match.isReadonly());
            templateData.before.textContent = preview.before;
            templateData.match.textContent = preview.inside;
            templateData.match.classList.toggle('replace', replace);
            templateData.replace.textContent = replace ? match.replaceString : '';
            templateData.after.textContent = preview.after;
            templateData.parent.title = (preview.fullBefore + (replace ? match.replaceString : preview.inside) + preview.after).trim().substr(0, 999);
            constants_1.IsEditableItemKey.bindTo(templateData.contextKeyService).set(!(match instanceof searchModel_1.MatchInNotebook && match.isReadonly()));
            const numLines = match.range().endLineNumber - match.range().startLineNumber;
            const extraLinesStr = numLines > 0 ? `+${numLines}` : '';
            const showLineNumbers = this.configurationService.getValue('search').showLineNumbers;
            const lineNumberStr = showLineNumbers ? `${match.range().startLineNumber}:` : '';
            templateData.lineNumber.classList.toggle('show', (numLines > 0) || showLineNumbers);
            templateData.lineNumber.textContent = lineNumberStr + extraLinesStr;
            templateData.lineNumber.setAttribute('title', this.getMatchTitle(match, showLineNumbers));
            templateData.actions.context = { viewer: this.searchView.getControl(), element: match };
        }
        disposeTemplate(templateData) {
            templateData.disposables.dispose();
        }
        getMatchTitle(match, showLineNumbers) {
            const startLine = match.range().startLineNumber;
            const numLines = match.range().endLineNumber - match.range().startLineNumber;
            const lineNumStr = showLineNumbers ?
                nls.localize('lineNumStr', "From line {0}", startLine, numLines) + ' ' :
                '';
            const numLinesStr = numLines > 0 ?
                '+ ' + nls.localize('numLinesStr', "{0} more lines", numLines) :
                '';
            return lineNumStr + numLinesStr;
        }
    };
    exports.MatchRenderer = MatchRenderer;
    exports.MatchRenderer = MatchRenderer = MatchRenderer_1 = __decorate([
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, instantiation_1.IInstantiationService),
        __param(4, contextkey_1.IContextKeyService)
    ], MatchRenderer);
    let SearchAccessibilityProvider = class SearchAccessibilityProvider {
        constructor(searchView, labelService) {
            this.searchView = searchView;
            this.labelService = labelService;
        }
        getWidgetAriaLabel() {
            return nls.localize('search', "Search");
        }
        getAriaLabel(element) {
            if (element instanceof searchModel_1.FolderMatch) {
                const count = element.allDownstreamFileMatches().reduce((total, current) => total + current.count(), 0);
                return element.resource ?
                    nls.localize('folderMatchAriaLabel', "{0} matches in folder root {1}, Search result", count, element.name()) :
                    nls.localize('otherFilesAriaLabel', "{0} matches outside of the workspace, Search result", count);
            }
            if (element instanceof searchModel_1.FileMatch) {
                const path = this.labelService.getUriLabel(element.resource, { relative: true }) || element.resource.fsPath;
                return nls.localize('fileMatchAriaLabel', "{0} matches in file {1} of folder {2}, Search result", element.count(), element.name(), paths.dirname(path));
            }
            if (element instanceof searchModel_1.Match) {
                const match = element;
                const searchModel = this.searchView.model;
                const replace = searchModel.isReplaceActive() && !!searchModel.replaceString;
                const matchString = match.getMatchString();
                const range = match.range();
                const matchText = match.text().substr(0, range.endColumn + 150);
                if (replace) {
                    return nls.localize('replacePreviewResultAria', "'{0}' at column {1} replace {2} with {3}", matchText, range.startColumn, matchString, match.replaceString);
                }
                return nls.localize('searchResultAria', "'{0}' at column {1} found {2}", matchText, range.startColumn, matchString);
            }
            return null;
        }
    };
    exports.SearchAccessibilityProvider = SearchAccessibilityProvider;
    exports.SearchAccessibilityProvider = SearchAccessibilityProvider = __decorate([
        __param(1, label_1.ILabelService)
    ], SearchAccessibilityProvider);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoUmVzdWx0c1ZpZXcuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3NlYXJjaC9icm93c2VyL3NlYXJjaFJlc3VsdHNWaWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7Ozs7SUE2RGhHLE1BQWEsY0FBYztpQkFFWixnQkFBVyxHQUFHLEVBQUUsQ0FBQztRQUUvQixTQUFTLENBQUMsT0FBd0I7WUFDakMsT0FBTyxjQUFjLENBQUMsV0FBVyxDQUFDO1FBQ25DLENBQUM7UUFFRCxhQUFhLENBQUMsT0FBd0I7WUFDckMsSUFBSSxPQUFPLFlBQVkseUJBQVcsRUFBRSxDQUFDO2dCQUNwQyxPQUFPLG1CQUFtQixDQUFDLFdBQVcsQ0FBQztZQUN4QyxDQUFDO2lCQUFNLElBQUksT0FBTyxZQUFZLHVCQUFTLEVBQUUsQ0FBQztnQkFDekMsT0FBTyxpQkFBaUIsQ0FBQyxXQUFXLENBQUM7WUFDdEMsQ0FBQztpQkFBTSxJQUFJLE9BQU8sWUFBWSxtQkFBSyxFQUFFLENBQUM7Z0JBQ3JDLE9BQU8sYUFBYSxDQUFDLFdBQVcsQ0FBQztZQUNsQyxDQUFDO1lBRUQsT0FBTyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUN0RCxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixDQUFDLENBQUM7UUFDaEQsQ0FBQzs7SUFuQkYsd0NBb0JDO0lBQ00sSUFBTSxtQkFBbUIsR0FBekIsTUFBTSxtQkFBb0IsU0FBUSxzQkFBVTs7aUJBQ2xDLGdCQUFXLEdBQUcsYUFBYSxBQUFoQixDQUFpQjtRQUk1QyxZQUNTLFVBQXNCLEVBQ3RCLE1BQXNCLEVBQ0osY0FBa0QsRUFDN0QsWUFBNEMsRUFDcEMsb0JBQTRELEVBQy9ELGlCQUFzRDtZQUUxRSxLQUFLLEVBQUUsQ0FBQztZQVBB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