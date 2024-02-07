/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/lifecycle", "vs/base/common/types", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/services/model", "vs/platform/commands/common/commands", "vs/editor/common/services/languageFeatures"], function (require, exports, arrays_1, cancellation_1, errors_1, lifecycle_1, types_1, uri_1, range_1, model_1, commands_1, languageFeatures_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getLinks = exports.LinksList = exports.Link = void 0;
    class Link {
        constructor(link, provider) {
            this._link = link;
            this._provider = provider;
        }
        toJSON() {
            return {
                range: this.range,
                url: this.url,
                tooltip: this.tooltip
            };
        }
        get range() {
            return this._link.range;
        }
        get url() {
            return this._link.url;
        }
        get tooltip() {
            return this._link.tooltip;
        }
        async resolve(token) {
            if (this._link.url) {
                return this._link.url;
            }
            if (typeof this._provider.resolveLink === 'function') {
                return Promise.resolve(this._provider.resolveLink(this._link, token)).then(value => {
                    this._link = value || this._link;
                    if (this._link.url) {
                        // recurse
                        return this.resolve(token);
                    }
                    return Promise.reject(new Error('missing'));
                });
            }
            return Promise.reject(new Error('missing'));
        }
    }
    exports.Link = Link;
    class LinksList {
        constructor(tuples) {
            this._disposables = new lifecycle_1.DisposableStore();
            let links = [];
            for (const [list, provider] of tuples) {
                // merge all links
                const newLinks = list.links.map(link => new Link(link, provider));
                links = LinksList._union(links, newLinks);
                // register disposables
                if ((0, lifecycle_1.isDisposable)(list)) {
                    this._disposables.add(list);
                }
            }
            this.links = links;
        }
        dispose() {
            this._disposables.dispose();
            this.links.length = 0;
        }
        static _union(oldLinks, newLinks) {
            // reunite oldLinks with newLinks and remove duplicates
            const result = [];
            let oldIndex;
            let oldLen;
            let newIndex;
            let newLen;
            for (oldIndex = 0, newIndex = 0, oldLen = oldLinks.length, newLen = newLinks.length; oldIndex < oldLen && newIndex < newLen;) {
                const oldLink = oldLinks[oldIndex];
                const newLink = newLinks[newIndex];
                if (range_1.Range.areIntersectingOrTouching(oldLink.range, newLink.range)) {
                    // Remove the oldLink
                    oldIndex++;
                    continue;
                }
                const comparisonResult = range_1.Range.compareRangesUsingStarts(oldLink.range, newLink.range);
                if (comparisonResult < 0) {
                    // oldLink is before
                    result.push(oldLink);
                    oldIndex++;
                }
                else {
                    // newLink is before
                    result.push(newLink);
                    newIndex++;
                }
            }
            for (; oldIndex < oldLen; oldIndex++) {
                result.push(oldLinks[oldIndex]);
            }
            for (; newIndex < newLen; newIndex++) {
                result.push(newLinks[newIndex]);
            }
            return result;
        }
    }
    exports.LinksList = LinksList;
    function getLinks(providers, model, token) {
        const lists = [];
        // ask all providers for links in parallel
        const promises = providers.ordered(model).reverse().map((provider, i) => {
            return Promise.resolve(provider.provideLinks(model, token)).then(result => {
                if (result) {
                    lists[i] = [result, provider];
                }
            }, errors_1.onUnexpectedExternalError);
        });
        return Promise.all(promises).then(() => {
            const result = new LinksList((0, arrays_1.coalesce)(lists));
            if (!token.isCancellationRequested) {
                return result;
            }
            result.dispose();
            return new LinksList([]);
        });
    }
    exports.getLinks = getLinks;
    commands_1.CommandsRegistry.registerCommand('_executeLinkProvider', async (accessor, ...args) => {
        let [uri, resolveCount] = args;
        (0, types_1.assertType)(uri instanceof uri_1.URI);
        if (typeof resolveCount !== 'number') {
            resolveCount = 0;
        }
        const { linkProvider } = accessor.get(languageFeatures_1.ILanguageFeaturesService);
        const model = accessor.get(model_1.IModelService).getModel(uri);
        if (!model) {
            return [];
        }
        const list = await getLinks(linkProvider, model, cancellation_1.CancellationToken.None);
        if (!list) {
            return [];
        }
        // resolve links
        for (let i = 0; i < Math.min(resolveCount, list.links.length); i++) {
            await list.links[i].resolve(cancellation_1.CancellationToken.None);
        }
        const result = list.links.slice(0);
        list.dispose();
        return result;
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2V0TGlua3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2xpbmtzL2Jyb3dzZXIvZ2V0TGlua3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0JoRyxNQUFhLElBQUk7UUFLaEIsWUFBWSxJQUFXLEVBQUUsUUFBc0I7WUFDOUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7UUFDM0IsQ0FBQztRQUVELE1BQU07WUFDTCxPQUFPO2dCQUNOLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztnQkFDakIsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHO2dCQUNiLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTzthQUNyQixDQUFDO1FBQ0gsQ0FBQztRQUVELElBQUksS0FBSztZQUNSLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDekIsQ0FBQztRQUVELElBQUksR0FBRztZQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDdkIsQ0FBQztRQUVELElBQUksT0FBTztZQUNWLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDM0IsQ0FBQztRQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBd0I7WUFDckMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDO1lBQ3ZCLENBQUM7WUFFRCxJQUFJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEtBQUssVUFBVSxFQUFFLENBQUM7Z0JBQ3RELE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FB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