(function anonymous() { /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/uri", "vs/editor/common/core/range", "vs/platform/instantiation/common/instantiation"], function (require, exports, uri_1, range_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.KEYWORD_ACTIVIATION_SETTING_ID = exports.IChatService = exports.ChatAgentCopyKind = exports.InteractiveSessionVoteDirection = exports.isIUsedContext = exports.isIDocumentContext = void 0;
    function isIDocumentContext(obj) {
        return (!!obj &&
            typeof obj === 'object' &&
            'uri' in obj && obj.uri instanceof uri_1.URI &&
            'version' in obj && typeof obj.version === 'number' &&
            'ranges' in obj && Array.isArray(obj.ranges) && obj.ranges.every(range_1.Range.isIRange));
    }
    exports.isIDocumentContext = isIDocumentContext;
    function isIUsedContext(obj) {
        return (!!obj &&
            typeof obj === 'object' &&
            'documents' in obj &&
            Array.isArray(obj.documents) &&
            obj.documents.every(isIDocumentContext));
    }
    exports.isIUsedContext = isIUsedContext;
    // Name has to match the one in vscode.d.ts for some reason
    var InteractiveSessionVoteDirection;
    (function (InteractiveSessionVoteDirection) {
        InteractiveSessionVoteDirection[InteractiveSessionVoteDirection["Down"] = 0] = "Down";
        InteractiveSessionVoteDirection[InteractiveSessionVoteDirection["Up"] = 1] = "Up";
    })(InteractiveSessionVoteDirection || (exports.InteractiveSessionVoteDirection = InteractiveSessionVoteDirection = {}));
    var ChatAgentCopyKind;
    (function (ChatAgentCopyKind) {
        // Keyboard shortcut or context menu
        ChatAgentCopyKind[ChatAgentCopyKind["Action"] = 1] = "Action";
        ChatAgentCopyKind[ChatAgentCopyKind["Toolbar"] = 2] = "Toolbar";
    })(ChatAgentCopyKind || (exports.ChatAgentCopyKind = ChatAgentCopyKind = {}));
    exports.IChatService = (0, instantiation_1.createDecorator)('IChatService');
    exports.KEYWORD_ACTIVIATION_SETTING_ID = 'accessibility.voice.keywordActivation';
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhdFNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3dvcmtiZW5jaC9jb250cmliL2NoYXQvY29tbW9uL2NoYXRTZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQTZEaEcsU0FBZ0Isa0JBQWtCLENBQUMsR0FBWTtRQUM5QyxPQUFPLENBQ04sQ0FBQyxDQUFDLEdBQUc7WUFDTCxPQUFPLEdBQUcsS0FBSyxRQUFRO1lBQ3ZCLEtBQUssSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsWUFBWSxTQUFHO1lBQ3RDLFNBQVMsSUFBSSxHQUFHLElBQUksT0FBTyxHQUFHLENBQUMsT0FBTyxLQUFLLFFBQVE7WUFDbkQsUUFBUSxJQUFJLEdBQUcsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxhQUFLLENBQUMsUUFBUSxDQUFDLENBQ2hGLENBQUM7SUFDSCxDQUFDO0lBUkQsZ0RBUUM7SUFPRCxTQUFnQixjQUFjLENBQUMsR0FBWTtRQUMxQyxPQUFPLENBQ04sQ0FBQyxDQUFDLEdBQUc7WUFDTCxPQUFPLEdBQUcsS0FBSyxRQUFRO1lBQ3ZCLFdBQVcsSUFBSSxHQUFHO1lBQ2xCLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQztZQUM1QixHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUN2QyxDQUFDO0lBQ0gsQ0FBQztJQVJELHdDQVFDO0lBK0ZELDJEQUEyRDtJQUMzRCxJQUFZLCtCQUdYO0lBSEQsV0FBWSwrQkFBK0I7UUFDMUMscUZBQVEsQ0FBQTtRQUNSLGlGQUFNLENBQUE7SUFDUCxDQUFDLEVBSFcsK0JBQStCLCtDQUEvQiwrQkFBK0IsUUFHMUM7SUFRRCxJQUFZLGlCQUlYO0lBSkQsV0FBWSxpQkFBaUI7UUFDNUIsb0NBQW9DO1FBQ3BDLDZEQUFVLENBQUE7UUFDViwrREFBVyxDQUFBO0lBQ1osQ0FBQyxFQUpXLGlCQUFpQixpQ0FBakIsaUJBQWlCLFFBSTVCO0lBaUZZLFFBQUEsWUFBWSxHQUFHLElBQUEsK0JBQWUsRUFBZSxjQUFjLENBQUMsQ0FBQztJQXFDN0QsUUFBQSw4QkFBOEIsR0FBRyx1Q0FBdUMsQ0FBQyJ9
//# sourceURL=../../../vs/workbench/contrib/chat/common/chatService.js
})