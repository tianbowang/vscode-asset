/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/buffer", "vs/base/common/uri"], function (require, exports, buffer_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.transformAndReviveIncomingURIs = exports.transformIncomingURIs = exports.transformOutgoingURIs = exports.DefaultURITransformer = exports.URITransformer = void 0;
    function toJSON(uri) {
        return uri.toJSON();
    }
    class URITransformer {
        constructor(uriTransformer) {
            this._uriTransformer = uriTransformer;
        }
        transformIncoming(uri) {
            const result = this._uriTransformer.transformIncoming(uri);
            return (result === uri ? uri : toJSON(uri_1.URI.from(result)));
        }
        transformOutgoing(uri) {
            const result = this._uriTransformer.transformOutgoing(uri);
            return (result === uri ? uri : toJSON(uri_1.URI.from(result)));
        }
        transformOutgoingURI(uri) {
            const result = this._uriTransformer.transformOutgoing(uri);
            return (result === uri ? uri : uri_1.URI.from(result));
        }
        transformOutgoingScheme(scheme) {
            return this._uriTransformer.transformOutgoingScheme(scheme);
        }
    }
    exports.URITransformer = URITransformer;
    exports.DefaultURITransformer = new class {
        transformIncoming(uri) {
            return uri;
        }
        transformOutgoing(uri) {
            return uri;
        }
        transformOutgoingURI(uri) {
            return uri;
        }
        transformOutgoingScheme(scheme) {
            return scheme;
        }
    };
    function _transformOutgoingURIs(obj, transformer, depth) {
        if (!obj || depth > 200) {
            return null;
        }
        if (typeof obj === 'object') {
            if (obj instanceof uri_1.URI) {
                return transformer.transformOutgoing(obj);
            }
            // walk object (or array)
            for (const key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    const r = _transformOutgoingURIs(obj[key], transformer, depth + 1);
                    if (r !== null) {
                        obj[key] = r;
                    }
                }
            }
        }
        return null;
    }
    function transformOutgoingURIs(obj, transformer) {
        const result = _transformOutgoingURIs(obj, transformer, 0);
        if (result === null) {
            // no change
            return obj;
        }
        return result;
    }
    exports.transformOutgoingURIs = transformOutgoingURIs;
    function _transformIncomingURIs(obj, transformer, revive, depth) {
        if (!obj || depth > 200) {
            return null;
        }
        if (typeof obj === 'object') {
            if (obj.$mid === 1 /* MarshalledId.Uri */) {
                return revive ? uri_1.URI.revive(transformer.transformIncoming(obj)) : transformer.transformIncoming(obj);
            }
            if (obj instanceof buffer_1.VSBuffer) {
                return null;
            }
            // walk object (or array)
            for (const key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    const r = _transformIncomingURIs(obj[key], transformer, revive, depth + 1);
                    if (r !== null) {
                        obj[key] = r;
                    }
                }
            }
        }
        return null;
    }
    function transformIncomingURIs(obj, transformer) {
        const result = _transformIncomingURIs(obj, transformer, false, 0);
        if (result === null) {
            // no change
            return obj;
        }
        return result;
    }
    exports.transformIncomingURIs = transformIncomingURIs;
    function transformAndReviveIncomingURIs(obj, transformer) {
        const result = _transformIncomingURIs(obj, transformer, true, 0);
        if (result === null) {
            // no change
            return obj;
        }
        return result;
    }
    exports.transformAndReviveIncomingURIs = transformAndReviveIncomingURIs;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJpSXBjLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL2NvbW1vbi91cmlJcGMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBNEJoRyxTQUFTLE1BQU0sQ0FBQyxHQUFRO1FBQ3ZCLE9BQTJCLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBRUQsTUFBYSxjQUFjO1FBSTFCLFlBQVksY0FBa0M7WUFDN0MsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7UUFDdkMsQ0FBQztRQUVNLGlCQUFpQixDQUFDLEdBQWtCO1lBQzFDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0QsT0FBTyxDQUFDLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFNBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFELENBQUM7UUFFTSxpQkFBaUIsQ0FBQyxHQUFrQjtZQUMxQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNELE9BQU8sQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRCxDQUFDO1FBRU0sb0JBQW9CLENBQUMsR0FBUTtZQUNuQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzNELE9BQU8sQ0FBQyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMs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