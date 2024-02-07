/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/themables", "vs/platform/theme/common/iconRegistry"], function (require, exports, dom_1, event_1, lifecycle_1, themables_1, iconRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.UnthemedProductIconTheme = exports.getIconsStyleSheet = void 0;
    function getIconsStyleSheet(themeService) {
        const disposable = new lifecycle_1.DisposableStore();
        const onDidChangeEmmiter = disposable.add(new event_1.Emitter());
        const iconRegistry = (0, iconRegistry_1.getIconRegistry)();
        disposable.add(iconRegistry.onDidChange(() => onDidChangeEmmiter.fire()));
        if (themeService) {
            disposable.add(themeService.onDidProductIconThemeChange(() => onDidChangeEmmiter.fire()));
        }
        return {
            dispose: () => disposable.dispose(),
            onDidChange: onDidChangeEmmiter.event,
            getCSS() {
                const productIconTheme = themeService ? themeService.getProductIconTheme() : new UnthemedProductIconTheme();
                const usedFontIds = {};
                const formatIconRule = (contribution) => {
                    const definition = productIconTheme.getIcon(contribution);
                    if (!definition) {
                        return undefined;
                    }
                    const fontContribution = definition.font;
                    if (fontContribution) {
                        usedFontIds[fontContribution.id] = fontContribution.definition;
                        return `.codicon-${contribution.id}:before { content: '${definition.fontCharacter}'; font-family: ${(0, dom_1.asCSSPropertyValue)(fontContribution.id)}; }`;
                    }
                    // default font (codicon)
                    return `.codicon-${contribution.id}:before { content: '${definition.fontCharacter}'; }`;
                };
                const rules = [];
                for (const contribution of iconRegistry.getIcons()) {
                    const rule = formatIconRule(contribution);
                    if (rule) {
                        rules.push(rule);
                    }
                }
                for (const id in usedFontIds) {
                    const definition = usedFontIds[id];
                    const fontWeight = definition.weight ? `font-weight: ${definition.weight};` : '';
                    const fontStyle = definition.style ? `font-style: ${definition.style};` : '';
                    const src = definition.src.map(l => `${(0, dom_1.asCSSUrl)(l.location)} format('${l.format}')`).join(', ');
                    rules.push(`@font-face { src: ${src}; font-family: ${(0, dom_1.asCSSPropertyValue)(id)};${fontWeight}${fontStyle} font-display: block; }`);
                }
                return rules.join('\n');
            }
        };
    }
    exports.getIconsStyleSheet = getIconsStyleSheet;
    class UnthemedProductIconTheme {
        getIcon(contribution) {
            const iconRegistry = (0, iconRegistry_1.getIconRegistry)();
            let definition = contribution.defaults;
            while (themables_1.ThemeIcon.isThemeIcon(definition)) {
                const c = iconRegistry.getIcon(definition.id);
                if (!c) {
                    return undefined;
                }
                definition = c.defaults;
            }
            return definition;
        }
    }
    exports.UnthemedProductIconTheme = UnthemedProductIconTheme;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWNvbnNTdHlsZVNoZWV0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS90aGVtZS9icm93c2VyL2ljb25zU3R5bGVTaGVldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFjaEcsU0FBZ0Isa0JBQWtCLENBQUMsWUFBdUM7UUFDekUsTUFBTSxVQUFVLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFFekMsTUFBTSxrQkFBa0IsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksZUFBTyxFQUFRLENBQUMsQ0FBQztRQUMvRCxNQUFNLFlBQVksR0FBRyxJQUFBLDhCQUFlLEdBQUUsQ0FBQztRQUN2QyxVQUFVLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzFFLElBQUksWUFBWSxFQUFFLENBQUM7WUFDbEIsVUFBVSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsMkJBQTJCLENBQUMsR0FBRyxFQUFFLENBQUMsa0JBQWtCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNGLENBQUM7UUFFRCxPQUFPO1lBQ04sT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7WUFDbkMsV0FBVyxFQUFFLGtCQUFrQixDQUFDLEtBQUs7WUFDckMsTUFBTTtnQkFDTCxNQUFNLGdCQUFnQixHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksd0JBQXdCLEVBQUUsQ0FBQztnQkFDNUcsTUFBTSxXQUFXLEdBQXlDLEVBQUUsQ0FBQztnQkFDN0QsTUFBTSxjQUFjLEdBQUcsQ0FBQyxZQUE4QixFQUFzQixFQUFFO29C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