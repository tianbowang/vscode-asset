/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/browser/ui/tree/asyncDataTree", "vs/base/common/async", "vs/base/common/iterator", "vs/base/test/common/utils"], function (require, exports, assert, asyncDataTree_1, async_1, iterator_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function find(element, id) {
        if (element.id === id) {
            return element;
        }
        if (!element.children) {
            return undefined;
        }
        for (const child of element.children) {
            const result = find(child, id);
            if (result) {
                return result;
            }
        }
        return undefined;
    }
    class Renderer {
        constructor() {
            this.templateId = 'default';
        }
        renderTemplate(container) {
            return container;
        }
        renderElement(element, index, templateData) {
            templateData.textContent = element.element.id + (element.element.suffix || '');
        }
        disposeTemplate(templateData) {
            // noop
        }
        renderCompressedElements(node, index, templateData, height) {
            const result = [];
            for (const element of node.element.elements) {
                result.push(element.id + (element.suffix || ''));
            }
            templateData.textContent = result.join('/');
        }
    }
    class IdentityProvider {
        getId(element) {
            return element.id;
        }
    }
    class VirtualDelegate {
        getHeight() { return 20; }
        getTemplateId(element) { return 'default'; }
    }
    class DataSource {
        hasChildren(element) {
            return !!element.children && element.children.length > 0;
        }
        getChildren(element) {
            return Promise.resolve(element.children || []);
        }
    }
    class Model {
        constructor(root) {
            this.root = root;
        }
        get(id) {
            const result = find(this.root, id);
            if (!result) {
                throw new Error('element not found');
            }
            return result;
        }
    }
    suite('AsyncDataTree', function () {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        test('Collapse state should be preserved across refresh calls', async () => {
            const container = document.createElement('div');
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a'
                    }]
            });
            const tree = store.add(new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], new DataSource(), { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 0);
            await tree.setInput(model.root);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 1);
            const twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
            model.get('a').children = [
                { id: 'aa' },
                { id: 'ab' },
                { id: 'ac' }
            ];
            await tree.updateChildren(model.root);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 1);
            await tree.expand(model.get('a'));
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 4);
            model.get('a').children = [];
            await tree.updateChildren(model.root);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 1);
        });
        test('issue #68648', async () => {
            const container = document.createElement('div');
            const getChildrenCalls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    getChildrenCalls.push(element.id);
                    return Promise.resolve(element.children || []);
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a'
                    }]
            });
            const tree = store.add(new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model.root);
            assert.deepStrictEqual(getChildrenCalls, ['root']);
            let twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
            assert(tree.getNode().children[0].collapsed);
            model.get('a').children = [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }];
            await tree.updateChildren(model.root);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'root']);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(twistie.classList.contains('collapsible'));
            assert(twistie.classList.contains('collapsed'));
            assert(tree.getNode().children[0].collapsed);
            model.get('a').children = [];
            await tree.updateChildren(model.root);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'root', 'root']);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
            assert(tree.getNode().children[0].collapsed);
            model.get('a').children = [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }];
            await tree.updateChildren(model.root);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'root', 'root', 'root']);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(twistie.classList.contains('collapsible'));
            assert(twistie.classList.contains('collapsed'));
            assert(tree.getNode().children[0].collapsed);
        });
        test('issue #67722 - once resolved, refreshed collapsed nodes should only get children when expanded', async () => {
            const container = document.createElement('div');
            const getChildrenCalls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    getChildrenCalls.push(element.id);
                    return Promise.resolve(element.children || []);
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model.root);
            assert(tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root']);
            await tree.expand(model.get('a'));
            assert(!tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'a']);
            tree.collapse(model.get('a'));
            assert(tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'a']);
            await tree.updateChildren();
            assert(tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'a', 'root'], 'a should not be refreshed, since it\' collapsed');
        });
        test('resolved collapsed nodes which lose children should lose twistie as well', async () => {
            const container = document.createElement('div');
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], new DataSource(), { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model.root);
            await tree.expand(model.get('a'));
            let twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
            assert(!tree.getNode(model.get('a')).collapsed);
            tree.collapse(model.get('a'));
            model.get('a').children = [];
            await tree.updateChildren(model.root);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
            assert(tree.getNode(model.get('a')).collapsed);
        });
        test('support default collapse state per element', async () => {
            const container = document.createElement('div');
            const getChildrenCalls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    getChildrenCalls.push(element.id);
                    return Promise.resolve(element.children || []);
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], dataSource, {
                collapseByDefault: el => el.id !== 'a'
            }));
            tree.layout(200);
            await tree.setInput(model.root);
            assert(!tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'a']);
        });
        test('issue #80098 - concurrent refresh and expand', async () => {
            const container = document.createElement('div');
            const calls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    return new Promise(c => calls.push(() => c(element.children || [])));
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{
                                id: 'aa'
                            }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            const pSetInput = tree.setInput(model.root);
            calls.pop()(); // resolve getChildren(root)
            await pSetInput;
            const pUpdateChildrenA = tree.updateChildren(model.get('a'));
            const pExpandA = tree.expand(model.get('a'));
            assert.strictEqual(calls.length, 1, 'expand(a) still hasn\'t called getChildren(a)');
            calls.pop()();
            assert.strictEqual(calls.length, 0, 'no pending getChildren calls');
            await pUpdateChildrenA;
            assert.strictEqual(calls.length, 0, 'expand(a) should not have forced a second refresh');
            const result = await pExpandA;
            assert.strictEqual(result, true, 'expand(a) should be done');
        });
        test('issue #80098 - first expand should call getChildren', async () => {
            const container = document.createElement('div');
            const calls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    return new Promise(c => calls.push(() => c(element.children || [])));
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{
                                id: 'aa'
                            }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            const pSetInput = tree.setInput(model.root);
            calls.pop()(); // resolve getChildren(root)
            await pSetInput;
            const pExpandA = tree.expand(model.get('a'));
            assert.strictEqual(calls.length, 1, 'expand(a) should\'ve called getChildren(a)');
            let race = await Promise.race([pExpandA.then(() => 'expand'), (0, async_1.timeout)(1).then(() => 'timeout')]);
            assert.strictEqual(race, 'timeout', 'expand(a) should not be yet done');
            calls.pop()();
            assert.strictEqual(calls.length, 0, 'no pending getChildren calls');
            race = await Promise.race([pExpandA.then(() => 'expand'), (0, async_1.timeout)(1).then(() => 'timeout')]);
            assert.strictEqual(race, 'expand', 'expand(a) should now be done');
        });
        test('issue #78388 - tree should react to hasChildren toggles', async () => {
            const container = document.createElement('div');
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a'
                    }]
            });
            const tree = store.add(new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], new DataSource(), { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model.root);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 1);
            let twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
            model.get('a').children = [{ id: 'aa' }];
            await tree.updateChildren(model.get('a'), false);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 1);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(twistie.classList.contains('collapsible'));
            assert(twistie.classList.contains('collapsed'));
            model.get('a').children = [];
            await tree.updateChildren(model.get('a'), false);
            assert.strictEqual(container.querySelectorAll('.monaco-list-row').length, 1);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!twistie.classList.contains('collapsible'));
            assert(!twistie.classList.contains('collapsed'));
        });
        test('issues #84569, #82629 - rerender', async () => {
            const container = document.createElement('div');
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a',
                        children: [{
                                id: 'b',
                                suffix: '1'
                            }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], new DataSource(), { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model.root);
            await tree.expand(model.get('a'));
            assert.deepStrictEqual(Array.from(container.querySelectorAll('.monaco-list-row')).map(e => e.textContent), ['a', 'b1']);
            const a = model.get('a');
            const b = model.get('b');
            a.children?.splice(0, 1, { id: 'b', suffix: '2' });
            await Promise.all([
                tree.updateChildren(a, true, true),
                tree.updateChildren(b, true, true)
            ]);
            assert.deepStrictEqual(Array.from(container.querySelectorAll('.monaco-list-row')).map(e => e.textContent), ['a', 'b2']);
        });
        test('issue #199264 - dispose during render', async () => {
            const container = document.createElement('div');
            const model1 = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }]
                    }]
            });
            const model2 = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }]
                    }]
            });
            const tree = store.add(new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], new DataSource(), { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model1.root);
            const input = tree.setInput(model2.root);
            tree.dispose();
            await input;
            assert.strictEqual(container.innerHTML, '');
        });
        test('issue #121567', async () => {
            const container = document.createElement('div');
            const calls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                async getChildren(element) {
                    calls.push(element);
                    return element.children ?? iterator_1.Iterable.empty();
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{
                                id: 'aa'
                            }]
                    }]
            });
            const a = model.get('a');
            const tree = store.add(new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() }));
            tree.layout(200);
            await tree.setInput(model.root);
            assert.strictEqual(calls.length, 1, 'There should be a single getChildren call for the root');
            assert(tree.isCollapsible(a), 'a is collapsible');
            assert(tree.isCollapsed(a), 'a is collapsed');
            await tree.updateChildren(a, false);
            assert.strictEqual(calls.length, 1, 'There should be no changes to the calls list, since a was collapsed');
            assert(tree.isCollapsible(a), 'a is collapsible');
            assert(tree.isCollapsed(a), 'a is collapsed');
            const children = a.children;
            a.children = [];
            await tree.updateChildren(a, false);
            assert.strictEqual(calls.length, 1, 'There should still be no changes to the calls list, since a was collapsed');
            assert(!tree.isCollapsible(a), 'a is no longer collapsible');
            assert(tree.isCollapsed(a), 'a is collapsed');
            a.children = children;
            await tree.updateChildren(a, false);
            assert.strictEqual(calls.length, 1, 'There should still be no changes to the calls list, since a was collapsed');
            assert(tree.isCollapsible(a), 'a is collapsible again');
            assert(tree.isCollapsed(a), 'a is collapsed');
            await tree.expand(a);
            assert.strictEqual(calls.length, 2, 'Finally, there should be a getChildren call for a');
            assert(tree.isCollapsible(a), 'a is still collapsible');
            assert(!tree.isCollapsed(a), 'a is expanded');
        });
        test('issue #199441', async () => {
            const container = document.createElement('div');
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                async getChildren(element) {
                    return element.children ?? iterator_1.Iterable.empty();
                }
            };
            const compressionDelegate = new class {
                isIncompressible(element) {
                    return !dataSource.hasChildren(element);
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{
                                id: 'b',
                                children: [{ id: 'b.txt' }]
                            }]
                    }]
            });
            const collapseByDefault = (element) => false;
            const tree = store.add(new asyncDataTree_1.CompressibleAsyncDataTree('test', container, new VirtualDelegate(), compressionDelegate, [new Renderer()], dataSource, { identityProvider: new IdentityProvider(), collapseByDefault }));
            tree.layout(200);
            await tree.setInput(model.root);
            assert.deepStrictEqual(Array.from(container.querySelectorAll('.monaco-list-row')).map(e => e.textContent), ['a/b', 'b.txt']);
            model.get('a').children.push({
                id: 'c',
                children: [{ id: 'c.txt' }]
            });
            await tree.updateChildren(model.root, true);
            assert.deepStrictEqual(Array.from(container.querySelectorAll('.monaco-list-row')).map(e => e.textContent), ['a', 'b', 'b.txt', 'c', 'c.txt']);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNEYXRhVHJlZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3QvYnJvd3Nlci91aS90cmVlL2FzeW5jRGF0YVRyZWUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQWtCaEcsU0FBUyxJQUFJLENBQUMsT0FBZ0IsRUFBRSxFQUFVO1FBQ3pDLElBQUksT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUN2QixPQUFPLE9BQU8sQ0FBQztRQUNoQixDQUFDO1FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2QixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBRUQsS0FBSyxNQUFNLEtBQUssSUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDdEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztZQUUvQixJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUNaLE9BQU8sTUFBTSxDQUFDO1lBQ2YsQ0FBQztRQUNGLENBQUM7UUFFRCxPQUFPLFNBQVMsQ0FBQztJQUNsQixDQUFDO0lBRUQsTUFBTSxRQUFRO1FBQWQ7WUFDVSxlQUFVLEdBQUcsU0FBUyxDQUFDO1FBbUJqQyxDQUFDO1FBbEJBLGNBQWMsQ0FBQyxTQUFzQjtZQUNwQyxPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBQ0QsYUFBYSxDQUFDLE9BQWlDLEVBQUUsS0FBYSxFQUFFLFlBQXlCO1lBQ3hGLFlBQVksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNoRixDQUFDO1FBQ0QsZUFBZSxDQUFDLFlBQXlCO1lBQ3hDLE9BQU87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