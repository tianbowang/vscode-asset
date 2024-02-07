/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "crypto", "vs/base/test/common/utils", "vs/workbench/contrib/tags/common/workspaceTags"], function (require, exports, assert, crypto, utils_1, workspaceTags_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getHashedRemotesFromConfig = void 0;
    function hash(value) {
        return crypto.createHash('sha1').update(value.toString()).digest('hex');
    }
    async function asyncHash(value) {
        return hash(value);
    }
    async function getHashedRemotesFromConfig(text, stripEndingDotGit = false) {
        return (0, workspaceTags_1.getHashedRemotesFromConfig)(text, stripEndingDotGit, remote => asyncHash(remote));
    }
    exports.getHashedRemotesFromConfig = getHashedRemotesFromConfig;
    suite('Telemetry - WorkspaceTags', () => {
        test('Single remote hashed', async function () {
            assert.deepStrictEqual(await getHashedRemotesFromConfig(remote('https://username:password@github3.com/username/repository.git')), [hash('github3.com/username/repository.git')]);
            assert.deepStrictEqual(await getHashedRemotesFromConfig(remote('ssh://user@git.server.org/project.git')), [hash('git.server.org/project.git')]);
            assert.deepStrictEqual(await getHashedRemotesFromConfig(remote('user@git.server.org:project.git')), [hash('git.server.org/project.git')]);
            assert.deepStrictEqual(await getHashedRemotesFromConfig(remote('/opt/git/project.git')), []);
            // Strip .git
            assert.deepStrictEqual(await getHashedRemotesFromConfig(remote('https://username:password@github3.com/username/repository.git'), true), [hash('github3.com/username/repository')]);
            assert.deepStrictEqual(await getHashedRemotesFromConfig(remote('ssh://user@git.server.org/project.git'), true), [hash('git.server.org/project')]);
            assert.deepStrictEqual(await getHashedRemotesFromConfig(remote('user@git.server.org:project.git'), true), [hash('git.server.org/project')]);
            assert.deepStrictEqual(await getHashedRemotesFromConfig(remote('/opt/git/project.git'), true), []);
            // Compare Striped .git with no .git
            assert.deepStrictEqual(await getHashedRemotesFromConfig(remote('https://username:password@github3.com/username/repository.git'), true), await getHashedRemotesFromConfig(remote('https://username:password@github3.com/username/repository')));
            assert.deepStrictEqual(await getHashedRemotesFromConfig(remote('ssh://user@git.server.org/project.git'), true), await getHashedRemotesFromConfig(remote('ssh://user@git.server.org/project')));
            assert.deepStrictEqual(await getHashedRemotesFromConfig(remote('user@git.server.org:project.git'), true), [hash('git.server.org/project')]);
            assert.deepStrictEqual(await getHashedRemotesFromConfig(remote('/opt/git/project.git'), true), await getHashedRemotesFromConfig(remote('/opt/git/project')));
        });
        test('Multiple remotes hashed', async function () {
            const config = ['https://github.com/microsoft/vscode.git', 'https://git.example.com/gitproject.git'].map(remote).join(' ');
            assert.deepStrictEqual(await getHashedRemotesFromConfig(config), [hash('github.com/microsoft/vscode.git'), hash('git.example.com/gitproject.git')]);
            // Strip .git
            assert.deepStrictEqual(await getHashedRemotesFromConfig(config, true), [hash('github.com/microsoft/vscode'), hash('git.example.com/gitproject')]);
            // Compare Striped .git with no .git
            const noDotGitConfig = ['https://github.com/microsoft/vscode', 'https://git.example.com/gitproject'].map(remote).join(' ');
            assert.deepStrictEqual(await getHashedRemotesFromConfig(config, true), await getHashedRemotesFromConfig(noDotGitConfig));
        });
        function remote(url) {
            return `[remote "origin"]
	url = ${url}
	fetch = +refs/heads/*:refs/remotes/origin/*
`;
        }
        (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NwYWNlVGFncy50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90YWdzL3Rlc3Qvbm9kZS93b3Jrc3BhY2VUYWdzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBT2hHLFNBQVMsSUFBSSxDQUFDLEtBQWE7UUFDMUIsT0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDekUsQ0FBQztJQUVELEtBQUssVUFBVSxTQUFTLENBQUMsS0FBYTtRQUNyQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBRU0sS0FBSyxVQUFVLDBCQUEwQixDQUFDLElBQVksRUFBRSxvQkFBNkIsS0FBSztRQUNoRyxPQUFPLElBQUEsMENBQThCLEVBQUMsSUFBSSxFQUFFLGlCQUFpQixFQUFFLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDN0YsQ0FBQztJQUZELGdFQUVDO0lBRUQsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtRQUV2QyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsS0FBSztZQUNqQyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sMEJBQTBCLENBQUMsTUFBTSxDQUFDLCtEQUErRCxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqTCxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sMEJBQTBCLENBQUMsTUFBTSxDQUFDLHVDQUF1QyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxD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