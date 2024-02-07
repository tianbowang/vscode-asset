/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "cookie", "fs", "vs/base/common/path", "vs/base/common/uuid", "vs/base/common/network", "vs/base/node/pfs"], function (require, exports, cookie, fs, path, uuid_1, network_1, pfs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.requestHasValidConnectionToken = exports.determineServerConnectionToken = exports.parseServerConnectionToken = exports.ServerConnectionTokenParseError = exports.MandatoryServerConnectionToken = exports.NoneServerConnectionToken = exports.ServerConnectionTokenType = void 0;
    const connectionTokenRegex = /^[0-9A-Za-z_-]+$/;
    var ServerConnectionTokenType;
    (function (ServerConnectionTokenType) {
        ServerConnectionTokenType[ServerConnectionTokenType["None"] = 0] = "None";
        ServerConnectionTokenType[ServerConnectionTokenType["Optional"] = 1] = "Optional";
        ServerConnectionTokenType[ServerConnectionTokenType["Mandatory"] = 2] = "Mandatory";
    })(ServerConnectionTokenType || (exports.ServerConnectionTokenType = ServerConnectionTokenType = {}));
    class NoneServerConnectionToken {
        constructor() {
            this.type = 0 /* ServerConnectionTokenType.None */;
        }
        validate(connectionToken) {
            return true;
        }
    }
    exports.NoneServerConnectionToken = NoneServerConnectionToken;
    class MandatoryServerConnectionToken {
        constructor(value) {
            this.value = value;
            this.type = 2 /* ServerConnectionTokenType.Mandatory */;
        }
        validate(connectionToken) {
            return (connectionToken === this.value);
        }
    }
    exports.MandatoryServerConnectionToken = MandatoryServerConnectionToken;
    class ServerConnectionTokenParseError {
        constructor(message) {
            this.message = message;
        }
    }
    exports.ServerConnectionTokenParseError = ServerConnectionTokenParseError;
    async function parseServerConnectionToken(args, defaultValue) {
        const withoutConnectionToken = args['without-connection-token'];
        const connectionToken = args['connection-token'];
        const connectionTokenFile = args['connection-token-file'];
        if (withoutConnectionToken) {
            if (typeof connectionToken !== 'undefined' || typeof connectionTokenFile !== 'undefined') {
                return new ServerConnectionTokenParseError(`Please do not use the argument '--connection-token' or '--connection-token-file' at the same time as '--without-connection-token'.`);
            }
            return new NoneServerConnectionToken();
        }
        if (typeof connectionTokenFile !== 'undefined') {
            if (typeof connectionToken !== 'undefined') {
                return new ServerConnectionTokenParseError(`Please do not use the argument '--connection-token' at the same time as '--connection-token-file'.`);
            }
            let rawConnectionToken;
            try {
                rawConnectionToken = fs.readFileSync(connectionTokenFile).toString().replace(/\r?\n$/, '');
            }
            catch (e) {
                return new ServerConnectionTokenParseError(`Unable to read the connection token file at '${connectionTokenFile}'.`);
            }
            if (!connectionTokenRegex.test(rawConnectionToken)) {
                return new ServerConnectionTokenParseError(`The connection token defined in '${connectionTokenFile} does not adhere to the characters 0-9, a-z, A-Z, _, or -.`);
            }
            return new MandatoryServerConnectionToken(rawConnectionToken);
        }
        if (typeof connectionToken !== 'undefined') {
            if (!connectionTokenRegex.test(connectionToken)) {
                return new ServerConnectionTokenParseError(`The connection token '${connectionToken} does not adhere to the characters 0-9, a-z, A-Z or -.`);
            }
            return new MandatoryServerConnectionToken(connectionToken);
        }
        return new MandatoryServerConnectionToken(await defaultValue());
    }
    exports.parseServerConnectionToken = parseServerConnectionToken;
    async function determineServerConnectionToken(args) {
        const readOrGenerateConnectionToken = async () => {
            if (!args['user-data-dir']) {
                // No place to store it!
                return (0, uuid_1.generateUuid)();
            }
            const storageLocation = path.join(args['user-data-dir'], 'token');
            // First try to find a connection token
            try {
                const fileContents = await pfs_1.Promises.readFile(storageLocation);
                const connectionToken = fileContents.toString().replace(/\r?\n$/, '');
                if (connectionTokenRegex.test(connectionToken)) {
                    return connectionToken;
                }
            }
            catch (err) { }
            // No connection token found, generate one
            const connectionToken = (0, uuid_1.generateUuid)();
            try {
                // Try to store it
                await pfs_1.Promises.writeFile(storageLocation, connectionToken, { mode: 0o600 });
            }
            catch (err) { }
            return connectionToken;
        };
        return parseServerConnectionToken(args, readOrGenerateConnectionToken);
    }
    exports.determineServerConnectionToken = determineServerConnectionToken;
    function requestHasValidConnectionToken(connectionToken, req, parsedUrl) {
        // First check if there is a valid query parameter
        if (connectionToken.validate(parsedUrl.query[network_1.connectionTokenQueryName])) {
            return true;
        }
        // Otherwise, check if there is a valid cookie
        const cookies = cookie.parse(req.headers.cookie || '');
        return connectionToken.validate(cookies[network_1.connectionTokenCookieName]);
    }
    exports.requestHasValidConnectionToken = requestHasValidConnectionToken;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyQ29ubmVjdGlvblRva2VuLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9zZXJ2ZXIvbm9kZS9zZXJ2ZXJDb25uZWN0aW9uVG9rZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBWWhHLE1BQU0sb0JBQW9CLEdBQUcsa0JBQWtCLENBQUM7SUFFaEQsSUFBa0IseUJBSWpCO0lBSkQsV0FBa0IseUJBQXlCO1FBQzFDLHlFQUFJLENBQUE7UUFDSixpRkFBUSxDQUFBO1FBQ1IsbUZBQVMsQ0FBQTtJQUNWLENBQUMsRUFKaUIseUJBQXlCLHlDQUF6Qix5QkFBeUIsUUFJMUM7SUFFRCxNQUFhLHlCQUF5QjtRQUF0QztZQUNpQixTQUFJLDBDQUFrQztRQUt2RCxDQUFDO1FBSE8sUUFBUSxDQUFDLGVBQW9CO1lBQ25DLE9BQU8sSUFBSSxDQUFDO1FBQ2IsQ0FBQztLQUNEO0lBTkQsOERBTUM7SUFFRCxNQUFhLDhCQUE4QjtRQUcxQyxZQUE0QixLQUFhO1lBQWIsVUFBSyxHQUFMLEtBQUssQ0FBUTtZQUZ6QixTQUFJLCtDQUF1QztRQUczRCxDQUFDO1FBRU0sUUFBUSxDQUFDLGVBQW9CO1lBQ25DLE9BQU8sQ0FBQyxlQUFlLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLENBQUM7S0FDRDtJQVRELHdFQVNDO0lBSUQsTUFBYSwrQkFBK0I7UUFDM0MsWUFDaUIsT0FBZTtZQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDNUIsQ0FBQztLQUNMO0lBSkQsMEVBSUM7SUFFTSxLQUFLLFVBQVUsMEJBQTBCLENBQUMsSUFBc0IsRUFBRSxZQUFtQztRQUMzRyxNQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ2hFLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FB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