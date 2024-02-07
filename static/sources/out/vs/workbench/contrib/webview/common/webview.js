/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network", "vs/base/common/uri"], function (require, exports, network_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.decodeAuthority = exports.asWebviewUri = exports.webviewGenericCspSource = exports.webviewRootResourceAuthority = exports.webviewResourceBaseHost = void 0;
    /**
     * Root from which resources in webviews are loaded.
     *
     * This is hardcoded because we never expect to actually hit it. Instead these requests
     * should always go to a service worker.
     */
    exports.webviewResourceBaseHost = 'vscode-cdn.net';
    exports.webviewRootResourceAuthority = `vscode-resource.${exports.webviewResourceBaseHost}`;
    exports.webviewGenericCspSource = `'self' https://*.${exports.webviewResourceBaseHost}`;
    /**
     * Construct a uri that can load resources inside a webview
     *
     * We encode the resource component of the uri so that on the main thread
     * we know where to load the resource from (remote or truly local):
     *
     * ```txt
     * ${scheme}+${resource-authority}.vscode-resource.vscode-cdn.net/${path}
     * ```
     *
     * @param resource Uri of the resource to load.
     * @param remoteInfo Optional information about the remote that specifies where `resource` should be resolved from.
     */
    function asWebviewUri(resource, remoteInfo) {
        if (resource.scheme === network_1.Schemas.http || resource.scheme === network_1.Schemas.https) {
            return resource;
        }
        if (remoteInfo && remoteInfo.authority && remoteInfo.isRemote && resource.scheme === network_1.Schemas.file) {
            resource = uri_1.URI.from({
                scheme: network_1.Schemas.vscodeRemote,
                authority: remoteInfo.authority,
                path: resource.path,
            });
        }
        return uri_1.URI.from({
            scheme: network_1.Schemas.https,
            authority: `${resource.scheme}+${encodeAuthority(resource.authority)}.${exports.webviewRootResourceAuthority}`,
            path: resource.path,
            fragment: resource.fragment,
            query: resource.query,
        });
    }
    exports.asWebviewUri = asWebviewUri;
    function encodeAuthority(authority) {
        return authority.replace(/./g, char => {
            const code = char.charCodeAt(0);
            if ((code >= 97 /* CharCode.a */ && code <= 122 /* CharCode.z */)
                || (code >= 65 /* CharCode.A */ && code <= 90 /* CharCode.Z */)
                || (code >= 48 /* CharCode.Digit0 */ && code <= 57 /* CharCode.Digit9 */)) {
                return char;
            }
            return '-' + code.toString(16).padStart(4, '0');
        });
    }
    function decodeAuthority(authority) {
        return authority.replace(/-([0-9a-f]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
    }
    exports.decodeAuthority = decodeAuthority;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlldy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL2NvbnRyaWIvd2Vidmlldy9jb21tb24vd2Vidmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFXaEc7Ozs7O09BS0c7SUFDVSxRQUFBLHVCQUF1QixHQUFHLGdCQUFnQixDQUFDO0lBRTNDLFFBQUEsNEJBQTRCLEdBQUcsbUJBQW1CLCtCQUF1QixFQUFFLENBQUM7SUFFNUUsUUFBQSx1QkFBdUIsR0FBRyxvQkFBb0IsK0JBQXVCLEVBQUUsQ0FBQztJQUVyRjs7Ozs7Ozs7Ozs7O09BWUc7SUFDSCxTQUFnQixZQUFZLENBQUMsUUFBYSxFQUFFLFVBQThCO1FBQ3pFLElBQUksUUFBUSxDQUFDLE1BQU0sS0FBSyxpQkFBTyxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDM0UsT0FBTyxRQUFRLENBQUM7UUFDakIsQ0FBQztRQUVELElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxTQUFTLElBQUksVUFBVSxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbkcsUUFBUSxHQUFHLFNBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ25CLE1BQU0sRUFBRSxpQkFBTyxDQUFDLFlBQVk7Z0JBQzVCLFNBQVMsRUFBRSxVQUFVLENBQUMsU0FBUztnQkFDL0IsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO2FBQ25CLENBQUMsQ0FBQztRQUNKLENBQUM7UUFFRCxPQUFPLFNBQUcsQ0FBQyxJQUFJLENBQUM7WUFDZixNQUFNLEVBQUUsaUJBQU8sQ0FBQyxLQUFLO1lBQ3JCLFNBQVMsRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxvQ0FBNEIsRUFBRTtZQUN0RyxJQUFJLEVBQUUsUUFBUSxDQUFDLElBQUk7WUFDbkIsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRO1lBQzNCLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSztTQUNyQixDQUFDLENBQUM7SUFDSixDQUFDO0lBcEJELG9DQW9CQztJQUVELFNBQVMsZUFBZSxDQUFDLFNBQWlCO1FBQ3pDLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDckMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQyxJQUNDLENBQUMsSUFBSSx1QkFBYyxJQUFJLElBQUksd0JBQWMsQ0FBQzttQkFDdkMsQ0FBQyxJQUFJLHVCQUFjLElBQUksSUFBSSx1QkFBYyxDQUFDO21CQUMxQyxDQUFDLElBQUksNEJBQW1CLElBQUksSUFBSSw0QkFBbUIsQ0FBQyxFQUN0RCxDQUFDO2dCQUNGLE9BQU8sSUFBSSxDQUFDO1lBQ2IsQ0FBQztZQUNELE9BQU8sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqRCxDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFRCxTQUFnQixlQUFlLENBQUMsU0FBaUI7UUFDaEQsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuRyxDQUFDO0lBRkQsMENBRUMifQ==