/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/lifecycle"], function (require, exports, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExtensionRecommendations = void 0;
    class ExtensionRecommendations extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._activationPromise = null;
        }
        get activated() { return this._activationPromise !== null; }
        activate() {
            if (!this._activationPromise) {
                this._activationPromise = this.doActivate();
            }
            return this._activationPromise;
        }
    }
    exports.ExtensionRecommendations = ExtensionRecommendations;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25zLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi9leHRlbnNpb25zL2Jyb3dzZXIvZXh0ZW5zaW9uUmVjb21tZW5kYXRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVVoRyxNQUFzQix3QkFBeUIsU0FBUSxzQkFBVTtRQUFqRTs7WUFLUyx1QkFBa0IsR0FBeUIsSUFBSSxDQUFDO1FBU3pELENBQUM7UUFSQSxJQUFJLFNBQVMsS0FBYyxPQUFPLElBQUksQ0FBQyxrQkFBa0IsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLFFBQVE7WUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDN0MsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDO1FBQ2hDLENBQUM7S0FFRDtJQWRELDREQWNDIn0=