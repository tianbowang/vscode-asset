/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/services/model", "vs/platform/commands/common/commands", "vs/editor/common/services/languageFeatures"], function (require, exports, cancellation_1, errors_1, lifecycle_1, types_1, uri_1, model_1, commands_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCodeLensModel = exports.CodeLensModel = void 0;
    class CodeLensModel {
        constructor() {
            this.lenses = [];
            this._disposables = new lifecycle_1.DisposableStore();
        }
        dispose() {
            this._disposables.dispose();
        }
        get isDisposed() {
            return this._disposables.isDisposed;
        }
        add(list, provider) {
            this._disposables.add(list);
            for (const symbol of list.lenses) {
                this.lenses.push({ symbol, provider });
            }
        }
    }
    exports.CodeLensModel = CodeLensModel;
    async function getCodeLensModel(registry, model, token) {
        const provider = registry.ordered(model);
        const providerRanks = new Map();
        const result = new CodeLensModel();
        const promises = provider.map(async (provider, i) => {
            providerRanks.set(provider, i);
            try {
                const list = await Promise.resolve(provider.provideCodeLenses(model, token));
                if (list) {
                    result.add(list, provider);
                }
            }
            catch (err) {
                (0, errors_1.onUnexpectedExternalError)(err);
            }
        });
        await Promise.all(promises);
        result.lenses = result.lenses.sort((a, b) => {
            // sort by lineNumber, provider-rank, and column
            if (a.symbol.range.startLineNumber < b.symbol.range.startLineNumber) {
                return -1;
            }
            else if (a.symbol.range.startLineNumber > b.symbol.range.startLineNumber) {
                return 1;
            }
            else if ((providerRanks.get(a.provider)) < (providerRanks.get(b.provider))) {
                return -1;
            }
            else if ((providerRanks.get(a.provider)) > (providerRanks.get(b.provider))) {
                return 1;
            }
            else if (a.symbol.range.startColumn < b.symbol.range.startColumn) {
                return -1;
            }
            else if (a.symbol.range.startColumn > b.symbol.range.startColumn) {
                return 1;
            }
            else {
                return 0;
            }
        });
        return result;
    }
    exports.getCodeLensModel = getCodeLensModel;
    commands_1.CommandsRegistry.registerCommand('_executeCodeLensProvider', function (accessor, ...args) {
        let [uri, itemResolveCount] = args;
        (0, types_1.assertType)(uri_1.URI.isUri(uri));
        (0, types_1.assertType)(typeof itemResolveCount === 'number' || !itemResolveCount);
        const { codeLensProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const model = accessor.get(model_1.IModelService).getModel(uri);
        if (!model) {
            throw (0, errors_1.illegalArgument)();
        }
        const result = [];
        const disposables = new lifecycle_1.DisposableStore();
        return getCodeLensModel(codeLensProvider, model, cancellation_1.CancellationToken.None).then(value => {
            disposables.add(value);
            const resolve = [];
            for (const item of value.lenses) {
                if (itemResolveCount === undefined || itemResolveCount === null || Boolean(item.symbol.command)) {
                    result.push(item.symbol);
                }
                else if (itemResolveCount-- > 0 && item.provider.resolveCodeLens) {
                    resolve.push(Promise.resolve(item.provider.resolveCodeLens(model, item.symbol, cancellation_1.CancellationToken.None)).then(symbol => result.push(symbol || item.symbol)));
                }
            }
            return Promise.all(resolve);
        }).then(() => {
            return result;
        }).finally(() => {
            // make sure to return results, then (on next tick)
            // dispose the results
            setTimeout(() => disposables.dispose(), 100);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWxlbnMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2NvZGVsZW5zL2Jyb3dzZXIvY29kZWxlbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBbUJoRyxNQUFhLGFBQWE7UUFBMUI7WUFFQyxXQUFNLEdBQW1CLEVBQUUsQ0FBQztZQUVYLGlCQUFZLEdBQUcsSUFBSSwyQkFBZSxFQUFFLENBQUM7UUFnQnZELENBQUM7UUFkQSxPQUFPO1lBQ04sSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUM3QixDQUFDO1FBRUQsSUFBSSxVQUFVO1lBQ2IsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQztRQUNyQyxDQUFDO1FBRUQsR0FBRyxDQUFDLElBQWtCLEVBQUUsUUFBMEI7WUFDakQsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUIsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDeEMsQ0FBQztRQUNGLENBQUM7S0FDRDtJQXBCRCxzQ0FvQkM7SUFFTSxLQUFLLFVBQVUsZ0JBQWdCLENBQUMsUUFBbUQsRUFBRSxLQUFpQixFQUFFLEtBQXdCO1FBRXRJLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekMsTUFBTSxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQTRCLENBQUM7UUFDMUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUVuQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLEtB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