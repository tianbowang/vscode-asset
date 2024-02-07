/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/services/model", "vs/platform/commands/common/commands", "vs/editor/common/services/languageFeatures", "vs/editor/contrib/colorPicker/browser/defaultDocumentColorProvider", "vs/platform/configuration/common/configuration"], function (require, exports, cancellation_1, errors_1, uri_1, range_1, model_1, commands_1, languageFeatures_1, defaultDocumentColorProvider_1, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getColorPresentations = exports.getColors = void 0;
    async function getColors(colorProviderRegistry, model, token, isDefaultColorDecoratorsEnabled = true) {
        return _findColorData(new ColorDataCollector(), colorProviderRegistry, model, token, isDefaultColorDecoratorsEnabled);
    }
    exports.getColors = getColors;
    function getColorPresentations(model, colorInfo, provider, token) {
        return Promise.resolve(provider.provideColorPresentations(model, colorInfo, token));
    }
    exports.getColorPresentations = getColorPresentations;
    class ColorDataCollector {
        constructor() { }
        async compute(provider, model, token, colors) {
            const documentColors = await provider.provideDocumentColors(model, token);
            if (Array.isArray(documentColors)) {
                for (const colorInfo of documentColors) {
                    colors.push({ colorInfo, provider });
                }
            }
            return Array.isArray(documentColors);
        }
    }
    class ExtColorDataCollector {
        constructor() { }
        async compute(provider, model, token, colors) {
            const documentColors = await provider.provideDocumentColors(model, token);
            if (Array.isArray(documentColors)) {
                for (const colorInfo of documentColors) {
                    colors.push({ range: colorInfo.range, color: [colorInfo.color.red, colorInfo.color.green, colorInfo.color.blue, colorInfo.color.alpha] });
                }
            }
            return Array.isArray(documentColors);
        }
    }
    class ColorPresentationsCollector {
        constructor(colorInfo) {
            this.colorInfo = colorInfo;
        }
        async compute(provider, model, _token, colors) {
            const documentColors = await provider.provideColorPresentations(model, this.colorInfo, cancellation_1.CancellationToken.None);
            if (Array.isArray(documentColors)) {
                colors.push(...documentColors);
            }
            return Array.isArray(documentColors);
        }
    }
    async function _findColorData(collector, colorProviderRegistry, model, token, isDefaultColorDecoratorsEnabled) {
        let validDocumentColorProviderFound = false;
        let defaultProvider;
        const colorData = [];
        const documentColorProviders = colorProviderRegistry.ordered(model);
        for (let i = documentColorProviders.length - 1; i >= 0; i--) {
            const provider = documentColorProviders[i];
            if (provider instanceof defaultDocumentColorProvider_1.DefaultDocumentColorProvider) {
                defaultProvider = provider;
            }
            else {
                try {
                    if (await collector.compute(provider, model, token, colorData)) {
                        validDocumentColorProviderFound = true;
                    }
                }
                catch (e) {
                    (0, errors_1.onUnexpectedExternalError)(e);
                }
            }
        }
        if (validDocumentColorProviderFound) {
            return colorData;
        }
        if (defaultProvider && isDefaultColorDecoratorsEnabled) {
            await collector.compute(defaultProvider, model, token, colorData);
            return colorData;
        }
        return [];
    }
    function _setupColorCommand(accessor, resource) {
        const { colorProvider: colorProviderRegistry } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const model = accessor.get(model_1.IModelService).getModel(resource);
        if (!model) {
            throw (0, errors_1.illegalArgument)();
        }
        const isDefaultColorDecoratorsEnabled = accessor.get(configuration_1.IConfigurationService).getValue('editor.defaultColorDecorators', { resource });
        return { model, colorProviderRegistry, isDefaultColorDecoratorsEnabled };
    }
    commands_1.CommandsRegistry.registerCommand('_executeDocumentColorProvider', function (accessor, ...args) {
        const [resource] = args;
        if (!(resource instanceof uri_1.URI)) {
            throw (0, errors_1.illegalArgument)();
        }
        const { model, colorProviderRegistry, isDefaultColorDecoratorsEnabled } = _setupColorCommand(accessor, resource);
        return _findColorData(new ExtColorDataCollector(), colorProviderRegistry, model, cancellation_1.CancellationToken.None, isDefaultColorDecoratorsEnabled);
    });
    commands_1.CommandsRegistry.registerCommand('_executeColorPresentationProvider', function (accessor, ...args) {
        const [color, context] = args;
        const { uri, range } = context;
        if (!(uri instanceof uri_1.URI) || !Array.isArray(color) || color.length !== 4 || !range_1.Range.isIRange(range)) {
            throw (0, errors_1.illegalArgument)();
        }
        const { model, colorProviderRegistry, isDefaultColorDecoratorsEnabled } = _setupColorCommand(accessor, uri);
        const [red, green, blue, alpha] = color;
        return _findColorData(new ColorPresentationsCollector({ range: range, color: { red, green, blue, alpha } }), colorProviderRegistry, model, cancellation_1.CancellationToken.None, isDefaultColorDecoratorsEnabled);
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3IuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NvbG9yUGlja2VyL2Jyb3dzZXIvY29sb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0J6RixLQUFLLFVBQVUsU0FBUyxDQUFDLHFCQUFxRSxFQUFFLEtBQWlCLEVBQUUsS0FBd0IsRUFBRSxrQ0FBMkMsSUFBSTtRQUNsTSxPQUFPLGNBQWMsQ0FBYSxJQUFJLGtCQUFrQixFQUFFLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO0lBQ25JLENBQUM7SUFGRCw4QkFFQztJQUVELFNBQWdCLHFCQUFxQixDQUFDLEtBQWlCLEVBQUUsU0FBNEIsRUFBRSxRQUErQixFQUFFLEtBQXdCO1FBQy9JLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFGRCxzREFFQztJQWFELE1BQU0sa0JBQWtCO1FBQ3ZCLGdCQUFnQixDQUFDO1FBQ2pCLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBK0IsRUFBRSxLQUFpQixFQUFFLEtBQXdCLEVBQUUsTUFBb0I7WUFDL0csTUFBTSxjQUFjLEdBQUcsTUFBTSxRQUFRLENBQUMscUJBQXFCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFFLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO2dCQUNuQyxLQUFLLE1BQU0sU0FBUyxJQUFJLGNBQWMsRUFBRSxDQUFDO29CQUN4QyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ3RDLENBQUM7WUFDRixD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