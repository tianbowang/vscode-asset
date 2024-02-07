/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/cancellation", "vs/base/common/path", "vs/base/common/uri", "vs/platform/extensions/common/extensions", "vs/platform/log/common/log", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostTypes", "vs/workbench/api/common/extHostWorkspace", "vs/base/test/common/mock", "vs/workbench/api/test/common/testRPCProtocol", "vs/workbench/api/common/extHostRpcService", "vs/base/common/platform", "vs/workbench/services/extensions/common/extensions"], function (require, exports, assert, cancellation_1, path_1, uri_1, extensions_1, log_1, extHost_protocol_1, extHostTypes_1, extHostWorkspace_1, mock_1, testRPCProtocol_1, extHostRpcService_1, platform_1, extensions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createExtHostWorkspace(mainContext, data, logService) {
        const result = new extHostWorkspace_1.ExtHostWorkspace(new extHostRpcService_1.ExtHostRpcService(mainContext), new class extends (0, mock_1.mock)() {
            constructor() {
                super(...arguments);
                this.workspace = data;
            }
        }, new class extends (0, mock_1.mock)() {
            getCapabilities() { return platform_1.isLinux ? 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */ : undefined; }
        }, logService, new class extends (0, mock_1.mock)() {
        });
        result.$initializeWorkspace(data, true);
        return result;
    }
    suite('ExtHostWorkspace', function () {
        function assertAsRelativePath(workspace, input, expected, includeWorkspace) {
            const actual = workspace.getRelativePath(input, includeWorkspace);
            assert.strictEqual(actual, expected);
        }
        test('asRelativePath', () => {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file('/Coding/Applications/NewsWoWBot'), 0)], name: 'Test' }, new log_1.NullLogService());
            assertAsRelativePath(ws, '/Coding/Applications/NewsWoWBot/bernd/das/brot', 'bernd/das/brot');
            assertAsRelativePath(ws, '/Apps/DartPubCache/hosted/pub.dartlang.org/convert-2.0.1/lib/src/hex.dart', '/Apps/DartPubCache/hosted/pub.dartlang.org/convert-2.0.1/lib/src/hex.dart');
            assertAsRelativePath(ws, '', '');
            assertAsRelativePath(ws, '/foo/bar', '/foo/bar');
            assertAsRelativePath(ws, 'in/out', 'in/out');
        });
        test('asRelativePath, same paths, #11402', function () {
            const root = '/home/aeschli/workspaces/samples/docker';
            const input = '/home/aeschli/workspaces/samples/docker';
            const ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.NullLogService());
            assertAsRelativePath(ws, input, input);
            const input2 = '/home/aeschli/workspaces/samples/docker/a.file';
            assertAsRelativePath(ws, input2, 'a.file');
        });
        test('asRelativePath, no workspace', function () {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), null, new log_1.NullLogService());
            assertAsRelativePath(ws, '', '');
            assertAsRelativePath(ws, '/foo/bar', '/foo/bar');
        });
        test('asRelativePath, multiple folders', function () {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file('/Coding/One'), 0), aWorkspaceFolderData(uri_1.URI.file('/Coding/Two'), 1)], name: 'Test' }, new log_1.NullLogService());
            assertAsRelativePath(ws, '/Coding/One/file.txt', 'One/file.txt');
            assertAsRelativePath(ws, '/Coding/Two/files/out.txt', 'Two/files/out.txt');
            assertAsRelativePath(ws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt');
        });
        test('slightly inconsistent behaviour of asRelativePath and getWorkspaceFolder, #31553', function () {
            const mrws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file('/Coding/One'), 0), aWorkspaceFolderData(uri_1.URI.file('/Coding/Two'), 1)], name: 'Test' }, new log_1.NullLogService());
            assertAsRelativePath(mrws, '/Coding/One/file.txt', 'One/file.txt');
            assertAsRelativePath(mrws, '/Coding/One/file.txt', 'One/file.txt', true);
            assertAsRelativePath(mrws, '/Coding/One/file.txt', 'file.txt', false);
            assertAsRelativePath(mrws, '/Coding/Two/files/out.txt', 'Two/files/out.txt');
            assertAsRelativePath(mrws, '/Coding/Two/files/out.txt', 'Two/files/out.txt', true);
            assertAsRelativePath(mrws, '/Coding/Two/files/out.txt', 'files/out.txt', false);
            assertAsRelativePath(mrws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt');
            assertAsRelativePath(mrws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt', true);
            assertAsRelativePath(mrws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt', false);
            const srws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file('/Coding/One'), 0)], name: 'Test' }, new log_1.NullLogService());
            assertAsRelativePath(srws, '/Coding/One/file.txt', 'file.txt');
            assertAsRelativePath(srws, '/Coding/One/file.txt', 'file.txt', false);
            assertAsRelativePath(srws, '/Coding/One/file.txt', 'One/file.txt', true);
            assertAsRelativePath(srws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt');
            assertAsRelativePath(srws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt', true);
            assertAsRelativePath(srws, '/Coding/Two2/files/out.txt', '/Coding/Two2/files/out.txt', false);
        });
        test('getPath, legacy', function () {
            let ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [] }, new log_1.NullLogService());
            assert.strictEqual(ws.getPath(), undefined);
            ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), null, new log_1.NullLogService());
            assert.strictEqual(ws.getPath(), undefined);
            ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), undefined, new log_1.NullLogService());
            assert.strictEqual(ws.getPath(), undefined);
            ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.file('Folder'), 0), aWorkspaceFolderData(uri_1.URI.file('Another/Folder'), 1)] }, new log_1.NullLogService());
            assert.strictEqual(ws.getPath().replace(/\\/g, '/'), '/Folder');
            ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.file('/Folder'), 0)] }, new log_1.NullLogService());
            assert.strictEqual(ws.getPath().replace(/\\/g, '/'), '/Folder');
        });
        test('WorkspaceFolder has name and index', function () {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file('/Coding/One'), 0), aWorkspaceFolderData(uri_1.URI.file('/Coding/Two'), 1)], name: 'Test' }, new log_1.NullLogService());
            const [one, two] = ws.getWorkspaceFolders();
            assert.strictEqual(one.name, 'One');
            assert.strictEqual(one.index, 0);
            assert.strictEqual(two.name, 'Two');
            assert.strictEqual(two.index, 1);
        });
        test('getContainingWorkspaceFolder', () => {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), {
                id: 'foo',
                name: 'Test',
                folders: [
                    aWorkspaceFolderData(uri_1.URI.file('/Coding/One'), 0),
                    aWorkspaceFolderData(uri_1.URI.file('/Coding/Two'), 1),
                    aWorkspaceFolderData(uri_1.URI.file('/Coding/Two/Nested'), 2)
                ]
            }, new log_1.NullLogService());
            let folder = ws.getWorkspaceFolder(uri_1.URI.file('/foo/bar'));
            assert.strictEqual(folder, undefined);
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/One/file/path.txt'));
            assert.strictEqual(folder.name, 'One');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/file/path.txt'));
            assert.strictEqual(folder.name, 'Two');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nest'));
            assert.strictEqual(folder.name, 'Two');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nested/file'));
            assert.strictEqual(folder.name, 'Nested');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nested/f'));
            assert.strictEqual(folder.name, 'Nested');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nested'), true);
            assert.strictEqual(folder.name, 'Two');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nested/'), true);
            assert.strictEqual(folder.name, 'Two');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nested'));
            assert.strictEqual(folder.name, 'Nested');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two/Nested/'));
            assert.strictEqual(folder.name, 'Nested');
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two'), true);
            assert.strictEqual(folder, undefined);
            folder = ws.getWorkspaceFolder(uri_1.URI.file('/Coding/Two'), false);
            assert.strictEqual(folder.name, 'Two');
        });
        test('Multiroot change event should have a delta, #29641', function (done) {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [] }, new log_1.NullLogService());
            let finished = false;
            const finish = (error) => {
                if (!finished) {
                    finished = true;
                    done(error);
                }
            };
            let sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.added, []);
                    assert.deepStrictEqual(e.removed, []);
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [] });
            sub.dispose();
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.removed, []);
                    assert.strictEqual(e.added.length, 1);
                    assert.strictEqual(e.added[0].uri.toString(), 'foo:bar');
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0)] });
            sub.dispose();
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.removed, []);
                    assert.strictEqual(e.added.length, 1);
                    assert.strictEqual(e.added[0].uri.toString(), 'foo:bar2');
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar2'), 1)] });
            sub.dispose();
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.strictEqual(e.removed.length, 2);
                    assert.strictEqual(e.removed[0].uri.toString(), 'foo:bar');
                    assert.strictEqual(e.removed[1].uri.toString(), 'foo:bar2');
                    assert.strictEqual(e.added.length, 1);
                    assert.strictEqual(e.added[0].uri.toString(), 'foo:bar3');
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 0)] });
            sub.dispose();
            finish();
        });
        test('Multiroot change keeps existing workspaces live', function () {
            const ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0)] }, new log_1.NullLogService());
            const firstFolder = ws.getWorkspaceFolders()[0];
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar2'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 1, 'renamed')] });
            assert.strictEqual(ws.getWorkspaceFolders()[1], firstFolder);
            assert.strictEqual(firstFolder.index, 1);
            assert.strictEqual(firstFolder.name, 'renamed');
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar2'), 1), aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 2)] });
            assert.strictEqual(ws.getWorkspaceFolders()[2], firstFolder);
            assert.strictEqual(firstFolder.index, 2);
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 0)] });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 1)] });
            assert.notStrictEqual(firstFolder, ws.workspace.folders[0]);
        });
        test('updateWorkspaceFolders - invalid arguments', function () {
            let ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [] }, new log_1.NullLogService());
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, null, null));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 0, 0));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 0, 1));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 1, 0));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, -1, 0));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, -1, -1));
            ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0)] }, new log_1.NullLogService());
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 1, 1));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 0, 2));
            assert.strictEqual(false, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 0, 1, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar'))));
        });
        test('updateWorkspaceFolders - valid arguments', function (done) {
            let finished = false;
            const finish = (error) => {
                if (!finished) {
                    finished = true;
                    done(error);
                }
            };
            const protocol = {
                getProxy: () => { return undefined; },
                set: () => { return undefined; },
                dispose: () => { },
                assertRegistered: () => { },
                drain: () => { return undefined; },
            };
            const ws = createExtHostWorkspace(protocol, { id: 'foo', name: 'Test', folders: [] }, new log_1.NullLogService());
            //
            // Add one folder
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 0, 0, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar'))));
            assert.strictEqual(1, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar').toString());
            const firstAddedFolder = ws.getWorkspaceFolders()[0];
            let gotEvent = false;
            let sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.removed, []);
                    assert.strictEqual(e.added.length, 1);
                    assert.strictEqual(e.added[0].uri.toString(), 'foo:bar');
                    assert.strictEqual(e.added[0], firstAddedFolder); // verify object is still live
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0)] }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], firstAddedFolder); // verify object is still live
            //
            // Add two more folders
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 1, 0, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar1')), asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar2'))));
            assert.strictEqual(3, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar').toString());
            assert.strictEqual(ws.workspace.folders[1].uri.toString(), uri_1.URI.parse('foo:bar1').toString());
            assert.strictEqual(ws.workspace.folders[2].uri.toString(), uri_1.URI.parse('foo:bar2').toString());
            const secondAddedFolder = ws.getWorkspaceFolders()[1];
            const thirdAddedFolder = ws.getWorkspaceFolders()[2];
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.removed, []);
                    assert.strictEqual(e.added.length, 2);
                    assert.strictEqual(e.added[0].uri.toString(), 'foo:bar1');
                    assert.strictEqual(e.added[1].uri.toString(), 'foo:bar2');
                    assert.strictEqual(e.added[0], secondAddedFolder);
                    assert.strictEqual(e.added[1], thirdAddedFolder);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar1'), 1), aWorkspaceFolderData(uri_1.URI.parse('foo:bar2'), 2)] }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], firstAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], secondAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[2], thirdAddedFolder); // verify object is still live
            //
            // Remove one folder
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 2, 1));
            assert.strictEqual(2, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar').toString());
            assert.strictEqual(ws.workspace.folders[1].uri.toString(), uri_1.URI.parse('foo:bar1').toString());
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.added, []);
                    assert.strictEqual(e.removed.length, 1);
                    assert.strictEqual(e.removed[0], thirdAddedFolder);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar1'), 1)] }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], firstAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], secondAddedFolder); // verify object is still live
            //
            // Rename folder
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 0, 2, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 'renamed 1'), asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar1'), 'renamed 2')));
            assert.strictEqual(2, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar').toString());
            assert.strictEqual(ws.workspace.folders[1].uri.toString(), uri_1.URI.parse('foo:bar1').toString());
            assert.strictEqual(ws.workspace.folders[0].name, 'renamed 1');
            assert.strictEqual(ws.workspace.folders[1].name, 'renamed 2');
            assert.strictEqual(ws.getWorkspaceFolders()[0].name, 'renamed 1');
            assert.strictEqual(ws.getWorkspaceFolders()[1].name, 'renamed 2');
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.deepStrictEqual(e.added, []);
                    assert.strictEqual(e.removed.length, 0);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar'), 0, 'renamed 1'), aWorkspaceFolderData(uri_1.URI.parse('foo:bar1'), 1, 'renamed 2')] }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], firstAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], secondAddedFolder); // verify object is still live
            assert.strictEqual(ws.workspace.folders[0].name, 'renamed 1');
            assert.strictEqual(ws.workspace.folders[1].name, 'renamed 2');
            assert.strictEqual(ws.getWorkspaceFolders()[0].name, 'renamed 1');
            assert.strictEqual(ws.getWorkspaceFolders()[1].name, 'renamed 2');
            //
            // Add and remove folders
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 0, 2, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar3')), asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar4'))));
            assert.strictEqual(2, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar3').toString());
            assert.strictEqual(ws.workspace.folders[1].uri.toString(), uri_1.URI.parse('foo:bar4').toString());
            const fourthAddedFolder = ws.getWorkspaceFolders()[0];
            const fifthAddedFolder = ws.getWorkspaceFolders()[1];
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.strictEqual(e.added.length, 2);
                    assert.strictEqual(e.added[0], fourthAddedFolder);
                    assert.strictEqual(e.added[1], fifthAddedFolder);
                    assert.strictEqual(e.removed.length, 2);
                    assert.strictEqual(e.removed[0], firstAddedFolder);
                    assert.strictEqual(e.removed[1], secondAddedFolder);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar4'), 1)] }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], fourthAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], fifthAddedFolder); // verify object is still live
            //
            // Swap folders
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 0, 2, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar4')), asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar3'))));
            assert.strictEqual(2, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar4').toString());
            assert.strictEqual(ws.workspace.folders[1].uri.toString(), uri_1.URI.parse('foo:bar3').toString());
            assert.strictEqual(ws.getWorkspaceFolders()[0], fifthAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], fourthAddedFolder); // verify object is still live
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.strictEqual(e.added.length, 0);
                    assert.strictEqual(e.removed.length, 0);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [aWorkspaceFolderData(uri_1.URI.parse('foo:bar4'), 0), aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 1)] }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], fifthAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], fourthAddedFolder); // verify object is still live
            assert.strictEqual(fifthAddedFolder.index, 0);
            assert.strictEqual(fourthAddedFolder.index, 1);
            //
            // Add one folder after the other without waiting for confirmation (not supported currently)
            //
            assert.strictEqual(true, ws.updateWorkspaceFolders(extensions_2.nullExtensionDescription, 2, 0, asUpdateWorkspaceFolderData(uri_1.URI.parse('foo:bar5'))));
            assert.strictEqual(3, ws.workspace.folders.length);
            assert.strictEqual(ws.workspace.folders[0].uri.toString(), uri_1.URI.parse('foo:bar4').toString());
            assert.strictEqual(ws.workspace.folders[1].uri.toString(), uri_1.URI.parse('foo:bar3').toString());
            assert.strictEqual(ws.workspace.folders[2].uri.toString(), uri_1.URI.parse('foo:bar5').toString());
            const sixthAddedFolder = ws.getWorkspaceFolders()[2];
            gotEvent = false;
            sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.strictEqual(e.added.length, 1);
                    assert.strictEqual(e.added[0], sixthAddedFolder);
                    gotEvent = true;
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({
                id: 'foo', name: 'Test', folders: [
                    aWorkspaceFolderData(uri_1.URI.parse('foo:bar4'), 0),
                    aWorkspaceFolderData(uri_1.URI.parse('foo:bar3'), 1),
                    aWorkspaceFolderData(uri_1.URI.parse('foo:bar5'), 2)
                ]
            }); // simulate acknowledgement from main side
            assert.strictEqual(gotEvent, true);
            sub.dispose();
            assert.strictEqual(ws.getWorkspaceFolders()[0], fifthAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[1], fourthAddedFolder); // verify object is still live
            assert.strictEqual(ws.getWorkspaceFolders()[2], sixthAddedFolder); // verify object is still live
            finish();
        });
        test('Multiroot change event is immutable', function (done) {
            let finished = false;
            const finish = (error) => {
                if (!finished) {
                    finished = true;
                    done(error);
                }
            };
            const ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), { id: 'foo', name: 'Test', folders: [] }, new log_1.NullLogService());
            const sub = ws.onDidChangeWorkspace(e => {
                try {
                    assert.throws(() => {
                        e.added = [];
                    });
                    // assert.throws(() => {
                    // 	(<any>e.added)[0] = null;
                    // });
                }
                catch (error) {
                    finish(error);
                }
            });
            ws.$acceptWorkspaceData({ id: 'foo', name: 'Test', folders: [] });
            sub.dispose();
            finish();
        });
        test('`vscode.workspace.getWorkspaceFolder(file)` don\'t return workspace folder when file open from command line. #36221', function () {
            if (platform_1.isWindows) {
                const ws = createExtHostWorkspace(new testRPCProtocol_1.TestRPCProtocol(), {
                    id: 'foo', name: 'Test', folders: [
                        aWorkspaceFolderData(uri_1.URI.file('c:/Users/marek/Desktop/vsc_test/'), 0)
                    ]
                }, new log_1.NullLogService());
                assert.ok(ws.getWorkspaceFolder(uri_1.URI.file('c:/Users/marek/Desktop/vsc_test/a.txt')));
                assert.ok(ws.getWorkspaceFolder(uri_1.URI.file('C:/Users/marek/Desktop/vsc_test/b.txt')));
            }
        });
        function aWorkspaceFolderData(uri, index, name = '') {
            return {
                uri,
                index,
                name: name || (0, path_1.basename)(uri.path)
            };
        }
        function asUpdateWorkspaceFolderData(uri, name) {
            return { uri, name };
        }
        test('findFiles - string include', () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadWorkspace, new class extends (0, mock_1.mock)() {
                $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(includePattern, 'foo');
                    assert.strictEqual(_includeFolder, null);
                    assert.strictEqual(excludePatternOrDisregardExcludes, null);
                    assert.strictEqual(maxResults, 10);
                    return Promise.resolve(null);
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.NullLogService());
            return ws.findFiles('foo', undefined, 10, new extensions_1.ExtensionIdentifier('test')).then(() => {
                assert(mainThreadCalled, 'mainThreadCalled');
            });
        });
        function testFindFilesInclude(pattern) {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadWorkspace, new class extends (0, mock_1.mock)() {
                $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(includePattern, 'glob/**');
                    assert.deepStrictEqual(_includeFolder ? uri_1.URI.from(_includeFolder).toJSON() : null, uri_1.URI.file('/other/folder').toJSON());
                    assert.strictEqual(excludePatternOrDisregardExcludes, null);
                    return Promise.resolve(null);
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.NullLogService());
            return ws.findFiles(pattern, undefined, 10, new extensions_1.ExtensionIdentifier('test')).then(() => {
                assert(mainThreadCalled, 'mainThreadCalled');
            });
        }
        test('findFiles - RelativePattern include (string)', () => {
            return testFindFilesInclude(new extHostTypes_1.RelativePattern('/other/folder', 'glob/**'));
        });
        test('findFiles - RelativePattern include (URI)', () => {
            return testFindFilesInclude(new extHostTypes_1.RelativePattern(uri_1.URI.file('/other/folder'), 'glob/**'));
        });
        test('findFiles - no excludes', () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadWorkspace, new class extends (0, mock_1.mock)() {
                $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(includePattern, 'glob/**');
                    assert.deepStrictEqual(uri_1.URI.revive(_includeFolder).toString(), uri_1.URI.file('/other/folder').toString());
                    assert.strictEqual(excludePatternOrDisregardExcludes, false);
                    return Promise.resolve(null);
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.NullLogService());
            return ws.findFiles(new extHostTypes_1.RelativePattern('/other/folder', 'glob/**'), null, 10, new extensions_1.ExtensionIdentifier('test')).then(() => {
                assert(mainThreadCalled, 'mainThreadCalled');
            });
        });
        test('findFiles - with cancelled token', () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadWorkspace, new class extends (0, mock_1.mock)() {
                $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
                    mainThreadCalled = true;
                    return Promise.resolve(null);
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.NullLogService());
            const token = cancellation_1.CancellationToken.Cancelled;
            return ws.findFiles(new extHostTypes_1.RelativePattern('/other/folder', 'glob/**'), null, 10, new extensions_1.ExtensionIdentifier('test'), token).then(() => {
                assert(!mainThreadCalled, '!mainThreadCalled');
            });
        });
        test('findFiles - RelativePattern exclude', () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadWorkspace, new class extends (0, mock_1.mock)() {
                $startFileSearch(includePattern, _includeFolder, excludePatternOrDisregardExcludes, maxResults, token) {
                    mainThreadCalled = true;
                    assert(excludePatternOrDisregardExcludes, 'glob/**'); // Note that the base portion is ignored, see #52651
                    return Promise.resolve(null);
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.NullLogService());
            return ws.findFiles('', new extHostTypes_1.RelativePattern(root, 'glob/**'), 10, new extensions_1.ExtensionIdentifier('test')).then(() => {
                assert(mainThreadCalled, 'mainThreadCalled');
            });
        });
        test('findTextInFiles - no include', async () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadWorkspace, new class extends (0, mock_1.mock)() {
                async $startTextSearch(query, folder, options, requestId, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(query.pattern, 'foo');
                    assert.strictEqual(folder, null);
                    assert.strictEqual(options.includePattern, undefined);
                    assert.strictEqual(options.excludePattern, undefined);
                    return null;
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.NullLogService());
            await ws.findTextInFiles({ pattern: 'foo' }, {}, () => { }, new extensions_1.ExtensionIdentifier('test'));
            assert(mainThreadCalled, 'mainThreadCalled');
        });
        test('findTextInFiles - string include', async () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadWorkspace, new class extends (0, mock_1.mock)() {
                async $startTextSearch(query, folder, options, requestId, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(query.pattern, 'foo');
                    assert.strictEqual(folder, null);
                    assert.strictEqual(options.includePattern, '**/files');
                    assert.strictEqual(options.excludePattern, undefined);
                    return null;
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.NullLogService());
            await ws.findTextInFiles({ pattern: 'foo' }, { include: '**/files' }, () => { }, new extensions_1.ExtensionIdentifier('test'));
            assert(mainThreadCalled, 'mainThreadCalled');
        });
        test('findTextInFiles - RelativePattern include', async () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadWorkspace, new class extends (0, mock_1.mock)() {
                async $startTextSearch(query, folder, options, requestId, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(query.pattern, 'foo');
                    assert.deepStrictEqual(uri_1.URI.revive(folder).toString(), uri_1.URI.file('/other/folder').toString());
                    assert.strictEqual(options.includePattern, 'glob/**');
                    assert.strictEqual(options.excludePattern, undefined);
                    return null;
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.NullLogService());
            await ws.findTextInFiles({ pattern: 'foo' }, { include: new extHostTypes_1.RelativePattern('/other/folder', 'glob/**') }, () => { }, new extensions_1.ExtensionIdentifier('test'));
            assert(mainThreadCalled, 'mainThreadCalled');
        });
        test('findTextInFiles - with cancelled token', async () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadWorkspace, new class extends (0, mock_1.mock)() {
                async $startTextSearch(query, folder, options, requestId, token) {
                    mainThreadCalled = true;
                    return null;
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.NullLogService());
            const token = cancellation_1.CancellationToken.Cancelled;
            await ws.findTextInFiles({ pattern: 'foo' }, {}, () => { }, new extensions_1.ExtensionIdentifier('test'), token);
            assert(!mainThreadCalled, '!mainThreadCalled');
        });
        test('findTextInFiles - RelativePattern exclude', async () => {
            const root = '/project/foo';
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            let mainThreadCalled = false;
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadWorkspace, new class extends (0, mock_1.mock)() {
                async $startTextSearch(query, folder, options, requestId, token) {
                    mainThreadCalled = true;
                    assert.strictEqual(query.pattern, 'foo');
                    assert.deepStrictEqual(folder, null);
                    assert.strictEqual(options.includePattern, undefined);
                    assert.strictEqual(options.excludePattern, 'glob/**'); // exclude folder is ignored...
                    return null;
                }
            });
            const ws = createExtHostWorkspace(rpcProtocol, { id: 'foo', folders: [aWorkspaceFolderData(uri_1.URI.file(root), 0)], name: 'Test' }, new log_1.NullLogService());
            await ws.findTextInFiles({ pattern: 'foo' }, { exclude: new extHostTypes_1.RelativePattern('/other/folder', 'glob/**') }, () => { }, new extensions_1.ExtensionIdentifier('test'));
            assert(mainThreadCalled, 'mainThreadCalled');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdFdvcmtzcGFjZS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvYXBpL3Rlc3QvYnJvd3Nlci9leHRIb3N0V29ya3NwYWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUF5QmhHLFNBQVMsc0JBQXNCLENBQUMsV0FBeUIsRUFBRSxJQUFvQixFQUFFLFVBQXVCO1FBQ3ZHLE1BQU0sTUFBTSxHQUFHLElBQUksbUNBQWdCLENBQ2xDLElBQUkscUNBQWlCLENBQUMsV0FBVyxDQUFDLEVBQ2xDLElBQUksS0FBTSxTQUFRLElBQUEsV0FBSSxHQUEyQjtZQUE3Qzs7Z0JBQXlELGNBQVMsR0FBRyxJQUFJLENBQUM7WUFBQyxDQUFDO1NBQUEsRUFDaEYsSUFBSSxLQUFNLFNBQVEsSUFBQSxXQUFJLEdBQTBCO1lBQVksZUFBZSxLQUFLLE9BQU8sa0JBQU8sQ0FBQyxDQUFDLDZEQUFrRCxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztTQUFFLEVBQ2xLLFVBQVUsRUFDVixJQUFJLEtBQU0sU0FBUSxJQUFBLFdBQUksR0FBMEI7U0FBSSxDQUNwRCxDQUFDO1FBQ0YsTUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN4QyxPQUFPLE1BQU0sQ0FBQztJQUNmLENBQUM7SUFFRCxLQUFLLENBQUMsa0JBQWtCLEVBQUU7UUFFekIsU0FBUyxvQkFBb0IsQ0FBQyxTQUEyQixFQUFFLEtBQWEsRUFBRSxRQUFnQixFQUFFLGdCQUEwQjtZQUNySCxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFF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