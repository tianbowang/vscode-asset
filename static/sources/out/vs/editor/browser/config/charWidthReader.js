/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/window", "vs/editor/browser/config/domFontInfo"], function (require, exports, window_1, domFontInfo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.readCharWidths = exports.CharWidthRequest = exports.CharWidthRequestType = void 0;
    var CharWidthRequestType;
    (function (CharWidthRequestType) {
        CharWidthRequestType[CharWidthRequestType["Regular"] = 0] = "Regular";
        CharWidthRequestType[CharWidthRequestType["Italic"] = 1] = "Italic";
        CharWidthRequestType[CharWidthRequestType["Bold"] = 2] = "Bold";
    })(CharWidthRequestType || (exports.CharWidthRequestType = CharWidthRequestType = {}));
    class CharWidthRequest {
        constructor(chr, type) {
            this.chr = chr;
            this.type = type;
            this.width = 0;
        }
        fulfill(width) {
            this.width = width;
        }
    }
    exports.CharWidthRequest = CharWidthRequest;
    class DomCharWidthReader {
        constructor(bareFontInfo, requests) {
            this._bareFontInfo = bareFontInfo;
            this._requests = requests;
            this._container = null;
            this._testElements = null;
        }
        read() {
            // Create a test container with all these test elements
            this._createDomElements();
            // Add the container to the DOM
            window_1.$window.document.body.appendChild(this._container);
            // Read character widths
            this._readFromDomElements();
            // Remove the container from the DOM
            window_1.$window.document.body.removeChild(this._container);
            this._container = null;
            this._testElements = null;
        }
        _createDomElements() {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '-50000px';
            container.style.width = '50000px';
            const regularDomNode = document.createElement('div');
            (0, domFontInfo_1.applyFontInfo)(regularDomNode, this._bareFontInfo);
            container.appendChild(regularDomNode);
            const boldDomNode = document.createElement('div');
            (0, domFontInfo_1.applyFontInfo)(boldDomNode, this._bareFontInfo);
            boldDomNode.style.fontWeight = 'bold';
            container.appendChild(boldDomNode);
            const italicDomNode = document.createElement('div');
            (0, domFontInfo_1.applyFontInfo)(italicDomNode, this._bareFontInfo);
            italicDomNode.style.fontStyle = 'italic';
            container.appendChild(italicDomNode);
            const testElements = [];
            for (const request of this._requests) {
                let parent;
                if (request.type === 0 /* CharWidthRequestType.Regular */) {
                    parent = regularDomNode;
                }
                if (request.type === 2 /* CharWidthRequestType.Bold */) {
                    parent = boldDomNode;
                }
                if (request.type === 1 /* CharWidthRequestType.Italic */) {
                    parent = italicDomNode;
                }
                parent.appendChild(document.createElement('br'));
                const testElement = document.createElement('span');
                DomCharWidthReader._render(testElement, request);
                parent.appendChild(testElement);
                testElements.push(testElement);
            }
            this._container = container;
            this._testElements = testElements;
        }
        static _render(testElement, request) {
            if (request.chr === ' ') {
                let htmlString = '\u00a0';
                // Repeat character 256 (2^8) times
                for (let i = 0; i < 8; i++) {
                    htmlString += htmlString;
                }
                testElement.innerText = htmlString;
            }
            else {
                let testString = request.chr;
                // Repeat character 256 (2^8) times
                for (let i = 0; i < 8; i++) {
                    testString += testString;
                }
                testElement.textContent = testString;
            }
        }
        _readFromDomElements() {
            for (let i = 0, len = this._requests.length; i < len; i++) {
                const request = this._requests[i];
                const testElement = this._testElements[i];
                request.fulfill(testElement.offsetWidth / 256);
            }
        }
    }
    function readCharWidths(bareFontInfo, requests) {
        const reader = new DomCharWidthReader(bareFontInfo, requests);
        reader.read();
    }
    exports.readCharWidths = readCharWidths;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hhcldpZHRoUmVhZGVyLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9lZGl0b3IvYnJvd3Nlci9jb25maWcvY2hhcldpZHRoUmVhZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQU1oRyxJQUFrQixvQkFJakI7SUFKRCxXQUFrQixvQkFBb0I7UUFDckMscUVBQVcsQ0FBQTtRQUNYLG1FQUFVLENBQUE7UUFDViwrREFBUSxDQUFBO0lBQ1QsQ0FBQyxFQUppQixvQkFBb0Isb0NBQXBCLG9CQUFvQixRQUlyQztJQUVELE1BQWEsZ0JBQWdCO1FBTTVCLFlBQVksR0FBVyxFQUFFLElBQTBCO1lBQ2xELElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDaEIsQ0FBQztRQUVNLE9BQU8sQ0FBQyxLQUFhO1lBQzNCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLENBQUM7S0FDRDtJQWZELDRDQWVDO0lBRUQsTUFBTSxrQkFBa0I7UUFRdkIsWUFBWSxZQUEwQixFQUFFLFFBQTRCO1lBQ25FLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1lBQ2xDLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1lBRTFCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQzNCLENBQUM7UUFFTSxJQUFJO1lBQ1YsdURBQXVEO1lBQ3ZELElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBRTFCLCtCQUErQjtZQUMvQixnQkFBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFX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