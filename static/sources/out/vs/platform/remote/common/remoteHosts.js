/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/network"], function (require, exports, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseAuthorityWithOptionalPort = exports.parseAuthorityWithPort = exports.getRemoteServerRootPath = exports.getRemoteName = exports.getRemoteAuthority = void 0;
    function getRemoteAuthority(uri) {
        return uri.scheme === network_1.Schemas.vscodeRemote ? uri.authority : undefined;
    }
    exports.getRemoteAuthority = getRemoteAuthority;
    function getRemoteName(authority) {
        if (!authority) {
            return undefined;
        }
        const pos = authority.indexOf('+');
        if (pos < 0) {
            // e.g. localhost:8000
            return authority;
        }
        return authority.substr(0, pos);
    }
    exports.getRemoteName = getRemoteName;
    /**
     * The root path to use when accessing the remote server. The path contains the quality and commit of the current build.
     * @param product
     * @returns
     */
    function getRemoteServerRootPath(product) {
        return `/${product.quality ?? 'oss'}-${product.commit ?? 'dev'}`;
    }
    exports.getRemoteServerRootPath = getRemoteServerRootPath;
    function parseAuthorityWithPort(authority) {
        const { host, port } = parseAuthority(authority);
        if (typeof port === 'undefined') {
            throw new Error(`Invalid remote authority: ${authority}. It must either be a remote of form <remoteName>+<arg> or a remote host of form <host>:<port>.`);
        }
        return { host, port };
    }
    exports.parseAuthorityWithPort = parseAuthorityWithPort;
    function parseAuthorityWithOptionalPort(authority, defaultPort) {
        let { host, port } = parseAuthority(authority);
        if (typeof port === 'undefined') {
            port = defaultPort;
        }
        return { host, port };
    }
    exports.parseAuthorityWithOptionalPort = parseAuthorityWithOptionalPort;
    function parseAuthority(authority) {
        // check for ipv6 with port
        const m1 = authority.match(/^(\[[0-9a-z:]+\]):(\d+)$/);
        if (m1) {
            return { host: m1[1], port: parseInt(m1[2], 10) };
        }
        // check for ipv6 without port
        const m2 = authority.match(/^(\[[0-9a-z:]+\])$/);
        if (m2) {
            return { host: m2[1], port: undefined };
        }
        // anything with a trailing port
        const m3 = authority.match(/(.*):(\d+)$/);
        if (m3) {
            return { host: m3[1], port: parseInt(m3[2], 10) };
        }
        // doesn't contain a port
        return { host: authority, port: undefined };
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlSG9zdHMuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3JlbW90ZS9jb21tb24vcmVtb3RlSG9zdHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBS2hHLFNBQWdCLGtCQUFrQixDQUFDLEdBQVE7UUFDMUMsT0FBTyxHQUFHLENBQUMsTUFBTSxLQUFLLGlCQUFPLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDeEUsQ0FBQztJQUZELGdEQUVDO0lBS0QsU0FBZ0IsYUFBYSxDQUFDLFNBQTZCO1FBQzFELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNoQixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBQ0QsTUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUNiLHNCQUFzQjtZQUN0QixPQUFPLFNBQVMsQ0FBQztRQUNsQixDQUFDO1FBQ0QsT0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBVkQsc0NBVUM7SUFFRDs7OztPQUlHO0lBQ0gsU0FBZ0IsdUJBQXVCLENBQUMsT0FBOEM7UUFDckYsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLElBQUksS0FBSyxJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUM7SUFDbEUsQ0FBQztJQUZELDBEQUVDO0lBRUQsU0FBZ0Isc0JBQXNCLENBQUMsU0FBaUI7UUFDdkQsTUFBTSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDakQsSUFBSSxPQUFPLElBQUksS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUNqQyxNQUFNLElBQUksS0FBSyxDQUFDLDZCQUE2QixTQUFTLGlHQUFpRyxDQUFDLENBQUM7UUFDMUosQ0FBQztRQUNELE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQU5ELHdEQU1DO0lBRUQsU0FBZ0IsOEJBQThCLENBQUMsU0FBaUIsRUFBRSxXQUFtQjtRQUNwRixJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMvQyxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ2pDLElBQUksR0FBRyxXQUFXLENBQUM7UUFDcEIsQ0FBQztRQUNELE9BQU8sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQU5ELHdFQU1DO0lBRUQsU0FBUyxjQUFjLENBQUMsU0FBaUI7UUFDeEMsMkJBQTJCO1FBQzNCLE1BQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUN2RCxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQ1IsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNuRCxDQUFDO1FBRUQsOEJBQThCO1FBQzlCLE1BQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUNqRCxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQ1IsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDO1FBQ3pDLENBQUM7UUFFRCxnQ0FBZ0M7UUFDaEMsTUFBTSxFQUFFLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMxQyxJQUFJLEVBQUUsRUFBRSxDQUFDO1lBQ1IsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNuRCxDQUFDO1FBRUQseUJBQXlCO1FBQ3pCLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsQ0FBQztJQUM3QyxDQUFDIn0=