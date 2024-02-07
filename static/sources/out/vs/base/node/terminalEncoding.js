/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "vs/base/common/platform"], function (require, exports, child_process_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveTerminalEncoding = void 0;
    const windowsTerminalEncodings = {
        '437': 'cp437', // United States
        '850': 'cp850', // Multilingual(Latin I)
        '852': 'cp852', // Slavic(Latin II)
        '855': 'cp855', // Cyrillic(Russian)
        '857': 'cp857', // Turkish
        '860': 'cp860', // Portuguese
        '861': 'cp861', // Icelandic
        '863': 'cp863', // Canadian - French
        '865': 'cp865', // Nordic
        '866': 'cp866', // Russian
        '869': 'cp869', // Modern Greek
        '936': 'cp936', // Simplified Chinese
        '1252': 'cp1252' // West European Latin
    };
    function toIconvLiteEncoding(encodingName) {
        const normalizedEncodingName = encodingName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const mapped = JSCHARDET_TO_ICONV_ENCODINGS[normalizedEncodingName];
        return mapped || normalizedEncodingName;
    }
    const JSCHARDET_TO_ICONV_ENCODINGS = {
        'ibm866': 'cp866',
        'big5': 'cp950'
    };
    const UTF8 = 'utf8';
    async function resolveTerminalEncoding(verbose) {
        let rawEncodingPromise;
        // Support a global environment variable to win over other mechanics
        const cliEncodingEnv = process.env['VSCODE_CLI_ENCODING'];
        if (cliEncodingEnv) {
            if (verbose) {
                console.log(`Found VSCODE_CLI_ENCODING variable: ${cliEncodingEnv}`);
            }
            rawEncodingPromise = Promise.resolve(cliEncodingEnv);
        }
        // Windows: educated guess
        else if (platform_1.isWindows) {
            rawEncodingPromise = new Promise(resolve => {
                if (verbose) {
                    console.log('Running "chcp" to detect terminal encoding...');
                }
                (0, child_process_1.exec)('chcp', (err, stdout, stderr) => {
                    if (stdout) {
                        if (verbose) {
                            console.log(`Output from "chcp" command is: ${stdout}`);
                        }
                        const windowsTerminalEncodingKeys = Object.keys(windowsTerminalEncodings);
                        for (const key of windowsTerminalEncodingKeys) {
                            if (stdout.indexOf(key) >= 0) {
                                return resolve(windowsTerminalEncodings[key]);
                            }
                        }
                    }
                    return resolve(undefined);
                });
            });
        }
        // Linux/Mac: use "locale charmap" command
        else {
            rawEncodingPromise = new Promise(resolve => {
                if (verbose) {
                    console.log('Running "locale charmap" to detect terminal encoding...');
                }
                (0, child_process_1.exec)('locale charmap', (err, stdout, stderr) => resolve(stdout));
            });
        }
        const rawEncoding = await rawEncodingPromise;
        if (verbose) {
            console.log(`Detected raw terminal encoding: ${rawEncoding}`);
        }
        if (!rawEncoding || rawEncoding.toLowerCase() === 'utf-8' || rawEncoding.toLowerCase() === UTF8) {
            return UTF8;
        }
        return toIconvLiteEncoding(rawEncoding);
    }
    exports.resolveTerminalEncoding = resolveTerminalEncoding;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxFbmNvZGluZy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvYmFzZS9ub2RlL3Rlcm1pbmFsRW5jb2RpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQU0sd0JBQXdCLEdBQUc7UUFDaEMsS0FBSyxFQUFFLE9BQU8sRUFBRSxnQkFBZ0I7UUFDaEMsS0FBSyxFQUFFLE9BQU8sRUFBRSx3QkFBd0I7UUFDeEMsS0FBSyxFQUFFLE9BQU8sRUFBRSxtQkFBbUI7UUFDbkMsS0FBSyxFQUFFLE9BQU8sRUFBRSxvQkFBb0I7UUFDcEMsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFVO1FBQzFCLEtBQUssRUFBRSxPQUFPLEVBQUUsYUFBYTtRQUM3QixLQUFLLEVBQUUsT0FBTyxFQUFFLFlBQVk7UUFDNUIsS0FBSyxFQUFFLE9BQU8sRUFBRSxvQkFBb0I7UUFDcEMsS0FBSyxFQUFFLE9BQU8sRUFBRSxTQUFTO1FBQ3pCLEtBQUssRUFBRSxPQUFPLEVBQUUsVUFBVTtRQUMxQixLQUFLLEVBQUUsT0FBTyxFQUFFLGVBQWU7UUFDL0IsS0FBSyxFQUFFLE9BQU8sRUFBRSxxQkFBcUI7UUFDckMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxzQkFBc0I7S0FDdkMsQ0FBQztJQUVGLFNBQVMsbUJBQW1CLENBQUMsWUFBb0I7UUFDaEQsTUFBTSxzQkFBc0IsR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN2RixNQUFNLE1BQU0sR0FBRyw0QkFBNEIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBRXBFLE9BQU8sTUFBTSxJQUFJLHNCQUFzQixDQUFDO0lBQ3pDLENBQUM7SUFFRCxNQUFNLDRCQUE0QixHQUErQjtRQUNoRSxRQUFRLEVBQUUsT0FBTztRQUNqQixNQUFNLEVB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