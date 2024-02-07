/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/base/common/path", "vs/base/node/pfs", "vs/base/common/network"], function (require, exports, assert, path, pfs_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.assertMapping = exports.readRawMapping = exports.assertResolveKeybinding = exports.assertResolveKeyboardEvent = void 0;
    function toIResolvedKeybinding(kb) {
        return {
            label: kb.getLabel(),
            ariaLabel: kb.getAriaLabel(),
            electronAccelerator: kb.getElectronAccelerator(),
            userSettingsLabel: kb.getUserSettingsLabel(),
            isWYSIWYG: kb.isWYSIWYG(),
            isMultiChord: kb.hasMultipleChords(),
            dispatchParts: kb.getDispatchChords(),
            singleModifierDispatchParts: kb.getSingleModifierDispatchChords()
        };
    }
    function assertResolveKeyboardEvent(mapper, keyboardEvent, expected) {
        const actual = toIResolvedKeybinding(mapper.resolveKeyboardEvent(keyboardEvent));
        assert.deepStrictEqual(actual, expected);
    }
    exports.assertResolveKeyboardEvent = assertResolveKeyboardEvent;
    function assertResolveKeybinding(mapper, keybinding, expected) {
        const actual = mapper.resolveKeybinding(keybinding).map(toIResolvedKeybinding);
        assert.deepStrictEqual(actual, expected);
    }
    exports.assertResolveKeybinding = assertResolveKeybinding;
    function readRawMapping(file) {
        return pfs_1.Promises.readFile(network_1.FileAccess.asFileUri(`vs/workbench/services/keybinding/test/node/${file}.js`).fsPath).then((buff) => {
            const contents = buff.toString();
            const func = new Function('define', contents); // CodeQL [SM01632] This is used in tests and we read the files as JS to avoid slowing down TS compilation
            let rawMappings = null;
            func(function (value) {
                rawMappings = value;
            });
            return rawMappings;
        });
    }
    exports.readRawMapping = readRawMapping;
    function assertMapping(writeFileIfDifferent, mapper, file) {
        const filePath = path.normalize(network_1.FileAccess.asFileUri(`vs/workbench/services/keybinding/test/node/${file}`).fsPath);
        return pfs_1.Promises.readFile(filePath).then((buff) => {
            const expected = buff.toString().replace(/\r\n/g, '\n');
            const actual = mapper.dumpDebugInfo().replace(/\r\n/g, '\n');
            if (actual !== expected && writeFileIfDifferent) {
                const destPath = filePath.replace(/[\/\\]out[\/\\]vs[\/\\]workbench/, '/src/vs/workbench');
                pfs_1.Promises.writeFile(destPath, actual);
            }
            assert.deepStrictEqual(actual, expected);
        });
    }
    exports.assertMapping = assertMapping;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5Ym9hcmRNYXBwZXJUZXN0VXRpbHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9zZXJ2aWNlcy9rZXliaW5kaW5nL3Rlc3Qvbm9kZS9rZXlib2FyZE1hcHBlclRlc3RVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFxQmhHLFNBQVMscUJBQXFCLENBQUMsRUFBc0I7UUFDcEQsT0FBTztZQUNOLEtBQUssRUFBRSxFQUFFLENBQUMsUUFBUSxFQUFFO1lBQ3BCLFNBQVMsRUFBRSxFQUFFLENBQUMsWUFBWSxFQUFFO1lBQzVCLG1CQUFtQixFQUFFLEVBQUUsQ0FBQyxzQkFBc0IsRUFBRTtZQUNoRCxpQkFBaUIsRUFBRSxFQUFFLENBQUMsb0JBQW9CLEVBQUU7WUFDNUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxTQUFTLEVBQUU7WUFDekIsWUFBWSxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRTtZQUNwQyxhQUFhLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixFQUFFO1lBQ3JDLDJCQUEyQixFQUFFLEVBQUUsQ0FBQywrQkFBK0IsRUFBRTtTQUNqRSxDQUFDO0lBQ0gsQ0FBQztJQUVELFNBQWdCLDBCQUEwQixDQUFDLE1BQXVCLEVBQUUsYUFBNkIsRUFBRSxRQUE2QjtRQUMvSCxNQUFNLE1BQU0sR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUNqRixNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBSEQsZ0VBR0M7SUFFRCxTQUFnQix1QkFBdUIsQ0FBQyxNQUF1QixFQUFFLFVBQXNCLEVBQUUsUUFBK0I7UUFDdkgsTUFBTSxNQUFNLEdBQTBCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN0RyxNQUFNLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBSEQsMERBR0M7SUFFRCxTQUFnQixjQUFjLENBQUksSUFBWTtRQUM3QyxPQUFPLGNBQVEsQ0FBQyxRQUFRLENBQUMsb0JBQVUsQ0FBQyxTQUFTLENBQUMsOENBQThDLElBQUksS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDNUgsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2pDLE1BQU0sSUFBSSxHQUFHLElBQUksUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFBLDBHQUEwRztZQUN4SixJQUFJLFdBQVcsR0FBYSxJQUFJLENBQUM7WUFDakMsSUFBSSxDQUFDLFVBQVUsS0FBUTtnQkFDdEIsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUNyQixDQUFDLENBQUMsQ0FBQztZQUNILE9BQU8sV0FBWSxDQUFDO1FBQ3JCLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQVZELHdDQVVDO0lBRUQsU0FBZ0IsYUFBYSxDQUFDLG9CQUE2QixFQUFFLE1BQXVCLEVBQUUsSUFBWTtRQUNqRyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLG9CQUFVLENBQUMsU0FBUyxDQUFDLDhDQUE4QyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRW5ILE9BQU8sY0FBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNoRCxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4RCxNQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3RCxJQUFJLE1BQU0sS0FBSyxRQUFRLElBQUksb0JBQW9CLEVBQUUsQ0FBQztnQkFDakQsTUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxrQ0FBa0MsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO2dCQUMzRixjQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN0QyxDQUFDO1lBQ0QsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7SUFDSixDQUFDO0lBWkQsc0NBWUMifQ==