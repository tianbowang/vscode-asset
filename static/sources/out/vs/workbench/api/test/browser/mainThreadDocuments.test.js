/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/browser/mainThreadDocuments", "vs/base/common/async", "vs/base/common/uri", "vs/base/common/resources"], function (require, exports, assert, mainThreadDocuments_1, async_1, uri_1, resources_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('BoundModelReferenceCollection', function () {
        let col;
        setup(function () {
            col = new mainThreadDocuments_1.BoundModelReferenceCollection(resources_1.extUri, 15, 75);
        });
        teardown(function () {
            col.dispose();
        });
        test('max age', async function () {
            let didDispose = false;
            col.add(uri_1.URI.parse('test://farboo'), {
                object: {},
                dispose() {
                    didDispose = true;
                }
            });
            await (0, async_1.timeout)(30);
            assert.strictEqual(didDispose, true);
        });
        test('max size', function () {
            const disposed = [];
            col.add(uri_1.URI.parse('test://farboo'), {
                object: {},
                dispose() {
                    disposed.push(0);
                }
            }, 6);
            col.add(uri_1.URI.parse('test://boofar'), {
                object: {},
                dispose() {
                    disposed.push(1);
                }
            }, 6);
            col.add(uri_1.URI.parse('test://xxxxxxx'), {
                object: {},
                dispose() {
                    disposed.push(2);
                }
            }, 70);
            assert.deepStrictEqual(disposed, [0, 1]);
        });
        test('max count', function () {
            col.dispose();
            col = new mainThreadDocuments_1.BoundModelReferenceCollection(resources_1.extUri, 10000, 10000, 2);
            const disposed = [];
            col.add(uri_1.URI.parse('test://xxxxxxx'), {
                object: {},
                dispose() {
                    disposed.push(0);
                }
            });
            col.add(uri_1.URI.parse('test://xxxxxxx'), {
                object: {},
                dispose() {
                    disposed.push(1);
                }
            });
            col.add(uri_1.URI.parse('test://xxxxxxx'), {
                object: {},
                dispose() {
                    disposed.push(2);
                }
            });
            assert.deepStrictEqual(disposed, [0]);
        });
        test('dispose uri', function () {
            let disposed = [];
            col.add(uri_1.URI.parse('test:///farboo'), {
                object: {},
                dispose() {
                    disposed.push(0);
                }
            });
            col.add(uri_1.URI.parse('test:///boofar'), {
                object: {},
                dispose() {
                    disposed.push(1);
                }
            });
            col.add(uri_1.URI.parse('test:///boo/far1'), {
                object: {},
                dispose() {
                    disposed.push(2);
                }
            });
            col.add(uri_1.URI.parse('test:///boo/far2'), {
                object: {},
                dispose() {
                    disposed.push(3);
                }
            });
            col.add(uri_1.URI.parse('test:///boo1/far'), {
                object: {},
                dispose() {
                    disposed.push(4);
                }
            });
            col.remove(uri_1.URI.parse('test:///unknown'));
            assert.strictEqual(disposed.length, 0);
            col.remove(uri_1.URI.parse('test:///farboo'));
            assert.deepStrictEqual(disposed, [0]);
            disposed = [];
            col.remove(uri_1.URI.parse('test:///boo'));
            assert.deepStrictEqual(disposed, [2, 3]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpblRocmVhZERvY3VtZW50cy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9tYWluVGhyZWFkRG9jdW1lbnRzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFRaEcsS0FBSyxDQUFDLCtCQUErQixFQUFFO1FBRXRDLElBQUksR0FBa0MsQ0FBQztRQUV2QyxLQUFLLENBQUM7WUFDTCxHQUFHLEdBQUcsSUFBSSxtREFBNkIsQ0FBQyxrQkFBTSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6RCxDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQztZQUNSLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLFNBQVMsRUFBRSxLQUFLO1lBRXBCLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQztZQUV2QixHQUFHLENBQUMsR0FBRyxDQUNOLFNBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQzFCO2dCQUNDLE1BQU0sRUFBRSxFQUFFO2dCQUNWLE9BQU87b0JBQ04sVUFBVSxHQUFHLElBQUksQ0FBQztnQkFDbkIsQ0FBQzthQUNELENBQUMsQ0FBQztZQUVKLE1BQU0sSUFBQSxlQUFPLEVBQUMsRUFBRSxDQUFDLENBQUM7WUFDbEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsVUFBVSxFQUFFO1lBRWhCLE1BQU0sUUFBUSxHQUFhLEVBQUUsQ0FBQztZQUU5QixHQUFHLENBQUMsR0FBRyxDQUNOLFNBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEVBQzFCO2dCQUNDLE1BQU0sRUFBRSxFQUFFO2dC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