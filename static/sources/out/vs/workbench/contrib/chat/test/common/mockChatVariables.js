/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MockChatVariablesService = void 0;
    class MockChatVariablesService {
        registerVariable(data, resolver) {
            throw new Error('Method not implemented.');
        }
        hasVariable(name) {
            throw new Error('Method not implemented.');
        }
        getVariables() {
            throw new Error('Method not implemented.');
        }
        getDynamicVariables(sessionId) {
            return [];
        }
        async resolveVariables(prompt, model, token) {
            return {
                message: prompt.text,
                variables: {}
            };
        }
    }
    exports.MockChatVariablesService = MockChatVariablesService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja0NoYXRWYXJpYWJsZXMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvdGVzdC9jb21tb24vbW9ja0NoYXRWYXJpYWJsZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBUWhHLE1BQWEsd0JBQXdCO1FBRXBDLGdCQUFnQixDQUFDLElBQXVCLEVBQUUsUUFBK0I7WUFDeEUsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQzVDLENBQUM7UUFFRCxXQUFXLENBQUMsSUFBWTtZQUN2QixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELFlBQVk7WUFDWCxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDNUMsQ0FBQztRQUVELG1CQUFtQixDQUFDLFNBQWlCO1lBQ3BDLE9BQU8sRUFBRSxDQUFDO1FBQ1gsQ0FBQztRQUVELEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxNQUEwQixFQUFFLEtBQWlCLEVBQUUsS0FBd0I7WUFDN0YsT0FBTztnQkFDTixPQUFPLEVBQUUsTUFBTSxDQUFDLElBQUk7Z0JBQ3BCLFNBQVMsRUFBRSxFQUFFO2FBQ2IsQ0FBQztRQUNILENBQUM7S0FDRDtJQXhCRCw0REF3QkMifQ==