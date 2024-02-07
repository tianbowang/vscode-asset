/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LifecyclePhaseToString = exports.LifecyclePhase = exports.StartupKindToString = exports.StartupKind = exports.ShutdownReason = exports.ILifecycleService = void 0;
    exports.ILifecycleService = (0, instantiation_1.createDecorator)('lifecycleService');
    var ShutdownReason;
    (function (ShutdownReason) {
        /**
         * The window is closed.
         */
        ShutdownReason[ShutdownReason["CLOSE"] = 1] = "CLOSE";
        /**
         * The window closes because the application quits.
         */
        ShutdownReason[ShutdownReason["QUIT"] = 2] = "QUIT";
        /**
         * The window is reloaded.
         */
        ShutdownReason[ShutdownReason["RELOAD"] = 3] = "RELOAD";
        /**
         * The window is loaded into a different workspace context.
         */
        ShutdownReason[ShutdownReason["LOAD"] = 4] = "LOAD";
    })(ShutdownReason || (exports.ShutdownReason = ShutdownReason = {}));
    var StartupKind;
    (function (StartupKind) {
        StartupKind[StartupKind["NewWindow"] = 1] = "NewWindow";
        StartupKind[StartupKind["ReloadedWindow"] = 3] = "ReloadedWindow";
        StartupKind[StartupKind["ReopenedWindow"] = 4] = "ReopenedWindow";
    })(StartupKind || (exports.StartupKind = StartupKind = {}));
    function StartupKindToString(startupKind) {
        switch (startupKind) {
            case 1 /* StartupKind.NewWindow */: return 'NewWindow';
            case 3 /* StartupKind.ReloadedWindow */: return 'ReloadedWindow';
            case 4 /* StartupKind.ReopenedWindow */: return 'ReopenedWindow';
        }
    }
    exports.StartupKindToString = StartupKindToString;
    var LifecyclePhase;
    (function (LifecyclePhase) {
        /**
         * The first phase signals that we are about to startup getting ready.
         *
         * Note: doing work in this phase blocks an editor from showing to
         * the user, so please rather consider to use `Restored` phase.
         */
        LifecyclePhase[LifecyclePhase["Starting"] = 1] = "Starting";
        /**
         * Services are ready and the window is about to restore its UI state.
         *
         * Note: doing work in this phase blocks an editor from showing to
         * the user, so please rather consider to use `Restored` phase.
         */
        LifecyclePhase[LifecyclePhase["Ready"] = 2] = "Ready";
        /**
         * Views, panels and editors have restored. Editors are given a bit of
         * time to restore their contents.
         */
        LifecyclePhase[LifecyclePhase["Restored"] = 3] = "Restored";
        /**
         * The last phase after views, panels and editors have restored and
         * some time has passed (2-5 seconds).
         */
        LifecyclePhase[LifecyclePhase["Eventually"] = 4] = "Eventually";
    })(LifecyclePhase || (exports.LifecyclePhase = LifecyclePhase = {}));
    function LifecyclePhaseToString(phase) {
        switch (phase) {
            case 1 /* LifecyclePhase.Starting */: return 'Starting';
            case 2 /* LifecyclePhase.Ready */: return 'Ready';
            case 3 /* LifecyclePhase.Restored */: return 'Restored';
            case 4 /* LifecyclePhase.Eventually */: return 'Eventually';
        }
    }
    exports.LifecyclePhaseToString = LifecyclePhaseToString;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlmZWN5Y2xlLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvc2VydmljZXMvbGlmZWN5Y2xlL2NvbW1vbi9saWZlY3ljbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBTW5GLFFBQUEsaUJBQWlCLEdBQUcsSUFBQSwrQkFBZSxFQUFvQixrQkFBa0IsQ0FBQyxDQUFDO0lBeUd4RixJQUFrQixjQXFCakI7SUFyQkQsV0FBa0IsY0FBYztRQUUvQjs7V0FFRztRQUNILHFEQUFTLENBQUE7UUFFVDs7V0FFRztRQUNILG1EQUFJLENBQUE7UUFFSjs7V0FFRztRQUNILHVEQUFNLENBQUE7UUFFTjs7V0FFRztRQUNILG1EQUFJLENBQUE7SUFDTCxDQUFDLEVBckJpQixjQUFjLDhCQUFkLGNBQWMsUUFxQi9CO0lBRUQsSUFBa0IsV0FJakI7SUFKRCxXQUFrQixXQUFXO1FBQzVCLHVEQUFhLENBQUE7UUFDYixpRUFBa0IsQ0FBQTtRQUNsQixpRUFBa0IsQ0FBQTtJQUNuQixDQUFDLEVBSmlCLFdBQVcsMkJBQVgsV0FBVyxRQUk1QjtJQUVELFNBQWdCLG1CQUFtQixDQUFDLFdBQXdCO1FBQzNELFFBQVEsV0FBVyxFQUFFLENBQUM7WUFDckIsa0NBQTBCLENBQUMsQ0FBQyxPQUFPLFdBQVcsQ0FBQztZQUMvQyx1Q0FBK0IsQ0FBQyxDQUFDLE9BQU8sZ0JBQWdCLENBQUM7WUFDekQsdUNBQStCLENBQUMsQ0FBQyxPQUFPLGdCQUFnQixDQUFDO1FBQzFELENBQUM7SUFDRixDQUFDO0lBTkQsa0RBTUM7SUFFRCxJQUFrQixjQTZCakI7SUE3QkQsV0FBa0IsY0FBYztRQUUvQjs7Ozs7V0FLRztRQUNILDJEQUFZLENBQUE7UUFFWjs7Ozs7V0FLRztRQUNILHFEQUFTLENBQUE7UUFFVDs7O1dBR0c7UUFDSCwyREFBWSxDQUFBO1FBRVo7OztXQUdHO1FBQ0gsK0RBQWMsQ0FBQTtJQUNmLENBQUMsRUE3QmlCLGNBQWMsOEJBQWQsY0FBYyxRQTZCL0I7SUFFRCxTQUFnQixzQkFBc0IsQ0FBQyxLQUFxQjtRQUMzRCxRQUFRLEtBQUssRUFBRSxDQUFDO1lBQ2Ysb0NBQTRCLENBQUMsQ0FBQyxPQUFPLFVBQVUsQ0FBQztZQUNoRCxpQ0FBeUIsQ0FBQyxDQUFDLE9BQU8sT0FBTyxDQUFDO1lBQzFDLG9DQUE0QixDQUFDLENBQUMsT0FBTyxVQUFVLENBQUM7WUFDaEQsc0NBQThCLENBQUMsQ0FBQyxPQUFPLFlBQVksQ0FBQztRQUNyRCxDQUFDO0lBQ0YsQ0FBQztJQVBELHdEQU9DIn0=