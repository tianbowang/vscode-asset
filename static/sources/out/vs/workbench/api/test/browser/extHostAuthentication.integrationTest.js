/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/lifecycle", "vs/platform/dialogs/common/dialogs", "vs/platform/dialogs/test/common/testDialogService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/platform/notification/common/notification", "vs/platform/notification/test/common/testNotificationService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/platform/telemetry/common/telemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/workbench/api/browser/mainThreadAuthentication", "vs/workbench/api/common/extHost.protocol", "vs/workbench/api/common/extHostAuthentication", "vs/workbench/services/activity/common/activity", "vs/workbench/services/authentication/browser/authenticationService", "vs/workbench/services/authentication/common/authentication", "vs/workbench/services/extensions/common/extensions", "vs/workbench/services/remote/common/remoteAgentService", "vs/workbench/api/test/common/testRPCProtocol", "vs/workbench/test/browser/workbenchTestServices", "vs/workbench/test/common/workbenchTestServices", "vs/workbench/services/environment/browser/environmentService"], function (require, exports, assert, lifecycle_1, dialogs_1, testDialogService_1, instantiationServiceMock_1, notification_1, testNotificationService_1, quickInput_1, storage_1, telemetry_1, telemetryUtils_1, mainThreadAuthentication_1, extHost_protocol_1, extHostAuthentication_1, activity_1, authenticationService_1, authentication_1, extensions_1, remoteAgentService_1, testRPCProtocol_1, workbenchTestServices_1, workbenchTestServices_2, environmentService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AuthQuickPick {
        constructor() {
            this.items = [];
        }
        get selectedItems() {
            return this.items;
        }
        onDidAccept(listener) {
            this.listener = listener;
        }
        onDidHide(listener) {
        }
        dispose() {
        }
        show() {
            this.listener({
                inBackground: false
            });
        }
    }
    class AuthTestQuickInputService extends workbenchTestServices_1.TestQuickInputService {
        createQuickPick() {
            return new AuthQuickPick();
        }
    }
    class TestAuthProvider {
        constructor(authProviderName) {
            this.authProviderName = authProviderName;
            this.id = 1;
            this.sessions = new Map();
            this.onDidChangeSessions = () => { return { dispose() { } }; };
        }
        async getSessions(scopes) {
            if (!scopes) {
                return [...this.sessions.values()];
            }
            if (scopes[0] === 'return multiple') {
                return [...this.sessions.values()];
            }
            const sessions = this.sessions.get(scopes.join(' '));
            return sessions ? [sessions] : [];
        }
        async createSession(scopes) {
            const scopesStr = scopes.join(' ');
            const session = {
                scopes,
                id: `${this.id}`,
                account: {
                    label: this.authProviderName,
                    id: `${this.id}`,
                },
                accessToken: Math.random() + '',
            };
            this.sessions.set(scopesStr, session);
            this.id++;
            return session;
        }
        async removeSession(sessionId) {
            this.sessions.delete(sessionId);
        }
    }
    suite('ExtHostAuthentication', () => {
        let disposables;
        let extHostAuthentication;
        let instantiationService;
        suiteSetup(async () => {
            instantiationService = new instantiationServiceMock_1.TestInstantiationService();
            instantiationService.stub(dialogs_1.IDialogService, new testDialogService_1.TestDialogService({ confirmed: true }));
            instantiationService.stub(storage_1.IStorageService, new workbenchTestServices_2.TestStorageService());
            instantiationService.stub(quickInput_1.IQuickInputService, new AuthTestQuickInputService());
            instantiationService.stub(extensions_1.IExtensionService, new workbenchTestServices_2.TestExtensionService());
            instantiationService.stub(activity_1.IActivityService, new workbenchTestServices_2.TestActivityService());
            instantiationService.stub(remoteAgentService_1.IRemoteAgentService, new workbenchTestServices_1.TestRemoteAgentService());
            instantiationService.stub(notification_1.INotificationService, new testNotificationService_1.TestNotificationService());
            instantiationService.stub(telemetry_1.ITelemetryService, telemetryUtils_1.NullTelemetryService);
            instantiationService.stub(environmentService_1.IBrowserWorkbenchEnvironmentService, workbenchTestServices_1.TestEnvironmentService);
            const rpcProtocol = new testRPCProtocol_1.TestRPCProtocol();
            instantiationService.stub(authentication_1.IAuthenticationService, instantiationService.createInstance(authenticationService_1.AuthenticationService));
            rpcProtocol.set(extHost_protocol_1.MainContext.MainThreadAuthentication, instantiationService.createInstance(mainThreadAuthentication_1.MainThreadAuthentication, rpcProtocol));
            extHostAuthentication = new extHostAuthentication_1.ExtHostAuthentication(rpcProtocol);
            rpcProtocol.set(extHost_protocol_1.ExtHostContext.ExtHostAuthentication, extHostAuthentication);
        });
        setup(async () => {
            disposables = new lifecycle_1.DisposableStore();
            disposables.add(extHostAuthentication.registerAuthenticationProvider('test', 'test provider', new TestAuthProvider('test')));
            disposables.add(extHostAuthentication.registerAuthenticationProvider('test-multiple', 'test multiple provider', new TestAuthProvider('test-multiple'), { supportsMultipleAccounts: true }));
        });
        suiteTeardown(() => {
            instantiationService.dispose();
        });
        teardown(() => {
            disposables.dispose();
        });
        test('createIfNone - true', async () => {
            const scopes = ['foo'];
            const session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
        });
        test('createIfNone - false', async () => {
            const scopes = ['foo'];
            const nosession = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {});
            assert.strictEqual(nosession, undefined);
            // Now create the session
            const session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {});
            assert.strictEqual(session2?.id, session.id);
            assert.strictEqual(session2?.scopes[0], session.scopes[0]);
            assert.strictEqual(session2?.accessToken, session.accessToken);
        });
        // should behave the same as createIfNone: false
        test('silent - true', async () => {
            const scopes = ['foo'];
            const nosession = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                silent: true
            });
            assert.strictEqual(nosession, undefined);
            // Now create the session
            const session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                silent: true
            });
            assert.strictEqual(session.id, session2?.id);
            assert.strictEqual(session.scopes[0], session2?.scopes[0]);
        });
        test('forceNewSession - true - existing session', async () => {
            const scopes = ['foo'];
            const session1 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                createIfNone: true
            });
            // Now create the session
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                forceNewSession: true
            });
            assert.strictEqual(session2?.id, '2');
            assert.strictEqual(session2?.scopes[0], 'foo');
            assert.notStrictEqual(session1.accessToken, session2?.accessToken);
        });
        // Should behave like createIfNone: true
        test('forceNewSession - true - no existing session', async () => {
            const scopes = ['foo'];
            const session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                forceNewSession: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
        });
        test('forceNewSession - detail', async () => {
            const scopes = ['foo'];
            const session1 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                createIfNone: true
            });
            // Now create the session
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', scopes, {
                forceNewSession: { detail: 'bar' }
            });
            assert.strictEqual(session2?.id, '2');
            assert.strictEqual(session2?.scopes[0], 'foo');
            assert.notStrictEqual(session1.accessToken, session2?.accessToken);
        });
        //#region Multi-Account AuthProvider
        test('clearSessionPreference - true', async () => {
            const scopes = ['foo'];
            // Now create the session
            const session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], scopes[0]);
            const scopes2 = ['bar'];
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', scopes2, {
                createIfNone: true
            });
            assert.strictEqual(session2?.id, '2');
            assert.strictEqual(session2?.scopes[0], scopes2[0]);
            const session3 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['return multiple'], {
                clearSessionPreference: true,
                createIfNone: true
            });
            // clearing session preference causes us to get the first session
            // because it would normally show a quick pick for the user to choose
            assert.strictEqual(session3?.id, session.id);
            assert.strictEqual(session3?.scopes[0], session.scopes[0]);
            assert.strictEqual(session3?.accessToken, session.accessToken);
        });
        test('silently getting session should return a session (if any) regardless of preference - fixes #137819', async () => {
            const scopes = ['foo'];
            // Now create the session
            const session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', scopes, {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], scopes[0]);
            const scopes2 = ['bar'];
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', scopes2, {
                createIfNone: true
            });
            assert.strictEqual(session2?.id, '2');
            assert.strictEqual(session2?.scopes[0], scopes2[0]);
            const shouldBeSession1 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', scopes, {});
            assert.strictEqual(shouldBeSession1?.id, session.id);
            assert.strictEqual(shouldBeSession1?.scopes[0], session.scopes[0]);
            assert.strictEqual(shouldBeSession1?.accessToken, session.accessToken);
            const shouldBeSession2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', scopes2, {});
            assert.strictEqual(shouldBeSession2?.id, session2.id);
            assert.strictEqual(shouldBeSession2?.scopes[0], session2.scopes[0]);
            assert.strictEqual(shouldBeSession2?.accessToken, session2.accessToken);
        });
        //#endregion
        //#region error cases
        test('createIfNone and forceNewSession', async () => {
            try {
                await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', ['foo'], {
                    createIfNone: true,
                    forceNewSession: true
                });
                assert.fail('should have thrown an Error.');
            }
            catch (e) {
                assert.ok(e);
            }
        });
        test('forceNewSession and silent', async () => {
            try {
                await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', ['foo'], {
                    forceNewSession: true,
                    silent: true
                });
                assert.fail('should have thrown an Error.');
            }
            catch (e) {
                assert.ok(e);
            }
        });
        test('createIfNone and silent', async () => {
            try {
                await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', ['foo'], {
                    createIfNone: true,
                    silent: true
                });
                assert.fail('should have thrown an Error.');
            }
            catch (e) {
                assert.ok(e);
            }
        });
        test('Can get multiple sessions (with different scopes) in one extension', async () => {
            let session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['foo'], {
                createIfNone: true
            });
            session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['bar'], {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '2');
            assert.strictEqual(session?.scopes[0], 'bar');
            session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['foo'], {
                createIfNone: false
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
        });
        test('Can get multiple sessions (from different providers) in one extension', async () => {
            let session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['foo'], {
                createIfNone: true
            });
            session = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', ['foo'], {
                createIfNone: true
            });
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
            assert.strictEqual(session?.account.label, 'test');
            const session2 = await extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['foo'], {
                createIfNone: false
            });
            assert.strictEqual(session2?.id, '1');
            assert.strictEqual(session2?.scopes[0], 'foo');
            assert.strictEqual(session2?.account.label, 'test-multiple');
        });
        test('Can get multiple sessions (from different providers) in one extension at the same time', async () => {
            const sessionP = extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test', ['foo'], {
                createIfNone: true
            });
            const session2P = extHostAuthentication.getSession(extensions_1.nullExtensionDescription, 'test-multiple', ['foo'], {
                createIfNone: true
            });
            const session = await sessionP;
            assert.strictEqual(session?.id, '1');
            assert.strictEqual(session?.scopes[0], 'foo');
            assert.strictEqual(session?.account.label, 'test');
            const session2 = await session2P;
            assert.strictEqual(session2?.id, '1');
            assert.strictEqual(session2?.scopes[0], 'foo');
            assert.strictEqual(session2?.account.label, 'test-multiple');
        });
        //#endregion
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0SG9zdEF1dGhlbnRpY2F0aW9uLmludGVncmF0aW9uVGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2FwaS90ZXN0L2Jyb3dzZXIvZXh0SG9zdEF1dGhlbnRpY2F0aW9uLmludGVncmF0aW9uVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQTJCaEcsTUFBTSxhQUFhO1FBQW5CO1lBRVEsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQW1CbkIsQ0FBQztRQWxCQSxJQUFXLGFBQWE7WUFDdkIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ25CLENBQUM7UUFFRCxXQUFXLENBQUMsUUFBOEM7WUFDekQsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDMUIsQ0FBQztRQUNELFNBQVMsQ0FBQyxRQUEwQztRQUVwRCxDQUFDO1FBQ0QsT0FBTztRQUVQLENBQUM7UUFDRCxJQUFJO1lBQ0gsSUFBSSxDQUFDLFFBQVMsQ0FBQztnQkFDZCxZQUFZLEVBQUUsS0FBSzthQUNuQixDQUFDLENBQUM7UUFDSixDQUFDO0tBQ0Q7SUFDRCxNQUFNLHlCQUEwQixTQUFRLDZDQUFxQjtRQUNuRCxlQUFlO1lBQ3ZCLE9BQVksSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUNqQyxDQUFDO0tBQ0Q7SUFFRCxNQUFNLGdCQUFnQjtRQUlyQixZQUE2QixnQkFBd0I7WUFBeEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFRO1lBSDdDLE9BQUUsR0FBRyxDQUFDLENBQUM7WUFDUCxhQUFRLEdBQUcsSUFBSSxHQUFHLEVBQWlDLENBQUM7WUFDNUQsd0JBQW1CLEdBQUcsR0FBRyxFQUFFLEdBQUcsT0FBTyxFQUFFLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNELENBQUM7UUFDMUQsS0FBSyxDQUFDLFdBQVcs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