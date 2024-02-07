/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/browser/browser", "vs/base/browser/window", "vs/base/common/event", "vs/base/common/lifecycle", "vs/editor/browser/config/charWidthReader", "vs/editor/common/config/editorOptions", "vs/editor/common/config/fontInfo"], function (require, exports, browser, window_1, event_1, lifecycle_1, charWidthReader_1, editorOptions_1, fontInfo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FontMeasurements = exports.FontMeasurementsImpl = void 0;
    class FontMeasurementsImpl extends lifecycle_1.Disposable {
        constructor() {
            super();
            this._onDidChange = this._register(new event_1.Emitter());
            this.onDidChange = this._onDidChange.event;
            this._cache = new FontMeasurementsCache();
            this._evictUntrustedReadingsTimeout = -1;
        }
        dispose() {
            if (this._evictUntrustedReadingsTimeout !== -1) {
                clearTimeout(this._evictUntrustedReadingsTimeout);
                this._evictUntrustedReadingsTimeout = -1;
            }
            super.dispose();
        }
        /**
         * Clear all cached font information and trigger a change event.
         */
        clearAllFontInfos() {
            this._cache = new FontMeasurementsCache();
            this._onDidChange.fire();
        }
        _writeToCache(item, value) {
            this._cache.put(item, value);
            if (!value.isTrusted && this._evictUntrustedReadingsTimeout === -1) {
                // Try reading again after some time
                this._evictUntrustedReadingsTimeout = window_1.mainWindow.setTimeout(() => {
                    this._evictUntrustedReadingsTimeout = -1;
                    this._evictUntrustedReadings();
                }, 5000);
            }
        }
        _evictUntrustedReadings() {
            const values = this._cache.getValues();
            let somethingRemoved = false;
            for (const item of values) {
                if (!item.isTrusted) {
                    somethingRemoved = true;
                    this._cache.remove(item);
                }
            }
            if (somethingRemoved) {
                this._onDidChange.fire();
            }
        }
        /**
         * Serialized currently cached font information.
         */
        serializeFontInfo() {
            // Only save trusted font info (that has been measured in this running instance)
            return this._cache.getValues().filter(item => item.isTrusted);
        }
        /**
         * Restore previously serialized font informations.
         */
        restoreFontInfo(savedFontInfos) {
            // Take all the saved font info and insert them in the cache without the trusted flag.
            // The reason for this is that a font might have been installed on the OS in the meantime.
            for (const savedFontInfo of savedFontInfos) {
                if (savedFontInfo.version !== fontInfo_1.SERIALIZED_FONT_INFO_VERSION) {
                    // cannot use older version
                    continue;
                }
                const fontInfo = new fontInfo_1.FontInfo(savedFontInfo, false);
                this._writeToCache(fontInfo, fontInfo);
            }
        }
        /**
         * Read font information.
         */
        readFontInfo(bareFontInfo) {
            if (!this._cache.has(bareFontInfo)) {
                let readConfig = this._actualReadFontInfo(bareFontInfo);
                if (readConfig.typicalHalfwidthCharacterWidth <= 2 || readConfig.typicalFullwidthCharacterWidth <= 2 || readConfig.spaceWidth <= 2 || readConfig.maxDigitWidth <= 2) {
                    // Hey, it's Bug 14341 ... we couldn't read
                    readConfig = new fontInfo_1.FontInfo({
                        pixelRatio: browser.PixelRatio.value,
                        fontFamily: readConfig.fontFamily,
                        fontWeight: readConfig.fontWeight,
                        fontSize: readConfig.fontSize,
                        fontFeatureSettings: readConfig.fontFeatureSettings,
                        fontVariationSettings: readConfig.fontVariationSettings,
                        lineHeight: readConfig.lineHeight,
                        letterSpacing: readConfig.letterSpacing,
                        isMonospace: readConfig.isMonospace,
                        typicalHalfwidthCharacterWidth: Math.max(readConfig.typicalHalfwidthCharacterWidth, 5),
                        typicalFullwidthCharacterWidth: Math.max(readConfig.typicalFullwidthCharacterWidth, 5),
                        canUseHalfwidthRightwardsArrow: readConfig.canUseHalfwidthRightwardsArrow,
                        spaceWidth: Math.max(readConfig.spaceWidth, 5),
                        middotWidth: Math.max(readConfig.middotWidth, 5),
                        wsmiddotWidth: Math.max(readConfig.wsmiddotWidth, 5),
                        maxDigitWidth: Math.max(readConfig.maxDigitWidth, 5),
                    }, false);
                }
                this._writeToCache(bareFontInfo, readConfig);
            }
            return this._cache.get(bareFontInfo);
        }
        _createRequest(chr, type, all, monospace) {
            const result = new charWidthReader_1.CharWidthRequest(chr, type);
            all.push(result);
            monospace?.push(result);
            return result;
        }
        _actualReadFontInfo(bareFontInfo) {
            const all = [];
            const monospace = [];
            const typicalHalfwidthCharacter = this._createRequest('n', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const typicalFullwidthCharacter = this._createRequest('\uff4d', 0 /* CharWidthRequestType.Regular */, all, null);
            const space = this._createRequest(' ', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit0 = this._createRequest('0', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit1 = this._createRequest('1', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit2 = this._createRequest('2', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit3 = this._createRequest('3', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit4 = this._createRequest('4', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit5 = this._createRequest('5', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit6 = this._createRequest('6', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit7 = this._createRequest('7', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit8 = this._createRequest('8', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const digit9 = this._createRequest('9', 0 /* CharWidthRequestType.Regular */, all, monospace);
            // monospace test: used for whitespace rendering
            const rightwardsArrow = this._createRequest('→', 0 /* CharWidthRequestType.Regular */, all, monospace);
            const halfwidthRightwardsArrow = this._createRequest('￫', 0 /* CharWidthRequestType.Regular */, all, null);
            // U+00B7 - MIDDLE DOT
            const middot = this._createRequest('·', 0 /* CharWidthRequestType.Regular */, all, monospace);
            // U+2E31 - WORD SEPARATOR MIDDLE DOT
            const wsmiddotWidth = this._createRequest(String.fromCharCode(0x2E31), 0 /* CharWidthRequestType.Regular */, all, null);
            // monospace test: some characters
            const monospaceTestChars = '|/-_ilm%';
            for (let i = 0, len = monospaceTestChars.length; i < len; i++) {
                this._createRequest(monospaceTestChars.charAt(i), 0 /* CharWidthRequestType.Regular */, all, monospace);
                this._createRequest(monospaceTestChars.charAt(i), 1 /* CharWidthRequestType.Italic */, all, monospace);
                this._createRequest(monospaceTestChars.charAt(i), 2 /* CharWidthRequestType.Bold */, all, monospace);
            }
            (0, charWidthReader_1.readCharWidths)(bareFontInfo, all);
            const maxDigitWidth = Math.max(digit0.width, digit1.width, digit2.width, digit3.width, digit4.width, digit5.width, digit6.width, digit7.width, digit8.width, digit9.width);
            let isMonospace = (bareFontInfo.fontFeatureSettings === editorOptions_1.EditorFontLigatures.OFF);
            const referenceWidth = monospace[0].width;
            for (let i = 1, len = monospace.length; isMonospace && i < len; i++) {
                const diff = referenceWidth - monospace[i].width;
                if (diff < -0.001 || diff > 0.001) {
                    isMonospace = false;
                    break;
                }
            }
            let canUseHalfwidthRightwardsArrow = true;
            if (isMonospace && halfwidthRightwardsArrow.width !== referenceWidth) {
                // using a halfwidth rightwards arrow would break monospace...
                canUseHalfwidthRightwardsArrow = false;
            }
            if (halfwidthRightwardsArrow.width > rightwardsArrow.width) {
                // using a halfwidth rightwards arrow would paint a larger arrow than a regular rightwards arrow
                canUseHalfwidthRightwardsArrow = false;
            }
            return new fontInfo_1.FontInfo({
                pixelRatio: browser.PixelRatio.value,
                fontFamily: bareFontInfo.fontFamily,
                fontWeight: bareFontInfo.fontWeight,
                fontSize: bareFontInfo.fontSize,
                fontFeatureSettings: bareFontInfo.fontFeatureSettings,
                fontVariationSettings: bareFontInfo.fontVariationSettings,
                lineHeight: bareFontInfo.lineHeight,
                letterSpacing: bareFontInfo.letterSpacing,
                isMonospace: isMonospace,
                typicalHalfwidthCharacterWidth: typicalHalfwidthCharacter.width,
                typicalFullwidthCharacterWidth: typicalFullwidthCharacter.width,
                canUseHalfwidthRightwardsArrow: canUseHalfwidthRightwardsArrow,
                spaceWidth: space.width,
                middotWidth: middot.width,
                wsmiddotWidth: wsmiddotWidth.width,
                maxDigitWidth: maxDigitWidth
            }, true);
        }
    }
    exports.FontMeasurementsImpl = FontMeasurementsImpl;
    class FontMeasurementsCache {
        constructor() {
            this._keys = Object.create(null);
            this._values = Object.create(null);
        }
        has(item) {
            const itemId = item.getId();
            return !!this._values[itemId];
        }
        get(item) {
            const itemId = item.getId();
            return this._values[itemId];
        }
        put(item, value) {
            const itemId = item.getId();
            this._keys[itemId] = item;
            this._values[itemId] = value;
        }
        remove(item) {
            const itemId = item.getId();
            delete this._keys[itemId];
            delete this._values[itemId];
        }
        getValues() {
            return Object.keys(this._keys).map(id => this._values[id]);
        }
    }
    exports.FontMeasurements = new FontMeasurementsImpl();
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9udE1lYXN1cmVtZW50cy5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvZWRpdG9yL2Jyb3dzZXIvY29uZmlnL2ZvbnRNZWFzdXJlbWVudHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBaUNoRyxNQUFhLG9CQUFxQixTQUFRLHNCQUFVO1FBUW5EO1lBQ0MsS0FBSyxFQUFFLENBQUM7WUFKUSxpQkFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxlQUFPLEVBQVEsQ0FBQyxDQUFDO1lBQ3BELGdCQUFXLEdBQWdCLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDO1lBS2xFLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyw4QkFBOEIsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBRWUsT0FBTztZQUN0QixJQUFJLElBQUksQ0FBQyw4QkFBOEIsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUNoRCxZQUFZLENBQUMsSUFBSSxDQUFDLDhCQUE4QixDQUFDLENBQUM7Z0JBQ2xELElBQUksQ0FBQyw4QkFBOEIsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMxQyxDQUFDO1lBQ0QsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2pCLENBQUM7UUFFRDs7V0FFRztRQUNJLGlCQUFpQjtZQUN2QixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUkscUJBQXFCLEVBQUUsQ0FBQztZQUMxQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFCLENBQUM7UUFFTyxhQUFhLENBQUMsSUFBa0IsRUFBRSxLQUFlO1lBQ3hELElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUU3QixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsOEJBQThCLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDcEUsb0NBQW9DO2dCQUNwQyxJQUFJLENBQUMsOEJBQThCLEdBQUcsbUJBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFO29CQUNoRSxJQUFJLENBQUMsOEJBQThCLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUNoQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDVixDQUFDO1FBQ0YsQ0FBQztRQUVPLHVCQUF1QjtZQUM5QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3ZDLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1lBQzdCLEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ3JCLGdCQUFnQixHQUFHLElBQUksQ0FBQztvQkFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzFCLENBQUM7WUFDRixDQUFDO1lBQ0QsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN0QixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzFCLENBQUM7UUFDRixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxpQkFBaUI7WUFDdkIsZ0ZBQWdGO1lBQ2hGLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDL0QsQ0FBQztRQUVEOztXQUVHO1FBQ0ksZUFBZSxDQUFDLGNBQXFDO1lBQzNELHNGQUFzRjtZQUN0RiwwRkFBMEY7WUFDMUYsS0FBSyxNQUFNLGFBQWEsSUFBSSxjQUFjLEVBQUUsQ0FBQztnQkFDNUMsSUFBSSxhQUFhLENBQUMsT0FBTyxLQUFLLHVDQUE0QixFQUFFLENBQUM7b0JBQzVELDJCQUEyQjtvQkFDM0IsU0FBUztnQkFDVixDQUFDO2dCQUNELE1BQU0sUUFBUSxHQUFHLElBQUksbUJBQVEsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ3BELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3hDLENBQUM7UUFDRixDQUFDO1FBRUQ7O1dBRUc7UUFDSSxZQUFZLENBQUMsWUFBMEI7WUFDN0MsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7Z0JBQ3BDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFeEQsSUFBSSxVQUFVLENBQUMsOEJBQThCLElBQUksQ0FBQyxJQUFJLFVBQVUsQ0FBQyw4QkFBOEIsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLFVBQVUsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLGFBQWEsSUFBSSxDQUFDLEVBQUUsQ0FBQztvQkFDckssMkNBQTJDO29CQUMzQyxVQUFVLEdBQUcsSUFBSSxtQkFBUSxDQUFDO3dCQUN6QixVQUFVLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUFLO3dCQUNwQyxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVU7d0JBQ2pDLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTt3QkFDakMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRO3dCQUM3QixtQkFBbUIsRUFBRSxVQUFVLENBQUMsbUJBQW1CO3dCQUNuRCxxQkFBcUIsRUFBRSxVQUFVLENBQUMscUJBQXFCO3dCQUN2RCxVQUFVLEVBQUUsVUFBVSxDQUFDLFVBQVU7d0JBQ2pDLGFBQWEsRUFBRSxVQUFVLENBQUMsYUFBYTt3QkFDdkMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxXQUFXO3dCQUNuQyw4QkFBOEIsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyw4QkFBOEIsRUFBRSxDQUFDLENBQUM7d0JBQ3RGLDhCQUE4QixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLDhCQUE4QixFQUFFLENBQUMsQ0FBQzt3QkFDdEYsOEJBQThCLEVBQUUsVUFBVSxDQUFDLDhCQUE4Qjt3QkFDekUsVUFBVSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7d0JBQzlDLFdBQVcsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO3dCQUNoRCxhQUFhLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQzt3QkFDcEQsYUFBYSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7cUJBQ3BELEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQ1gsQ0FBQztnQkFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5QyxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN0QyxDQUFDO1FBRU8sY0FBYyxDQUFDLEdBQVcsRUFBRSxJQUEwQixFQUFFLEdBQXVCLEVBQUUsU0FBb0M7WUFDNUgsTUFBTSxNQUFNLEdBQUcsSUFBSSxrQ0FBZ0IsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDL0MsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNqQixTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hCLE9BQU8sTUFBTSxDQUFDO1FBQ2YsQ0FBQztRQUVPLG1CQUFtQixDQUFDLFlBQTBCO1lBQ3JELE1BQU0sR0FBRyxHQUF1QixFQUFFLENBQUM7WUFDbkMsTUFBTSxTQUFTLEdBQXVCLEVBQUUsQ0FBQztZQUV6QyxNQUFNLHlCQUF5QixHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyx3Q0FBZ0MsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ3pHLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLHdDQUFnQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDekcsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLHdDQUFnQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDckYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLHdDQUFnQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLHdDQUFnQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLHdDQUFnQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLHdDQUFnQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLHdDQUFnQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLHdDQUFnQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLHdDQUFnQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLHdDQUFnQyxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDdEYsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLHdD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