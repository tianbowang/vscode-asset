define(["require", "exports", "assert", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHost.protocol", "vs/base/common/uri", "vs/base/test/common/mock", "vs/workbench/api/common/extHostDocumentsAndEditors", "vs/workbench/api/test/common/testRPCProtocol", "vs/platform/log/common/log", "vs/workbench/api/common/extHostBulkEdits", "vs/workbench/services/extensions/common/extensions"], function (require, exports, assert, extHostTypes, extHost_protocol_1, uri_1, mock_1, extHostDocumentsAndEditors_1, testRPCProtocol_1, log_1, extHostBulkEdits_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostBulkEdits.applyWorkspaceEdit', () => {
        const resource = uri_1.URI.parse('foo:bar');
        let bulkEdits;
        let workspaceResourceEdits;
        setup(() => {
            workspaceResourceEdits = null;
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadBulkEdits, new class extends (0, mock_1.mock)() {
                $tryApplyWorkspaceEdit(_workspaceResourceEdits) {
                    workspaceResourceEdits = _workspaceResourceEdits;
                    return Promise.resolve(true);
                }
            });
            const documentsAndEditors = new extHostDocumentsAndEditors_1.ExtHostDocumentsAndEditors((0, testRPCProtocol_1.SingleProxyRPCProtocol)(null), new log_1.NullLogService());
            documentsAndEditors.$acceptDocumentsAndEditorsDelta({
                addedDocuments: [{
                        isDirty: false,
                        languageId: 'foo',
                        uri: resource,
                        versionId: 1337,
                        lines: ['foo'],
                        EOL: '\n',
                    }]
            });
            bulkEdits = new extHostBulkEdits_1.ExtHostBulkEdits(rpcProtocol, documentsAndEditors);
        });
        test('uses version id if document available', async () => {
            const edit = new extHostTypes.WorkspaceEdit();
            edit.replace(resource, new extHostTypes.Range(0, 0, 0, 0), 'hello');
            await bulkEdits.applyWorkspaceEdit(edit, extensions_1.nullExtensionDescription, undefined);
            assert.strictEqual(workspaceResourceEdits.edits.length, 1);
            const [first] = workspaceResourceEdits.edits;
            assert.strictEqual(first.versionId, 1337);
        });
        test('does not use version id if document is not available', async () => {
            const edit = new extHostTypes.WorkspaceEdit();
            edit.replace(uri_1.URI.parse('foo:bar2'), new extHostTypes.Range(0, 0, 0, 0), 'hello');
            await bulkEdits.applyWorkspaceEdit(edit, extensions_1.nullExtensionDescription, undefined);
            assert.strictEqual(workspaceResourceEdits.edits.length, 1);
            const [first] = workspaceResourceEdits.edits;
            assert.ok(typeof first.versionId === 'undefined');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEJ1bGtFZGl0cy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9leHRIb3N0QnVsa0VkaXRzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZUEsS0FBSyxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsRUFBRTtRQUVqRCxNQUFNLFFBQVEsR0FBRyxTQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RDLElBQUksU0FBMkIsQ0FBQztRQUNoQyxJQUFJLHNCQUF5QyxDQUFDO1FBRTlDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDVixzQkFBc0IsR0FBRyxJQUFLLENBQUM7WUFFL0IsTUFBTSxXQUFXLEdBQUcsSUFBSSxpQ0FBZSxFQUFFLENBQUM7WUFDMUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyw4QkFBVyxDQUFDLG1CQUFtQixFQUFFLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUE0QjtnQkFDekYsc0JBQXNCLENBQUMsdUJBQTBDO29CQUN6RSxzQkFBc0IsR0FBRyx1QkFBdUIsQ0FBQztvQkFDakQsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM5QixDQUFDO2FBQ0QsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxtQkFBbUIsR0FBRyxJQUFJLHVEQUEwQixDQUFDLElBQUEsd0NBQXNCLEVBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxvQkFBYyxFQUFFLENBQUMsQ0FBQztZQUMvRyxtQkFBbUIsQ0FBQywrQkFBK0IsQ0FBQztnQkFDbkQsY0FBYyxFQUFFLENBQUM7d0JBQ2hCLE9BQU8sRUFBRSxLQUFLO3dCQUNkLFVBQVUsRUFBRSxLQUFLO3dCQUNqQixHQUFHLEVBQUUsUUFBUTt3QkFDYixTQUFTLEVBQUUsSUFBSTt3QkFDZixLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7d0JBQ2QsR0FBRyxFQUFFLElBQUk7cUJBQ1QsQ0FBQzthQUNGLENBQUMsQ0FBQztZQUNILFNBQVMsR0FBRyxJQUFJLG1DQUFnQixDQUFDLFdBQVcsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO1FBQ3BFLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLHVDQUF1QyxFQUFFLEtBQUssSUFBSSxFQUFFO1lBQ3hELE1BQU0sSUFBSSxHQUFHLElBQUksWUFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzlDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUNwRSxNQUFNLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEVBQUUscUNBQXdCLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDOUUsTUFBTSxDQUFDLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzNELE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxzQkFBc0IsQ0FBQyxLQUFLLENBQUM7WUFDN0MsTUFBTSxDQUFDLFdBQVcsQ0FBeUIsS0FBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwRSxDQUFDLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxzREFBc0QsRUFBRSxLQUFLLElBQUksRUFBRTtZQUN2RSxNQUFNLElBQUksR0FBRyxJQUFJLFlBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEVBQUUsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2pGLE1BQU0sU0FBUyxDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxxQ0FBd0IsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUM5RSxNQUFNLENBQUMsV0FBVyxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDM0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLHNCQUFzQixDQUFDLEtBQUssQ0FBQztZQUM3QyxNQUFNLENBQUMsRUFBRSxDQUFDLE9BQStCLEtBQU0sQ0FBQyxTQUFTLEtBQUssV0FBVyxDQUFDLENBQUM7UUFDNUUsQ0FBQyxDQUFDLENBQUM7SUFFSixDQUFDLENBQUMsQ0FBQyJ9