/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/ui/tree/objectTree", "vs/base/common/event", "vs/base/common/lifecycle", "vs/workbench/contrib/testing/browser/explorerProjections/index", "vs/workbench/contrib/testing/common/mainThreadTestCollection", "vs/workbench/contrib/testing/test/common/testStubs"], function (require, exports, objectTree_1, event_1, lifecycle_1, index_1, mainThreadTestCollection_1, testStubs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestTreeTestHarness = void 0;
    const element = document.createElement('div');
    element.style.height = '1000px';
    element.style.width = '200px';
    class TestObjectTree extends objectTree_1.ObjectTree {
        constructor(serializer, sorter) {
            super('test', element, {
                getHeight: () => 20,
                getTemplateId: () => 'default'
            }, [
                {
                    disposeTemplate: () => undefined,
                    renderElement: (node, _index, container) => {
                        Object.assign(container.dataset, node.element);
                        container.textContent = `${node.depth}:${serializer(node.element)}`;
                    },
                    renderTemplate: c => c,
                    templateId: 'default'
                }
            ], {
                sorter: sorter ?? {
                    compare: (a, b) => serializer(a).localeCompare(serializer(b))
                }
            });
            this.layout(1000, 200);
        }
        getModel() {
            return this.model;
        }
        getRendered(getProperty) {
            const elements = element.querySelectorAll('.monaco-tl-contents');
            const sorted = [...elements].sort((a, b) => pos(a) - pos(b));
            const chain = [{ e: '', children: [] }];
            for (const element of sorted) {
                const [depthStr, label] = element.textContent.split(':');
                const depth = Number(depthStr);
                const parent = chain[depth - 1];
                const child = { e: label };
                if (getProperty) {
                    child.data = element.dataset[getProperty];
                }
                parent.children = parent.children?.concat(child) ?? [child];
                chain[depth] = child;
            }
            return chain[0].children;
        }
    }
    const pos = (element) => Number(element.parentElement.parentElement.getAttribute('aria-posinset'));
    class ByLabelTreeSorter {
        compare(a, b) {
            if (a instanceof index_1.TestTreeErrorMessage || b instanceof index_1.TestTreeErrorMessage) {
                return (a instanceof index_1.TestTreeErrorMessage ? -1 : 0) + (b instanceof index_1.TestTreeErrorMessage ? 1 : 0);
            }
            if (a instanceof index_1.TestItemTreeElement && b instanceof index_1.TestItemTreeElement && a.test.item.uri && b.test.item.uri && a.test.item.uri.toString() === b.test.item.uri.toString() && a.test.item.range && b.test.item.range) {
                const delta = a.test.item.range.startLineNumber - b.test.item.range.startLineNumber;
                if (delta !== 0) {
                    return delta;
                }
            }
            return (a.test.item.sortText || a.test.item.label).localeCompare(b.test.item.sortText || b.test.item.label);
        }
    }
    // names are hard
    class TestTreeTestHarness extends lifecycle_1.Disposable {
        constructor(makeTree, c = testStubs_1.testStubs.nested()) {
            super();
            this.c = c;
            this.onDiff = this._register(new event_1.Emitter());
            this.onFolderChange = this._register(new event_1.Emitter());
            this.isProcessingDiff = false;
            this._register(c);
            this._register(this.c.onDidGenerateDiff(d => this.c.setDiff(d /* don't clear during testing */)));
            const collection = new mainThreadTestCollection_1.MainThreadTestCollection({ asCanonicalUri: u => u }, (testId, levels) => {
                this.c.expand(testId, levels);
                if (!this.isProcessingDiff) {
                    this.onDiff.fire(this.c.collectDiff());
                }
                return Promise.resolve();
            });
            this._register(this.onDiff.event(diff => collection.apply(diff)));
            this.projection = this._register(makeTree({
                collection,
                onDidProcessDiff: this.onDiff.event,
            }));
            const sorter = new ByLabelTreeSorter();
            this.tree = this._register(new TestObjectTree(t => 'test' in t ? t.test.item.label : t.message.toString(), sorter));
            this._register(this.tree.onDidChangeCollapseState(evt => {
                if (evt.node.element instanceof index_1.TestItemTreeElement) {
                    this.projection.expandElement(evt.node.element, evt.deep ? Infinity : 0);
                }
            }));
        }
        pushDiff(...diff) {
            this.onDiff.fire(diff);
        }
        flush() {
            this.isProcessingDiff = true;
            while (this.c.currentDiff.length) {
                this.onDiff.fire(this.c.collectDiff());
            }
            this.isProcessingDiff = false;
            this.projection.applyTo(this.tree);
            return this.tree.getRendered();
        }
    }
    exports.TestTreeTestHarness = TestTreeTestHarness;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdE9iamVjdFRyZWUuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL3Rlc3RpbmcvdGVzdC9icm93c2VyL3Rlc3RPYmplY3RUcmVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQWVoRyxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQztJQUNoQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7SUFFOUIsTUFBTSxjQUFrQixTQUFRLHVCQUFrQjtRQUNqRCxZQUFZLFVBQStCLEVBQUUsTUFBdUI7WUFDbkUsS0FBSyxDQUNKLE1BQU0sRUFDTixPQUFPLEVBQ1A7Z0JBQ0MsU0FBUyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUU7Z0JBQ25CLGFBQWEsRUFBRSxHQUFHLEVBQUUsQ0FBQyxTQUFTO2FBQzlCLEVBQ0Q7Z0JBQ0M7b0JBQ0MsZUFBZSxFQUFFLEdBQUcsRUFBRSxDQUFDLFNBQVM7b0JBQ2hDLGFBQWEsRUFBRSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsU0FBc0IsRUFBRSxFQUFFO3dCQUN2RCxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO3dCQUMvQyxTQUFTLENBQUMsV0FBVyxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ3JFLENBQUM7b0JBQ0QsY0FBYyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDdEIsVUFBVSxFQUFFLFNBQVM7aUJBQ3JCO2FBQ0QsRUFDRDtnQkFDQyxN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