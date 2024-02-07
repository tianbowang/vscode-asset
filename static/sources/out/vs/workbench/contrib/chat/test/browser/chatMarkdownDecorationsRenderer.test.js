/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/htmlContent", "vs/base/test/common/snapshot", "vs/base/test/common/utils", "vs/workbench/contrib/chat/browser/chatMarkdownDecorationsRenderer"], function (require, exports, htmlContent_1, snapshot_1, utils_1, chatMarkdownDecorationsRenderer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function content(str) {
        return { kind: 'markdownContent', content: new htmlContent_1.MarkdownString(str) };
    }
    suite('ChatMarkdownDecorationsRenderer', function () {
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        suite('extractVulnerabilitiesFromText', () => {
            test('single line', async () => {
                const before = 'some code ';
                const vulnContent = 'content with vuln';
                const after = ' after';
                const annotatedResult = (0, chatMarkdownDecorationsRenderer_1.annotateSpecialMarkdownContent)([content(before), { kind: 'markdownVuln', content: new htmlContent_1.MarkdownString(vulnContent), vulnerabilities: [{ title: 'title', description: 'vuln' }] }, content(after)]);
                await (0, snapshot_1.assertSnapshot)(annotatedResult);
                const markdown = annotatedResult[0];
                const result = (0, chatMarkdownDecorationsRenderer_1.extractVulnerabilitiesFromText)(markdown.content.value);
                await (0, snapshot_1.assertSnapshot)(result);
            });
            test('multiline', async () => {
                const before = 'some code\nover\nmultiple lines ';
                const vulnContent = 'content with vuln\nand\nnewlines';
                const after = 'more code\nwith newline';
                const annotatedResult = (0, chatMarkdownDecorationsRenderer_1.annotateSpecialMarkdownContent)([content(before), { kind: 'markdownVuln', content: new htmlContent_1.MarkdownString(vulnContent), vulnerabilities: [{ title: 'title', description: 'vuln' }] }, content(after)]);
                await (0, snapshot_1.assertSnapshot)(annotatedResult);
                const markdown = annotatedResult[0];
                const result = (0, chatMarkdownDecorationsRenderer_1.extractVulnerabilitiesFromText)(markdown.content.value);
                await (0, snapshot_1.assertSnapshot)(result);
            });
            test('multiple vulns', async () => {
                const before = 'some code\nover\nmultiple lines ';
                const vulnContent = 'content with vuln\nand\nnewlines';
                const after = 'more code\nwith newline';
                const annotatedResult = (0, chatMarkdownDecorationsRenderer_1.annotateSpecialMarkdownContent)([
                    content(before),
                    { kind: 'markdownVuln', content: new htmlContent_1.MarkdownString(vulnContent), vulnerabilities: [{ title: 'title', description: 'vuln' }] },
                    content(after),
                    { kind: 'markdownVuln', content: new htmlContent_1.MarkdownString(vulnContent), vulnerabilities: [{ title: 'title', description: 'vuln' }] },
                ]);
                await (0, snapshot_1.assertSnapshot)(annotatedResult);
                const markdown = annotatedResult[0];
                const result = (0, chatMarkdownDecorationsRenderer_1.extractVulnerabilitiesFromText)(markdown.content.value);
                await (0, snapshot_1.assertSnapshot)(result);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdE1hcmtkb3duRGVjb3JhdGlvbnNSZW5kZXJlci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9jaGF0L3Rlc3QvYnJvd3Nlci9jaGF0TWFya2Rvd25EZWNvcmF0aW9uc1JlbmRlcmVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFRaEcsU0FBUyxPQUFPLENBQUMsR0FBVztRQUMzQixPQUFPLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxJQUFJLDRCQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztJQUN0RSxDQUFDO0lBRUQsS0FBSyxDQUFDLGlDQUFpQyxFQUFFO1FBQ3hDLElBQUEsK0NBQXVDLEdBQUUsQ0FBQztRQUUxQyxLQUFLLENBQUMsZ0NBQWdDLEVBQUUsR0FBRyxFQUFFO1lBQzVDLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxJQUFJLEVBQUU7Z0JBQzlCLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQztnQkFDNUIsTUFBTSxXQUFXLEdBQUcsbUJBQW1CLENBQUM7Z0JBQ3hDLE1BQU0sS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDdkIsTUFBTSxlQUFlLEdBQUcsSUFBQSxnRUFBOEIsRUFBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsT0FBTyxFQUFFLElBQUksNEJBQWMsQ0FBQyxXQUFXLENBQUMsRUFBRSxlQUFlLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxTixNQUFNLElBQUEseUJBQWMsRUFBQyxlQUFlLENBQUMsQ0FBQztnQkFFdEMs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