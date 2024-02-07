/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/hash", "vs/base/common/uri", "vs/platform/theme/common/iconRegistry", "vs/platform/theme/common/theme", "vs/base/common/themables", "vs/workbench/contrib/terminal/common/terminal", "vs/workbench/contrib/terminal/common/terminalColorRegistry", "vs/base/browser/dom", "vs/base/common/lifecycle"], function (require, exports, hash_1, uri_1, iconRegistry_1, theme_1, themables_1, terminal_1, terminalColorRegistry_1, dom_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getIconId = exports.getUriClasses = exports.getColorStyleContent = exports.createColorStyleElement = exports.getStandardColors = exports.getColorClass = void 0;
    function getColorClass(terminalOrColorKey) {
        let color = undefined;
        if (typeof terminalOrColorKey === 'string') {
            color = terminalOrColorKey;
        }
        else if (terminalOrColorKey.color) {
            color = terminalOrColorKey.color.replace(/\./g, '_');
        }
        else if (themables_1.ThemeIcon.isThemeIcon(terminalOrColorKey.icon) && terminalOrColorKey.icon.color) {
            color = terminalOrColorKey.icon.color.id.replace(/\./g, '_');
        }
        if (color) {
            return `terminal-icon-${color.replace(/\./g, '_')}`;
        }
        return undefined;
    }
    exports.getColorClass = getColorClass;
    function getStandardColors(colorTheme) {
        const standardColors = [];
        for (const colorKey in terminalColorRegistry_1.ansiColorMap) {
            const color = colorTheme.getColor(colorKey);
            if (color && !colorKey.toLowerCase().includes('bright')) {
                standardColors.push(colorKey);
            }
        }
        return standardColors;
    }
    exports.getStandardColors = getStandardColors;
    function createColorStyleElement(colorTheme) {
        const disposable = new lifecycle_1.DisposableStore();
        const standardColors = getStandardColors(colorTheme);
        const styleElement = (0, dom_1.createStyleSheet)(undefined, undefined, disposable);
        let css = '';
        for (const colorKey of standardColors) {
            const colorClass = getColorClass(colorKey);
            const color = colorTheme.getColor(colorKey);
            if (color) {
                css += (`.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon)` +
                    `{ color: ${color} !important; }`);
            }
        }
        styleElement.textContent = css;
        return disposable;
    }
    exports.createColorStyleElement = createColorStyleElement;
    function getColorStyleContent(colorTheme, editor) {
        const standardColors = getStandardColors(colorTheme);
        let css = '';
        for (const colorKey of standardColors) {
            const colorClass = getColorClass(colorKey);
            const color = colorTheme.getColor(colorKey);
            if (color) {
                if (editor) {
                    css += (`.monaco-workbench .show-file-icons .predefined-file-icon.terminal-tab.${colorClass}::before,` +
                        `.monaco-workbench .show-file-icons .file-icon.terminal-tab.${colorClass}::before` +
                        `{ color: ${color} !important; }`);
                }
                else {
                    css += (`.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon)` +
                        `{ color: ${color} !important; }`);
                }
            }
        }
        return css;
    }
    exports.getColorStyleContent = getColorStyleContent;
    function getUriClasses(terminal, colorScheme, extensionContributed) {
        const icon = terminal.icon;
        if (!icon) {
            return undefined;
        }
        const iconClasses = [];
        let uri = undefined;
        if (extensionContributed) {
            if (typeof icon === 'string' && (icon.startsWith('$(') || (0, iconRegistry_1.getIconRegistry)().getIcon(icon))) {
                return iconClasses;
            }
            else if (typeof icon === 'string') {
                uri = uri_1.URI.parse(icon);
            }
        }
        if (icon instanceof uri_1.URI) {
            uri = icon;
        }
        else if (icon instanceof Object && 'light' in icon && 'dark' in icon) {
            uri = colorScheme === theme_1.ColorScheme.LIGHT ? icon.light : icon.dark;
        }
        if (uri instanceof uri_1.URI) {
            const uriIconKey = (0, hash_1.hash)(uri.path).toString(36);
            const className = `terminal-uri-icon-${uriIconKey}`;
            iconClasses.push(className);
            iconClasses.push(`terminal-uri-icon`);
        }
        return iconClasses;
    }
    exports.getUriClasses = getUriClasses;
    function getIconId(accessor, terminal) {
        if (!terminal.icon || (terminal.icon instanceof Object && !('id' in terminal.icon))) {
            return accessor.get(terminal_1.ITerminalProfileResolverService).getDefaultIcon().id;
        }
        return typeof terminal.icon === 'string' ? terminal.icon : terminal.icon.id;
    }
    exports.getIconId = getIconId;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxJY29uLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbC9icm93c2VyL3Rlcm1pbmFsSWNvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQmhHLFNBQWdCLGFBQWEsQ0FBQyxrQkFBNkY7UUFDMUgsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDO1FBQ3RCLElBQUksT0FBTyxrQkFBa0IsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUM1QyxLQUFLLEdBQUcsa0JBQWtCLENBQUM7UUFDNUIsQ0FBQzthQUFNLElBQUksa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDckMsS0FBSyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3RELENBQUM7YUFBTSxJQUFJLHFCQUFTLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUM1RixLQUFLLEdBQUcsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBQ0QsSUFBSSxLQUFLLEVBQUUsQ0FBQztZQUNYLE9BQU8saUJBQWlCLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDckQsQ0FBQztRQUNELE9BQU8sU0FBUyxDQUFDO0lBQ2xCLENBQUM7SUFiRCxzQ0FhQztJQUVELFNBQWdCLGlCQUFpQixDQUFDLFVBQXVCO1FBQ3hELE1BQU0sY0FBYyxHQUFhLEVBQUUsQ0FBQztRQUVwQyxLQUFLLE1BQU0sUUFBUSxJQUFJLG9D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