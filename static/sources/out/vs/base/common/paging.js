/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/arrays", "vs/base/common/cancellation", "vs/base/common/errors"], function (require, exports, arrays_1, cancellation_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mapPager = exports.DelayedPagedModel = exports.PagedModel = exports.singlePagePager = void 0;
    function createPage(elements) {
        return {
            isResolved: !!elements,
            promise: null,
            cts: null,
            promiseIndexes: new Set(),
            elements: elements || []
        };
    }
    function singlePagePager(elements) {
        return {
            firstPage: elements,
            total: elements.length,
            pageSize: elements.length,
            getPage: (pageIndex, cancellationToken) => {
                return Promise.resolve(elements);
            }
        };
    }
    exports.singlePagePager = singlePagePager;
    class PagedModel {
        get length() { return this.pager.total; }
        constructor(arg) {
            this.pages = [];
            this.pager = Array.isArray(arg) ? singlePagePager(arg) : arg;
            const totalPages = Math.ceil(this.pager.total / this.pager.pageSize);
            this.pages = [
                createPage(this.pager.firstPage.slice()),
                ...(0, arrays_1.range)(totalPages - 1).map(() => createPage())
            ];
        }
        isResolved(index) {
            const pageIndex = Math.floor(index / this.pager.pageSize);
            const page = this.pages[pageIndex];
            return !!page.isResolved;
        }
        get(index) {
            const pageIndex = Math.floor(index / this.pager.pageSize);
            const indexInPage = index % this.pager.pageSize;
            const page = this.pages[pageIndex];
            return page.elements[indexInPage];
        }
        resolve(index, cancellationToken) {
            if (cancellationToken.isCancellationRequested) {
                return Promise.reject(new errors_1.CancellationError());
            }
            const pageIndex = Math.floor(index / this.pager.pageSize);
            const indexInPage = index % this.pager.pageSize;
            const page = this.pages[pageIndex];
            if (page.isResolved) {
                return Promise.resolve(page.elements[indexInPage]);
            }
            if (!page.promise) {
                page.cts = new cancellation_1.CancellationTokenSource();
                page.promise = this.pager.getPage(pageIndex, page.cts.token)
                    .then(elements => {
                    page.elements = elements;
                    page.isResolved = true;
                    page.promise = null;
                    page.cts = null;
                }, err => {
                    page.isResolved = false;
                    page.promise = null;
                    page.cts = null;
                    return Promise.reject(err);
                });
            }
            const listener = cancellationToken.onCancellationRequested(() => {
                if (!page.cts) {
                    return;
                }
                page.promiseIndexes.delete(index);
                if (page.promiseIndexes.size === 0) {
                    page.cts.cancel();
                }
            });
            page.promiseIndexes.add(index);
            return page.promise.then(() => page.elements[indexInPage])
                .finally(() => listener.dispose());
        }
    }
    exports.PagedModel = PagedModel;
    class DelayedPagedModel {
        get length() { return this.model.length; }
        constructor(model, timeout = 500) {
            this.model = model;
            this.timeout = timeout;
        }
        isResolved(index) {
            return this.model.isResolved(index);
        }
        get(index) {
            return this.model.get(index);
        }
        resolve(index, cancellationToken) {
            return new Promise((c, e) => {
                if (cancellationToken.isCancellationRequested) {
                    return e(new errors_1.CancellationError());
                }
                const timer = setTimeout(() => {
                    if (cancellationToken.isCancellationRequested) {
                        return e(new errors_1.CancellationError());
                    }
                    timeoutCancellation.dispose();
                    this.model.resolve(index, cancellationToken).then(c, e);
                }, this.timeout);
                const timeoutCancellation = cancellationToken.onCancellationRequested(() => {
                    clearTimeout(timer);
                    timeoutCancellation.dispose();
                    e(new errors_1.CancellationError());
                });
            });
        }
    }
    exports.DelayedPagedModel = DelayedPagedModel;
    /**
     * Similar to array.map, `mapPager` lets you map the elements of an
     * abstract paged collection to another type.
     */
    function mapPager(pager, fn) {
        return {
            firstPage: pager.firstPage.map(fn),
            total: pager.total,
            pageSize: pager.pageSize,
            getPage: (pageIndex, token) => pager.getPage(pageIndex, token).then(r => r.map(fn))
        };
    }
    exports.mapPager = mapPager;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5nLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi9wYWdpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBd0JoRyxTQUFTLFVBQVUsQ0FBSSxRQUFjO1FBQ3BDLE9BQU87WUFDTixVQUFVLEVBQUUsQ0FBQyxDQUFDLFFBQVE7WUFDdEIsT0FBTyxFQUFFLElBQUk7WUFDYixHQUFHLEVBQUUsSUFBSTtZQUNULGNBQWMsRUFBRSxJQUFJLEdBQUcsRUFBVTtZQUNqQyxRQUFRLEVBQUUsUUFBUSxJQUFJLEVBQUU7U0FDeEIsQ0FBQztJQUNILENBQUM7SUFZRCxTQUFnQixlQUFlLENBQUksUUFBYTtRQUMvQyxPQUFPO1lBQ04sU0FBUyxFQUFFLFFBQVE7WUFDbkIsS0FBSyxFQUFFLFFBQVEsQ0FBQyxNQUFNO1lBQ3RCLFFBQVEsRUFBRSxRQUFRLENBQUMsTUFBTTtZQUN6QixPQUFPLEVBQUUsQ0FBQyxTQUFpQixFQUFFLGlCQUFvQyxFQUFnQixFQUFFO2dCQUNsRixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDbEMsQ0FBQztTQUNELENBQUM7SUFDSCxDQUFDO0lBVEQsMENBU0M7SUFFRCxNQUFhLFVBQVU7UUFLdEIsSUFBSSxNQUFNLEtBQWEsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFakQsWUFBWSxHQUFvQjtZQUp4QixVQUFLLEdBQWUsRUFBRSxDQUFDO1lBSzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7WUFFaEUsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJ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