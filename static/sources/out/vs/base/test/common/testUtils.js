/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.flakySuite = void 0;
    function flakySuite(title, fn) {
        return suite(title, function () {
            // Flaky suites need retries and timeout to complete
            // e.g. because they access browser features which can
            // be unreliable depending on the environment.
            this.retries(3);
            this.timeout(1000 * 20);
            // Invoke suite ensuring that `this` is
            // properly wired in.
            fn.call(this);
        });
    }
    exports.flakySuite = flakySuite;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdFV0aWxzLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL3Rlc3QvY29tbW9uL3Rlc3RVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFFaEcsU0FBZ0IsVUFBVSxDQUFDLEtBQWEsRUFBRSxFQUFjO1FBQ3ZELE9BQU8sS0FBSyxDQUFDLEtBQUssRUFBRTtZQUVuQixvREFBb0Q7WUFDcEQsc0RBQXNEO1lBQ3RELDhDQUE4QztZQUM5QyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDO1lBRXhCLHVDQUF1QztZQUN2QyxxQkFBcUI7WUFDckIsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNmLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQWJELGdDQWFDIn0=