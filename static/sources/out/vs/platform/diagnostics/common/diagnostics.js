/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NullDiagnosticsService = exports.isRemoteDiagnosticError = exports.IDiagnosticsService = exports.ID = void 0;
    exports.ID = 'diagnosticsService';
    exports.IDiagnosticsService = (0, instantiation_1.createDecorator)(exports.ID);
    function isRemoteDiagnosticError(x) {
        return !!x.hostName && !!x.errorMessage;
    }
    exports.isRemoteDiagnosticError = isRemoteDiagnosticError;
    class NullDiagnosticsService {
        async getPerformanceInfo(mainProcessInfo, remoteInfo) {
            return {};
        }
        async getSystemInfo(mainProcessInfo, remoteInfo) {
            return {
                processArgs: 'nullProcessArgs',
                gpuStatus: 'nullGpuStatus',
                screenReader: 'nullScreenReader',
                remoteData: [],
                os: 'nullOs',
                memory: 'nullMemory',
                vmHint: 'nullVmHint',
            };
        }
        async getDiagnostics(mainProcessInfo, remoteInfo) {
            return '';
        }
        async getWorkspaceFileExtensions(workspace) {
            return { extensions: [] };
        }
        async reportWorkspaceStats(workspace) { }
    }
    exports.NullDiagnosticsService = NullDiagnosticsService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhZ25vc3RpY3MuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2RpYWdub3N0aWNzL2NvbW1vbi9kaWFnbm9zdGljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFRbkYsUUFBQSxFQUFFLEdBQUcsb0JBQW9CLENBQUM7SUFDMUIsUUFBQSxtQkFBbUIsR0FBRyxJQUFBLCtCQUFlLEVBQXNCLFVBQUUsQ0FBQyxDQUFDO0lBa0Y1RSxTQUFnQix1QkFBdUIsQ0FBQyxDQUFNO1FBQzdDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUM7SUFDekMsQ0FBQztJQUZELDBEQUVDO0lBRUQsTUFBYSxzQkFBc0I7UUFHbEMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLGVBQXdDLEVBQUUsVUFBOEQ7WUFDaEksT0FBTyxFQUFFLENBQUM7UUFDWCxDQUFDO1FBRUQsS0FBSyxDQUFDLGFBQWEsQ0FBQyxlQUF3QyxFQUFFLFVBQThEO1lBQzNILE9BQU87Z0JBQ04sV0FBVyxFQUFFLGlCQUFpQjtnQkFDOUIsU0FBUyxFQUFFLGVBQWU7Z0JBQzFCLFlBQVksRUFBRSxrQkFBa0I7Z0JBQ2hDLFVBQVUsRUFBRSxFQUFFO2dCQUNkLEVBQUUsRUFBRSxRQUFRO2dCQUNaLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixNQUFNLEVBQUUsWUFBWTthQUNwQixDQUFDO1FBQ0gsQ0FBQztRQUVELEtBQUssQ0FBQyxjQUFjLENBQUMsZUFBd0MsRUFBRSxVQUE4RDtZQUM1SCxPQUFPLEVBQUUsQ0FBQztRQUNYLENBQUM7UUFFRCxLQUFLLENBQUMsMEJBQTBCLENBQUMsU0FBcUI7WUFDckQsT0FBTyxFQUFFLFVBQVUsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUMzQixDQUFDO1FBRUQsS0FBSyxDQUFDLG9CQUFvQixDQUFDLFNBQWdDLElBQW1CLENBQUM7S0FFL0U7SUE3QkQsd0RBNkJDIn0=