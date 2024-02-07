/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/uri", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/contrib/gotoSymbol/browser/referencesModel"], function (require, exports, assert, uri_1, position_1, range_1, referencesModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('references', function () {
        test('nearestReference', () => {
            const model = new referencesModel_1.ReferencesModel([{
                    uri: uri_1.URI.file('/out/obj/can'),
                    range: new range_1.Range(1, 1, 1, 1)
                }, {
                    uri: uri_1.URI.file('/out/obj/can2'),
                    range: new range_1.Range(1, 1, 1, 1)
                }, {
                    uri: uri_1.URI.file('/src/can'),
                    range: new range_1.Range(1, 1, 1, 1)
                }], 'FOO');
            let ref = model.nearestReference(uri_1.URI.file('/src/can'), new position_1.Position(1, 1));
            assert.strictEqual(ref.uri.path, '/src/can');
            ref = model.nearestReference(uri_1.URI.file('/src/someOtherFileInSrc'), new position_1.Position(1, 1));
            assert.strictEqual(ref.uri.path, '/src/can');
            ref = model.nearestReference(uri_1.URI.file('/out/someOtherFile'), new position_1.Position(1, 1));
            assert.strictEqual(ref.uri.path, '/out/obj/can');
            ref = model.nearestReference(uri_1.URI.file('/out/obj/can2222'), new position_1.Position(1, 1));
            assert.strictEqual(ref.uri.path, '/out/obj/can2');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVmZXJlbmNlc01vZGVsLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL2VkaXRvci9jb250cmliL2dvdG9TeW1ib2wvdGVzdC9icm93c2VyL3JlZmVyZW5jZXNNb2RlbC50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7O0lBUWhHLEtBQUssQ0FBQyxZQUFZLEVBQUU7UUFFbkIsSUFBSSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtZQUM3QixNQUFNLEtBQUssR0FBRyxJQUFJLGlDQUFlLENBQUMsQ0FBQztvQkFDbEMsR0FBRyxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDO29CQUM3QixLQUFLLEVBQUUsSUFBSSxhQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUM1QixFQUFFO29CQUNGLEdBQUcsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztvQkFDOUIsS0FBSyxFQUFFLElBQUksYUFBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDNUIsRUFBRTtvQkFDRixHQUFHLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7b0JBQ3pCLEtBQUssRUFBRSxJQUFJLGFBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7aUJBQzVCLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUVYLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRSxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRTlDLEdBQUcsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0RixNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBRTlDLEdBQUcsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqRixNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1lBRWxELEdBQUcsR0FBRyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsU0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLElBQUksbUJBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMvRSxNQUFNLENBQUMsV0FBVyxDQUFDLEdBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3BELENBQUMsQ0FBQyxDQUFDO0lBRUosQ0FBQyxDQUFDLENBQUMifQ==