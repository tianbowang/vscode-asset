/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/test/browser/workbenchTestServices", "vs/editor/common/core/range", "vs/workbench/contrib/comments/browser/commentsView", "vs/workbench/contrib/comments/browser/commentService", "vs/base/common/event", "vs/workbench/common/views", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/contextview/browser/contextView", "vs/base/common/lifecycle", "vs/base/test/common/utils"], function (require, exports, assert, workbenchTestServices_1, range_1, commentsView_1, commentService_1, event_1, views_1, configuration_1, testConfigurationService_1, contextView_1, lifecycle_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TestViewDescriptorService = void 0;
    class TestCommentThread {
        isDocumentCommentThread() {
            return true;
        }
        constructor(commentThreadHandle, controllerHandle, threadId, resource, range, comments) {
            this.commentThreadHandle = commentThreadHandle;
            this.controllerHandle = controllerHandle;
            this.threadId = threadId;
            this.resource = resource;
            this.range = range;
            this.comments = comments;
            this.onDidChangeComments = new event_1.Emitter().event;
            this.onDidChangeInitialCollapsibleState = new event_1.Emitter().event;
            this.canReply = false;
            this.onDidChangeInput = new event_1.Emitter().event;
            this.onDidChangeRange = new event_1.Emitter().event;
            this.onDidChangeLabel = new event_1.Emitter().event;
            this.onDidChangeCollapsibleState = new event_1.Emitter().event;
            this.onDidChangeState = new event_1.Emitter().event;
            this.onDidChangeCanReply = new event_1.Emitter().event;
            this.isDisposed = false;
            this.isTemplate = false;
            this.label = undefined;
            this.contextValue = undefined;
        }
    }
    class TestCommentController {
        constructor() {
            this.id = 'test';
            this.label = 'Test Comments';
            this.features = {};
        }
        createCommentThreadTemplate(resource, range) {
            throw new Error('Method not implemented.');
        }
        updateCommentThreadTemplate(threadHandle, range) {
            throw new Error('Method not implemented.');
        }
        deleteCommentThreadMain(commentThreadId) {
            throw new Error('Method not implemented.');
        }
        toggleReaction(uri, thread, comment, reaction, token) {
            throw new Error('Method not implemented.');
        }
        getDocumentComments(resource, token) {
            throw new Error('Method not implemented.');
        }
        getNotebookComments(resource, token) {
            throw new Error('Method not implemented.');
        }
    }
    class TestViewDescriptorService {
        constructor() {
            this.onDidChangeLocation = new event_1.Emitter().event;
        }
        getViewLocationById(id) {
            return 1 /* ViewContainerLocation.Panel */;
        }
        getViewDescriptorById(id) {
            return null;
        }
        getViewContainerByViewId(id) {
            return {
                id: 'comments',
                title: { value: 'Comments', original: 'Comments' },
                ctorDescriptor: {}
            };
        }
        getViewContainerModel(viewContainer) {
            const partialViewContainerModel = {
                onDidChangeContainerInfo: new event_1.Emitter().event
            };
            return partialViewContainerModel;
        }
        getDefaultContainerById(id) {
            return null;
        }
    }
    exports.TestViewDescriptorService = TestViewDescriptorService;
    suite('Comments View', function () {
        teardown(() => {
            instantiationService.dispose();
            commentService.dispose();
            disposables.dispose();
        });
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let disposables;
        let instantiationService;
        let commentService;
        setup(() => {
            disposables = new lifecycle_1.DisposableStore();
            instantiationService = (0, workbenchTestServices_1.workbenchInstantiationService)({}, disposables);
            instantiationService.stub(configuration_1.IConfigurationService, new testConfigurationService_1.TestConfigurationService());
            instantiationService.stub(contextView_1.IContextViewService, {});
            instantiationService.stub(views_1.IViewDescriptorService, new TestViewDescriptorService());
            commentService = instantiationService.createInstance(commentService_1.CommentService);
            instantiationService.stub(commentService_1.ICommentService, commentService);
            commentService.registerCommentController('test', new TestCommentController());
        });
        test('collapse all', async function () {
            const view = instantiationService.createInstance(commentsView_1.CommentsPanel, { id: 'comments', title: 'Comments' });
            view.render();
            commentService.setWorkspaceComments('test', [
                new TestCommentThread(1, 1, '1', 'test1', new range_1.Range(1, 1, 1, 1), [{ body: 'test', uniqueIdInThread: 1, userName: 'alex' }]),
                new TestCommentThread(2, 1, '1', 'test2', new range_1.Range(1, 1, 1, 1), [{ body: 'test', uniqueIdInThread: 1, userName: 'alex' }]),
            ]);
            assert.strictEqual(view.getFilterStats().total, 2);
            assert.strictEqual(view.areAllCommentsExpanded(), true);
            view.collapseAll();
            assert.strictEqual(view.isSomeCommentsExpanded(), false);
            view.dispose();
        });
        test('expand all', async function () {
            const view = instantiationService.createInstance(commentsView_1.CommentsPanel, { id: 'comments', title: 'Comments' });
            view.render();
            commentService.setWorkspaceComments('test', [
                new TestCommentThread(1, 1, '1', 'test1', new range_1.Range(1, 1, 1, 1), [{ body: 'test', uniqueIdInThread: 1, userName: 'alex' }]),
                new TestCommentThread(2, 1, '1', 'test2', new range_1.Range(1, 1, 1, 1), [{ body: 'test', uniqueIdInThread: 1, userName: 'alex' }]),
            ]);
            assert.strictEqual(view.getFilterStats().total, 2);
            view.collapseAll();
            assert.strictEqual(view.isSomeCommentsExpanded(), false);
            view.expandAll();
            assert.strictEqual(view.areAllCommentsExpanded(), true);
            view.dispose();
        });
        test('filter by text', async function () {
            const view = instantiationService.createInstance(commentsView_1.CommentsPanel, { id: 'comments', title: 'Comments' });
            view.setVisible(true);
            view.render();
            commentService.setWorkspaceComments('test', [
                new TestCommentThread(1, 1, '1', 'test1', new range_1.Range(1, 1, 1, 1), [{ body: 'This comment is a cat.', uniqueIdInThread: 1, userName: 'alex' }]),
                new TestCommentThread(2, 1, '1', 'test2', new range_1.Range(1, 1, 1, 1), [{ body: 'This comment is a dog.', uniqueIdInThread: 1, userName: 'alex' }]),
            ]);
            assert.strictEqual(view.getFilterStats().total, 2);
            assert.strictEqual(view.getFilterStats().filtered, 2);
            view.getFilterWidget().setFilterText('cat');
            // Setting showResolved causes the filter to trigger for the purposes of this test.
            view.filters.showResolved = false;
            assert.strictEqual(view.getFilterStats().total, 2);
            assert.strictEqual(view.getFilterStats().filtered, 1);
            view.clearFilterText();
            // Setting showResolved causes the filter to trigger for the purposes of this test.
            view.filters.showResolved = true;
            assert.strictEqual(view.getFilterStats().total, 2);
            assert.strictEqual(view.getFilterStats().filtered, 2);
            view.dispose();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudHNWaWV3LnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NvbW1lbnRzL3Rlc3QvYnJvd3Nlci9jb21tZW50c1ZpZXcudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFtQmhHLE1BQU0saUJBQWlCO1FBQ3RCLHVCQUF1QjtZQUN0QixPQUFPLElBQUksQ0FBQztRQUNiLENBQUM7UUFDRCxZQUE0QixtQkFBMkIsRUFDdEMsZ0JBQXdCLEVBQ3hCLFFBQWdCLEVBQ2hCLFFBQWdCLEVBQ2hCLEtBQWEsRUFDYixRQUFtQjtZQUxSLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBUTtZQUN0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQVE7WUFDeEIsYUFBUSxHQUFSLFFBQVEsQ0FBUTtZQUNoQixhQUFRLEdBQVIsUUFBUSxDQUFRO1lBQ2hCLFVBQUssR0FBTCxLQUFLLENBQVE7WUFDYixhQUFRLEdBQVIsUUFBUSxDQUFXO1lBRXBDLHdCQUFtQixHQUEwQyxJQUFJLGVBQU8sRUFBa0MsQ0FBQyxLQUFLLENBQUM7WUFDakgsdUNBQWtDLEdBQXFELElBQUksZUFBTyxFQUE2QyxDQUFDLEtBQUssQ0FBQztZQUN0SixhQUFRLEdBQVksS0FBSyxDQUFDO1lBQzFCLHFCQUFnQixHQUFvQyxJQUFJLGVBQU8sRUFBNEIsQ0FBQyxLQUFLLENBQUM7WUFDbEcscUJBQWdCLEdBQWtCLElBQUksZUFBTyxFQUFVLENBQUMsS0FBSyxDQUFDO1lBQzlELHFCQUFnQixHQUE4QixJQUFJLGVBQU8sRUFBc0IsQ0FBQyxLQUFLLENBQUM7WUFDdEYsZ0NBQTJCLEdBQXFELElBQUksZUFBTyxFQUE2QyxDQUFDLEtBQUssQ0FBQztZQUMvSSxxQkFBZ0IsR0FBMEMsSUFBSSxlQUFPLEVBQWtDLENBQUMsS0FBSyxDQUFDO1lB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