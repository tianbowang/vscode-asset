/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "fs", "path", "vs/base/common/errors", "vs/base/common/network", "vs/editor/common/diff/legacyLinesDiffComputer", "vs/editor/common/diff/defaultLinesDiffComputer/defaultLinesDiffComputer"], function (require, exports, assert, fs_1, path_1, errors_1, network_1, legacyLinesDiffComputer_1, defaultLinesDiffComputer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('diffing fixtures', () => {
        setup(() => {
            (0, errors_1.setUnexpectedErrorHandler)(e => {
                throw e;
            });
        });
        const fixturesOutDir = network_1.FileAccess.asFileUri('vs/editor/test/node/diffing/fixtures').fsPath;
        // We want the dir in src, so we can directly update the source files if they disagree and create invalid files to capture the previous state.
        // This makes it very easy to update the fixtures.
        const fixturesSrcDir = (0, path_1.resolve)(fixturesOutDir).replaceAll('\\', '/').replace('/out/vs/editor/', '/src/vs/editor/');
        const folders = (0, fs_1.readdirSync)(fixturesSrcDir);
        function runTest(folder, diffingAlgoName) {
            const folderPath = (0, path_1.join)(fixturesSrcDir, folder);
            const files = (0, fs_1.readdirSync)(folderPath);
            const firstFileName = files.find(f => f.startsWith('1.'));
            const secondFileName = files.find(f => f.startsWith('2.'));
            const firstContent = (0, fs_1.readFileSync)((0, path_1.join)(folderPath, firstFileName), 'utf8').replaceAll('\r\n', '\n').replaceAll('\r', '\n');
            const firstContentLines = firstContent.split(/\n/);
            const secondContent = (0, fs_1.readFileSync)((0, path_1.join)(folderPath, secondFileName), 'utf8').replaceAll('\r\n', '\n').replaceAll('\r', '\n');
            const secondContentLines = secondContent.split(/\n/);
            const diffingAlgo = diffingAlgoName === 'legacy' ? new legacyLinesDiffComputer_1.LegacyLinesDiffComputer() : new defaultLinesDiffComputer_1.DefaultLinesDiffComputer();
            const ignoreTrimWhitespace = folder.indexOf('trimws') >= 0;
            const diff = diffingAlgo.computeDiff(firstContentLines, secondContentLines, { ignoreTrimWhitespace, maxComputationTimeMs: Number.MAX_SAFE_INTEGER, computeMoves: true });
            function getDiffs(changes) {
                return changes.map(c => ({
                    originalRange: c.original.toString(),
                    modifiedRange: c.modified.toString(),
                    innerChanges: c.innerChanges?.map(c => ({
                        originalRange: formatRange(c.originalRange, firstContentLines),
                        modifiedRange: formatRange(c.modifiedRange, secondContentLines),
                    })) || null
                }));
            }
            function formatRange(range, lines) {
                const toLastChar = range.endColumn === lines[range.endLineNumber - 1].length + 1;
                return '[' + range.startLineNumber + ',' + range.startColumn + ' -> ' + range.endLineNumber + ',' + range.endColumn + (toLastChar ? ' EOL' : '') + ']';
            }
            const actualDiffingResult = {
                original: { content: firstContent, fileName: `./${firstFileName}` },
                modified: { content: secondContent, fileName: `./${secondFileName}` },
                diffs: getDiffs(diff.changes),
                moves: diff.moves.map(v => ({
                    originalRange: v.lineRangeMapping.original.toString(),
                    modifiedRange: v.lineRangeMapping.modified.toString(),
                    changes: getDiffs(v.changes),
                }))
            };
            if (actualDiffingResult.moves?.length === 0) {
                delete actualDiffingResult.moves;
            }
            const expectedFilePath = (0, path_1.join)(folderPath, `${diffingAlgoName}.expected.diff.json`);
            const invalidFilePath = (0, path_1.join)(folderPath, `${diffingAlgoName}.invalid.diff.json`);
            const actualJsonStr = JSON.stringify(actualDiffingResult, null, '\t');
            if (!(0, fs_1.existsSync)(expectedFilePath)) {
                // New test, create expected file
                (0, fs_1.writeFileSync)(expectedFilePath, actualJsonStr);
                // Create invalid file so that this test fails on a re-run
                (0, fs_1.writeFileSync)(invalidFilePath, '');
                throw new Error('No expected file! Expected and invalid files were written. Delete the invalid file to make the test pass.');
            }
            if ((0, fs_1.existsSync)(invalidFilePath)) {
                const invalidJsonStr = (0, fs_1.readFileSync)(invalidFilePath, 'utf8');
                if (invalidJsonStr === '') {
                    // Update expected file
                    (0, fs_1.writeFileSync)(expectedFilePath, actualJsonStr);
                    throw new Error(`Delete the invalid ${invalidFilePath} file to make the test pass.`);
                }
                else {
                    const expectedFileDiffResult = JSON.parse(invalidJsonStr);
                    try {
                        assert.deepStrictEqual(actualDiffingResult, expectedFileDiffResult);
                    }
                    catch (e) {
                        (0, fs_1.writeFileSync)(expectedFilePath, actualJsonStr);
                        throw e;
                    }
                    // Test succeeded with the invalid file, restore expected file from invalid
                    (0, fs_1.writeFileSync)(expectedFilePath, invalidJsonStr);
                    (0, fs_1.rmSync)(invalidFilePath);
                }
            }
            else {
                const expectedJsonStr = (0, fs_1.readFileSync)(expectedFilePath, 'utf8');
                const expectedFileDiffResult = JSON.parse(expectedJsonStr);
                try {
                    assert.deepStrictEqual(actualDiffingResult, expectedFileDiffResult);
                }
                catch (e) {
                    // Backup expected file
                    (0, fs_1.writeFileSync)(invalidFilePath, expectedJsonStr);
                    // Update expected file
                    (0, fs_1.writeFileSync)(expectedFilePath, actualJsonStr);
                    throw e;
                }
            }
        }
        test(`test`, () => {
            runTest('shifting-twice', 'advanced');
        });
        for (const folder of folders) {
            for (const diffingAlgoName of ['legacy', 'advanced']) {
                test(`${folder}-${diffingAlgoName}`, () => {
                    runTest(folder, diffingAlgoName);
                });
            }
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4dHVyZXMudGVzdC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL3Rlc3Qvbm9kZS9kaWZmaW5nL2ZpeHR1cmVzLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7SUFZaEcsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtRQUM5QixLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsSUFBQSxrQ0FBeUIsRUFBQyxDQUFDLENBQUMsRUFBRTtnQkFDN0IsTUFBTSxDQUFDLENBQUM7WUFDVCxDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO1FBR0gsTUFBTSxjQUFjLEdBQUcsb0JBQVUsQ0FBQyxTQUFTLENBQUMsc0NBQXNDLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDM0YsOElBQThJO1FBQzlJLGtEQUFrRDtRQUNsRCxNQUFNLGNBQWMsR0FBRyxJQUFBLGNBQU8sRUFBQyxjQUFjLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ25ILE1BQU0sT0FBTyxHQUFHLElBQUEsZ0JBQVcsRUFBQyxjQUFjLENBQUMsQ0FBQztRQUU1QyxTQUFTLE9BQU8sQ0FBQyxNQUFjLEVBQUUsZUFBc0M7WUFDdEUsTUFBTSxVQUFVLEdBQUcsSUFBQSxXQUFJLEVBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBQ2hELE1BQU0sS0FBSyxHQUFHLElBQUEsZ0JBQVcsRUFBQyxVQUFVLENBQUMsQ0FBQztZQUV0QyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBRSxDQUFDO1lBQzNELE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFFLENBQUM7WUFFNUQsTUFBTSxZQUFZLEdBQUcsSUFBQSxpQkFBWSxFQUFDLElBQUEsV0FBSSxFQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDM0gsTUFBTSxpQkFBaUIsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ25ELE1BQU0sYUFBYSxHQUFHLElBQUEsaUJBQVksRUFBQyxJQUFBLFdBQUksRUFBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdILE1BQU0sa0JBQWtCLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVyRCxNQUFNLFdBQVcsR0FBRyxlQUFlLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLGlEQUF1QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksbURBQXdCLEVBQUUsQ0FBQztZQUVsSCxNQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNELE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsRUFBRSxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7WUFFekssU0FBUyxRQUFRLENBQUMsT0FBNEM7Z0JBQzdELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBZ0IsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN2QyxhQUFhLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUU7b0JBQ3BDLGFBQWEsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTtvQkFDcEMsWUFBWSxFQUFFLENBQUMsQ0FBQyxZQUFZLEVBQUUsR0FBRyxDQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDOUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLGlCQUFpQixDQUFDO3dCQUM5RCxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsa0JBQWtCLENBQUM7cUJBQy9ELENBQUMsQ0FBQyxJQUFJLElBQUk7aUJBQ1gsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1lBRUQsU0FBUyxXQUFXLENBQUMsS0FBWSxFQUFFLEtBQWU7Z0JBQ2pELE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxTQUFTLEtBQUssS0FBSyxDQUFDLEtBQUssQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztnQkFFakYsT0FBTyxHQUFHLEdBQUcsS0FBSyxDQUFDLGVBQWUsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLFdBQVcsR0FBRyxNQUFNLEdBQUcsS0FBSyxDQUFDLGFBQWEsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLFNBQVMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLENBQUM7WUFDeEosQ0FBQztZQUVELE1BQU0sbUJBQW1CLEdBQWtCO2dCQUMxQyxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxLQUFLLGFBQWEsRUFBRSxFQUFFO2dCQUNuRSxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxLQUFLLGNBQWMsRUFBRSxFQUFFO2dCQUNyRSxLQUFLLEVBQUUsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7Z0JBQzdCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzNCLGFBQWEsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRTtvQkFDckQsYUFBYSxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFO29CQUNyRCxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7aUJBQzVCLENBQUMsQ0FBQzthQUNILENBQUM7WUFDRixJQUFJLG1CQUFtQixDQUFDLEtBQUssRUFBRSxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7Z0JBQzdDLE9BQU8sbUJBQW1CLENBQUMsS0FBSyxDQUFDO1lBQ2xDLENBQUM7WUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUEsV0FBSSxFQUFDLFVBQVUsRUFBRSxHQUFHLGVBQWUscUJBQXFCLENBQUMsQ0FBQztZQUNuRixNQUFNLGVBQWUsR0FBRyxJQUFBLFdBQUksRUFBQyxVQUFVLEVBQUUsR0FBRyxlQUFlLG9CQUFvQixDQUFDLENBQUM7WUFFakYsTUFBTSxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFdEUsSUFBSSxDQUFDLElBQUEsZUFBVSxFQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztnQkFDbkMsaUNBQWlDO2dCQUNqQyxJQUFBLGtCQUFhLEVBQUMsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQy9DLDBEQUEwRDtnQkFDMUQsSUFBQSxrQkFBYSxFQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDbkMsTUFBTSxJQUFJLEtBQUssQ0FBQywyR0FBMkcsQ0FBQyxDQUFDO1lBQzlILENBQUM7WUFBQyxJQUFJLElBQUEsZUFBVSxFQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUM7Z0JBQ25DLE1BQU0sY0FBYyxHQUFHLElBQUEsaUJBQVksRUFBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUM7Z0JBQzdELElBQUksY0FBYyxLQUFLLEVBQUUsRUFBRSxDQUFDO29CQUMzQix1QkFBdUI7b0JBQ3ZCLElBQUEsa0JBQWEsRUFBQyxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFDL0MsTUFBTSxJQUFJLEtBQUssQ0FBQyxzQkFBc0IsZUFBZSw4QkFBOEIsQ0FBQyxDQUFDO2dCQUN0RixDQUFDO3FCQUFNLENBQUM7b0JBQ1AsTUFBTSxzQkFBc0IsR0FBa0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDekUsSUFBSSxDQUFDO3dCQUNKLE1BQU0sQ0FBQyxlQUFlLENBQUMsbUJBQW1CLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztvQkFDckUsQ0FBQztvQkFBQyxPQUFPLENBQUMsRUFBRSxDQUFDO3dCQUNaLElBQUEsa0JBQWEsRUFBQyxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsQ0FBQzt3QkFDL0MsTUFBTSxDQUFDLENBQUM7b0JBQ1QsQ0FBQztvQkFDRCwyRUFBMkU7b0JBQzNFLElBQUEsa0JBQWEsRUFBQyxnQkFBZ0IsRUFBRSxjQUFjLENBQUMsQ0FBQztvQkFDaEQsSUFBQSxXQUFNLEVBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3pCLENBQUM7WUFDRixDQUFDO2lCQUFNLENBQUM7Z0JBQ1AsTUFBTSxlQUFlLEdBQUcsSUFBQSxpQkFBWSxFQUFDLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUMvRCxNQUFNLHNCQUFzQixHQUFrQixJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUMxRSxJQUFJLENBQUM7b0JBQ0osTUFBTSxDQUFDLGVBQWUsQ0FBQyxtQkFBbUIsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO2dCQUNyRSxDQUFDO2dCQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7b0JBQ1osdUJBQXVCO29CQUN2QixJQUFBLGtCQUFhLEVBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO29CQUNoRCx1QkFBdUI7b0JBQ3ZCLElBQUEsa0JBQWEsRUFBQyxnQkFBZ0IsRUFBRSxhQUFhLENBQUMsQ0FBQztvQkFDL0MsTUFBTSxDQUFDLENBQUM7Z0JBQ1QsQ0FBQztZQUNGLENBQUM7UUFDRixDQUFDO1FBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7WUFDakIsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBRUgsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUUsQ0FBQztZQUM5QixLQUFLLE1BQU0sZUFBZSxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBVSxFQUFFLENBQUM7Z0JBQy9ELElBQUksQ0FBQyxHQUFHLE1BQU0sSUFBSSxlQUFlLEVBQUUsRUFBRSxHQUFHLEVBQUU7b0JBQ3pDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUM7Z0JBQ2xDLENBQUMsQ0FBQyxDQUFDO1lBQ0osQ0FBQztRQUNGLENBQUM7SUFDRixDQUFDLENBQUMsQ0FBQyJ9