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
define(["require", "exports", "vs/base/browser/dom", "vs/base/browser/ui/list/listWidget", "vs/base/browser/ui/tree/abstractTree", "vs/base/common/iterator", "vs/nls", "vs/platform/configuration/common/configuration", "vs/platform/contextkey/common/contextkey", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/theme/browser/defaultStyles", "vs/platform/theme/common/colorRegistry", "vs/workbench/contrib/preferences/browser/settingsTree", "vs/workbench/contrib/preferences/browser/settingsTreeModels", "vs/workbench/contrib/preferences/common/settingsEditorColorRegistry", "vs/workbench/services/environment/common/environmentService"], function (require, exports, DOM, listWidget_1, abstractTree_1, iterator_1, nls_1, configuration_1, contextkey_1, instantiation_1, listService_1, defaultStyles_1, colorRegistry_1, settingsTree_1, settingsTreeModels_1, settingsEditorColorRegistry_1, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TOCTree = exports.createTOCIterator = exports.TOCRenderer = exports.TOCTreeModel = void 0;
    const $ = DOM.$;
    let TOCTreeModel = class TOCTreeModel {
        constructor(_viewState, environmentService) {
            this._viewState = _viewState;
            this.environmentService = environmentService;
            this._currentSearchModel = null;
        }
        get settingsTreeRoot() {
            return this._settingsTreeRoot;
        }
        set settingsTreeRoot(value) {
            this._settingsTreeRoot = value;
            this.update();
        }
        get currentSearchModel() {
            return this._currentSearchModel;
        }
        set currentSearchModel(model) {
            this._currentSearchModel = model;
            this.update();
        }
        get children() {
            return this._settingsTreeRoot.children;
        }
        update() {
            if (this._settingsTreeRoot) {
                this.updateGroupCount(this._settingsTreeRoot);
            }
        }
        updateGroupCount(group) {
            group.children.forEach(child => {
                if (child instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                    this.updateGroupCount(child);
                }
            });
            const childCount = group.children
                .filter(child => child instanceof settingsTreeModels_1.SettingsTreeGroupElement)
                .reduce((acc, cur) => acc + cur.count, 0);
            group.count = childCount + this.getGroupCount(group);
        }
        getGroupCount(group) {
            return group.children.filter(child => {
                if (!(child instanceof settingsTreeModels_1.SettingsTreeSettingElement)) {
                    return false;
                }
                if (this._currentSearchModel && !this._currentSearchModel.root.containsSetting(child.setting.key)) {
                    return false;
                }
                // Check everything that the SettingsFilter checks except whether it's filtered by a category
                const isRemote = !!this.environmentService.remoteAuthority;
                return child.matchesScope(this._viewState.settingsTarget, isRemote) &&
                    child.matchesAllTags(this._viewState.tagFilters) &&
                    child.matchesAnyFeature(this._viewState.featureFilters) &&
                    child.matchesAnyExtension(this._viewState.extensionFilters) &&
                    child.matchesAnyId(this._viewState.idFilters);
            }).length;
        }
    };
    exports.TOCTreeModel = TOCTreeModel;
    exports.TOCTreeModel = TOCTreeModel = __decorate([
        __param(1, environmentService_1.IWorkbenchEnvironmentService)
    ], TOCTreeModel);
    const TOC_ENTRY_TEMPLATE_ID = 'settings.toc.entry';
    class TOCRenderer {
        constructor() {
            this.templateId = TOC_ENTRY_TEMPLATE_ID;
        }
        renderTemplate(container) {
            return {
                labelElement: DOM.append(container, $('.settings-toc-entry')),
                countElement: DOM.append(container, $('.settings-toc-count'))
            };
        }
        renderElement(node, index, template) {
            const element = node.element;
            const count = element.count;
            const label = element.label;
            template.labelElement.textContent = label;
            template.labelElement.title = label;
            if (count) {
                template.countElement.textContent = ` (${count})`;
            }
            else {
                template.countElement.textContent = '';
            }
        }
        disposeTemplate(templateData) {
        }
    }
    exports.TOCRenderer = TOCRenderer;
    class TOCTreeDelegate {
        getTemplateId(element) {
            return TOC_ENTRY_TEMPLATE_ID;
        }
        getHeight(element) {
            return 22;
        }
    }
    function createTOCIterator(model, tree) {
        const groupChildren = model.children.filter(c => c instanceof settingsTreeModels_1.SettingsTreeGroupElement);
        return iterator_1.Iterable.map(groupChildren, g => {
            const hasGroupChildren = g.children.some(c => c instanceof settingsTreeModels_1.SettingsTreeGroupElement);
            return {
                element: g,
                collapsed: undefined,
                collapsible: hasGroupChildren,
                children: g instanceof settingsTreeModels_1.SettingsTreeGroupElement ?
                    createTOCIterator(g, tree) :
                    undefined
            };
        });
    }
    exports.createTOCIterator = createTOCIterator;
    class SettingsAccessibilityProvider {
        getWidgetAriaLabel() {
            return (0, nls_1.localize)({
                key: 'settingsTOC',
                comment: ['A label for the table of contents for the full settings list']
            }, "Settings Table of Contents");
        }
        getAriaLabel(element) {
            if (!element) {
                return '';
            }
            if (element instanceof settingsTreeModels_1.SettingsTreeGroupElement) {
                return (0, nls_1.localize)('groupRowAriaLabel', "{0}, group", element.label);
            }
            return '';
        }
        getAriaLevel(element) {
            let i = 1;
            while (element instanceof settingsTreeModels_1.SettingsTreeGroupElement && element.parent) {
                i++;
                element = element.parent;
            }
            return i;
        }
    }
    let TOCTree = class TOCTree extends listService_1.WorkbenchObjectTree {
        constructor(container, viewState, contextKeyService, listService, configurationService, instantiationService) {
            // test open mode
            const filter = instantiationService.createInstance(settingsTree_1.SettingsTreeFilter, viewState);
            const options = {
                filter,
                multipleSelectionSupport: false,
                identityProvider: {
                    getId(e) {
                        return e.id;
                    }
                },
                styleController: id => new listWidget_1.DefaultStyleController(DOM.createStyleSheet(container), id),
                accessibilityProvider: instantiationService.createInstance(SettingsAccessibilityProvider),
                collapseByDefault: true,
                horizontalScrolling: false,
                hideTwistiesOfChildlessElements: true,
                renderIndentGuides: abstractTree_1.RenderIndentGuides.None
            };
            super('SettingsTOC', container, new TOCTreeDelegate(), [new TOCRenderer()], options, instantiationService, contextKeyService, listService, configurationService);
            this.style((0, defaultStyles_1.getListStyles)({
                listBackground: colorRegistry_1.editorBackground,
                listFocusOutline: colorRegistry_1.focusBorder,
                listActiveSelectionBackground: colorRegistry_1.editorBackground,
                listActiveSelectionForeground: settingsEditorColorRegistry_1.settingsHeaderForeground,
                listFocusAndSelectionBackground: colorRegistry_1.editorBackground,
                listFocusAndSelectionForeground: settingsEditorColorRegistry_1.settingsHeaderForeground,
                listFocusBackground: colorRegistry_1.editorBackground,
                listFocusForeground: settingsEditorColorRegistry_1.settingsHeaderHoverForeground,
                listHoverForeground: settingsEditorColorRegistry_1.settingsHeaderHoverForeground,
                listHoverBackground: colorRegistry_1.editorBackground,
                listInactiveSelectionBackground: colorRegistry_1.editorBackground,
                listInactiveSelectionForeground: settingsEditorColorRegistry_1.settingsHeaderForeground,
                listInactiveFocusBackground: colorRegistry_1.editorBackground,
                listInactiveFocusOutline: colorRegistry_1.editorBackground,
                treeIndentGuidesStroke: undefined,
                treeInactiveIndentGuidesStroke: undefined
            }));
        }
    };
    exports.TOCTree = TOCTree;
    exports.TOCTree = TOCTree = __decorate([
        __param(2, contextkey_1.IContextKeyService),
        __param(3, listService_1.IListService),
        __param(4, configuration_1.IConfigurationService),
        __param(5, instantiation_1.IInstantiationService)
    ], TOCTree);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9jVHJlZS5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvcHJlZmVyZW5jZXMvYnJvd3Nlci90b2NUcmVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7Ozs7Ozs7Ozs7OztJQW9CaEcsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUVULElBQU0sWUFBWSxHQUFsQixNQUFNLFlBQVk7UUFLeEIsWUFDUyxVQUFvQyxFQUNkLGtCQUF3RDtZQUQ5RSxlQUFVLEdBQVYsVUFBVSxDQUEwQjtZQUNOLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBOEI7WUFML0Usd0JBQW1CLEdBQTZCLElBQUksQ0FBQztRQU83RCxDQUFDO1FBRUQsSUFBSSxnQkFBZ0I7WUFDbkIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7UUFDL0IsQ0FBQztRQUVELElBQUksZ0JBQWdCLENBQUMsS0FBK0I7WUFDbkQsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztZQUMvQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixDQUFDO1FBRUQsSUFBSSxrQkFBa0I7WUFDckIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUM7UUFDakMsQ0FBQztRQUVELElBQUksa0JBQWtCLENBQUMsS0FBK0I7WUFDckQsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztZQUNqQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZixDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1gsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDO1FBQ3hDLENBQUM7UUFFRCxNQUFNO1lBQ0wsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxpQkFB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