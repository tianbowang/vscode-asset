/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "os", "vs/base/common/async", "vs/base/common/extpath", "vs/base/node/pfs", "vs/base/node/terminalEncoding"], function (require, exports, os_1, async_1, extpath_1, pfs_1, terminalEncoding_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readFromStdin = exports.getStdinFilePath = exports.stdinDataListener = exports.hasStdinWithoutTty = void 0;
    function hasStdinWithoutTty() {
        try {
            return !process.stdin.isTTY; // Via https://twitter.com/MylesBorins/status/782009479382626304
        }
        catch (error) {
            // Windows workaround for https://github.com/nodejs/node/issues/11656
        }
        return false;
    }
    exports.hasStdinWithoutTty = hasStdinWithoutTty;
    function stdinDataListener(durationinMs) {
        return new Promise(resolve => {
            const dataListener = () => resolve(true);
            // wait for 1s maximum...
            setTimeout(() => {
                process.stdin.removeListener('data', dataListener);
                resolve(false);
            }, durationinMs);
            // ...but finish early if we detect data
            process.stdin.once('data', dataListener);
        });
    }
    exports.stdinDataListener = stdinDataListener;
    function getStdinFilePath() {
        return (0, extpath_1.randomPath)((0, os_1.tmpdir)(), 'code-stdin', 3);
    }
    exports.getStdinFilePath = getStdinFilePath;
    async function readFromStdin(targetPath, verbose, onEnd) {
        let [encoding, iconv] = await Promise.all([
            (0, terminalEncoding_1.resolveTerminalEncoding)(verbose),
            new Promise((resolve_1, reject_1) => { require(['@vscode/iconv-lite-umd'], resolve_1, reject_1); }), // lazy load encoding module for usage
            pfs_1.Promises.appendFile(targetPath, '') // make sure file exists right away (https://github.com/microsoft/vscode/issues/155341)
        ]);
        if (!iconv.encodingExists(encoding)) {
            console.log(`Unsupported terminal encoding: ${encoding}, falling back to UTF-8.`);
            encoding = 'utf8';
        }
        // Use a `Queue` to be able to use `appendFile`
        // which helps file watchers to be aware of the
        // changes because each append closes the underlying
        // file descriptor.
        // (https://github.com/microsoft/vscode/issues/148952)
        const appendFileQueue = new async_1.Queue();
        const decoder = iconv.getDecoder(encoding);
        process.stdin.on('data', chunk => {
            const chunkStr = decoder.write(chunk);
            appendFileQueue.queue(() => pfs_1.Promises.appendFile(targetPath, chunkStr));
        });
        process.stdin.on('end', () => {
            const end = decoder.end();
            appendFileQueue.queue(async () => {
                try {
                    if (typeof end === 'string') {
                        await pfs_1.Promises.appendFile(targetPath, end);
                    }
                }
                finally {
                    onEnd?.();
                }
            });
        });
    }
    exports.readFromStdin = readFromStdin;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RkaW4uanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2Vudmlyb25tZW50L25vZGUvc3RkaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLFNBQWdCLGtCQUFrQjtRQUNqQyxJQUFJLENBQUM7WUFDSixPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxnRUFBZ0U7UUFDOUYsQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDaEIscUVBQXFFO1FBQ3RFLENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUM7SUFQRCxnREFPQztJQUVELFNBQWdCLGlCQUFpQixDQUFDLFlBQW9CO1FBQ3JELE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDNUIsTUFBTSxZQUFZLEdBQUcsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRXpDLHlCQUF5QjtZQUN6QixVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLE1BQU0sRUFBRSxZQUFZLENBQUMsQ0FBQztnQkFFbkQsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hCLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUVqQix3Q0FBd0M7WUFDeEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQWRELDhDQWNDO0lBRUQsU0FBZ0IsZ0JBQWdCO1FBQy9CLE9BQU8sSUFBQSxvQkFBVSxFQUFDLElBQUEsV0FBTSxHQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFGRCw0Q0FFQztJQUVNLEtBQUssVUFBVSxhQUFhLENBQUMsVUFBa0IsRUFBRSxPQUFnQixFQUFFLEtBQWdCO1FBRXpGLElBQUksQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDO1lBQ3pDLElBQUEsMENBQXVCLEVBQUMsT0FBTyxDQUFDOzREQUN6Qix3QkFBd0IsNkJBQUcsc0NBQXNDO1lBQ3hFLGNBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLHVGQUF1RjtTQUMzSCxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO1lBQ3JDLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLFFBQVEsMEJBQTBCLENBQUMsQ0FBQztZQUNsRixRQUFRLEdBQUcsTUFBTSxDQUFDO1FBQ25CLENBQUM7UUFFRCwrQ0FBK0M7UUFDL0MsK0NBQStDO1FBQy9DLG9EQUFvRDtRQUNwRCxtQkFBbUI7UUFDbkIsc0RBQXNEO1FBRXRELE1BQU0sZUFBZSxHQUFHLElBQUksYUFBSyxFQUFFLENBQUM7UUFFcEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUUzQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLEVBQUU7WUFDaEMsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN0QyxlQUFlLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLGNBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDeEUsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO1lBQzVCLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUUxQixlQUFlLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUNoQyxJQUFJLENBQUM7b0JBQ0osSUFBSSxPQUFPLEdBQUcsS0FBSyxRQUFRLEVBQUUsQ0FBQzt3QkFDN0IsTUFBTSxjQUFRLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDNUMsQ0FBQztnQkFDRixDQUFDO3dCQUFTLENBQUM7b0JBQ1YsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFDWCxDQUFDO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUF6Q0Qsc0NBeUNDIn0=