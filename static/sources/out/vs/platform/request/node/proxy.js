/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "url", "vs/base/common/types"], function (require, exports, url_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getProxyAgent = void 0;
    function getSystemProxyURI(requestURL, env) {
        if (requestURL.protocol === 'http:') {
            return env.HTTP_PROXY || env.http_proxy || null;
        }
        else if (requestURL.protocol === 'https:') {
            return env.HTTPS_PROXY || env.https_proxy || env.HTTP_PROXY || env.http_proxy || null;
        }
        return null;
    }
    async function getProxyAgent(rawRequestURL, env, options = {}) {
        const requestURL = (0, url_1.parse)(rawRequestURL);
        const proxyURL = options.proxyUrl || getSystemProxyURI(requestURL, env);
        if (!proxyURL) {
            return null;
        }
        const proxyEndpoint = (0, url_1.parse)(proxyURL);
        if (!/^https?:$/.test(proxyEndpoint.protocol || '')) {
            return null;
        }
        const opts = {
            host: proxyEndpoint.hostname || '',
            port: (proxyEndpoint.port ? +proxyEndpoint.port : 0) || (proxyEndpoint.protocol === 'https' ? 443 : 80),
            auth: proxyEndpoint.auth,
            rejectUnauthorized: (0, types_1.isBoolean)(options.strictSSL) ? options.strictSSL : true,
        };
        return requestURL.protocol === 'http:'
            ? new (await new Promise((resolve_1, reject_1) => { require(['http-proxy-agent'], resolve_1, reject_1); })).HttpProxyAgent(proxyURL, opts)
            : new (await new Promise((resolve_2, reject_2) => { require(['https-proxy-agent'], resolve_2, reject_2); })).HttpsProxyAgent(proxyURL, opts);
    }
    exports.getProxyAgent = getProxyAgent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJveHkuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL3JlcXVlc3Qvbm9kZS9wcm94eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7Ozs7SUFPaEcsU0FBUyxpQkFBaUIsQ0FBQyxVQUFlLEVBQUUsR0FBdUI7UUFDbEUsSUFBSSxVQUFVLENBQUMsUUFBUSxLQUFLLE9BQU8sRUFBRSxDQUFDO1lBQ3JDLE9BQU8sR0FBRyxDQUFDLFVBQVUsSUFBSSxHQUFHLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQztRQUNqRCxDQUFDO2FBQU0sSUFBSSxVQUFVLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQzdDLE9BQU8sR0FBRyxDQUFDLFdBQVcsSUFBSSxHQUFHLENBQUMsV0FBVyxJQUFJLEdBQUcsQ0FBQyxVQUFVLElBQUksR0FBRyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUM7UUFDdkYsQ0FBQztRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQU9NLEtBQUssVUFBVSxhQUFhLENBQUMsYUFBcUIsRUFBRSxHQUF1QixFQUFFLFVBQW9CLEVBQUU7UUFDekcsTUFBTSxVQUFVLEdBQUcsSUFBQSxXQUFRLEVBQUMsYUFBYSxDQUFDLENBQUM7UUFDM0MsTUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSSxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFeEUsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2YsT0FBTyxJQUFJLENBQUM7UUFDYixDQUFDO1FBRUQsTUFBTSxhQUFhLEdBQUcsSUFBQSxXQUFRLEVBQUMsUUFBUSxDQUFDLENBQUM7UUFFekMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ3JELE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztRQUVELE1BQU0sSUFBSSxHQUFHO1lBQ1osSUFBSSxFQUFFLGFBQWEsQ0FBQyxRQUFRLElBQUksRUFBRTtZQUNsQyxJQUFJLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3ZHLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSTtZQUN4QixrQkFBa0IsRUFBRSxJQUFBLGlCQUFTLEVBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJO1NBQzNFLENBQUM7UUFFRixPQUFPLFVBQVUsQ0FBQyxRQUFRLEtBQUssT0FBTztZQUNyQyxDQUFDLENBQUMsSUFBSSxDQUFDLHNEQUFhLGtCQUFrQiwyQkFBQyxDQUFDLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUM7WUFDdkUsQ0FBQyxDQUFDLElBQUksQ0FBQyxzREFBYSxtQkFBbUIsMkJBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUUsQ0FBQztJQXhCRCxzQ0F3QkMifQ==