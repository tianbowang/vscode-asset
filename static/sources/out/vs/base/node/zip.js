/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "fs", "vs/base/common/async", "vs/base/common/path", "vs/base/common/types", "vs/base/node/pfs", "vs/nls"], function (require, exports, fs_1, async_1, path, types_1, pfs_1, nls) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.buffer = exports.extract = exports.zip = exports.ExtractError = exports.CorruptZipMessage = void 0;
    exports.CorruptZipMessage = 'end of central directory record signature not found';
    const CORRUPT_ZIP_PATTERN = new RegExp(exports.CorruptZipMessage);
    class ExtractError extends Error {
        constructor(type, cause) {
            let message = cause.message;
            switch (type) {
                case 'CorruptZip':
                    message = `Corrupt ZIP: ${message}`;
                    break;
            }
            super(message);
            this.type = type;
            this.cause = cause;
        }
    }
    exports.ExtractError = ExtractError;
    function modeFromEntry(entry) {
        const attr = entry.externalFileAttributes >> 16 || 33188;
        return [448 /* S_IRWXU */, 56 /* S_IRWXG */, 7 /* S_IRWXO */]
            .map(mask => attr & mask)
            .reduce((a, b) => a + b, attr & 61440 /* S_IFMT */);
    }
    function toExtractError(err) {
        if (err instanceof ExtractError) {
            return err;
        }
        let type = undefined;
        if (CORRUPT_ZIP_PATTERN.test(err.message)) {
            type = 'CorruptZip';
        }
        return new ExtractError(type, err);
    }
    function extractEntry(stream, fileName, mode, targetPath, options, token) {
        const dirName = path.dirname(fileName);
        const targetDirName = path.join(targetPath, dirName);
        if (!targetDirName.startsWith(targetPath)) {
            return Promise.reject(new Error(nls.localize('invalid file', "Error extracting {0}. Invalid file.", fileName)));
        }
        const targetFileName = path.join(targetPath, fileName);
        let istream;
        token.onCancellationRequested(() => {
            istream?.destroy();
        });
        return Promise.resolve(pfs_1.Promises.mkdir(targetDirName, { recursive: true })).then(() => new Promise((c, e) => {
            if (token.isCancellationRequested) {
                return;
            }
            try {
                istream = (0, fs_1.createWriteStream)(targetFileName, { mode });
                istream.once('close', () => c());
                istream.once('error', e);
                stream.once('error', e);
                stream.pipe(istream);
            }
            catch (error) {
                e(error);
            }
        }));
    }
    function extractZip(zipfile, targetPath, options, token) {
        let last = (0, async_1.createCancelablePromise)(() => Promise.resolve());
        let extractedEntriesCount = 0;
        const listener = token.onCancellationRequested(() => {
            last.cancel();
            zipfile.close();
        });
        return new Promise((c, e) => {
            const throttler = new async_1.Sequencer();
            const readNextEntry = (token) => {
                if (token.isCancellationRequested) {
                    return;
                }
                extractedEntriesCount++;
                zipfile.readEntry();
            };
            zipfile.once('error', e);
            zipfile.once('close', () => last.then(() => {
                if (token.isCancellationRequested || zipfile.entryCount === extractedEntriesCount) {
                    c();
                }
                else {
                    e(new ExtractError('Incomplete', new Error(nls.localize('incompleteExtract', "Incomplete. Found {0} of {1} entries", extractedEntriesCount, zipfile.entryCount))));
                }
            }, e));
            zipfile.readEntry();
            zipfile.on('entry', (entry) => {
                if (token.isCancellationRequested) {
                    return;
                }
                if (!options.sourcePathRegex.test(entry.fileName)) {
                    readNextEntry(token);
                    return;
                }
                const fileName = entry.fileName.replace(options.sourcePathRegex, '');
                // directory file names end with '/'
                if (/\/$/.test(fileName)) {
                    const targetFileName = path.join(targetPath, fileName);
                    last = (0, async_1.createCancelablePromise)(token => pfs_1.Promises.mkdir(targetFileName, { recursive: true }).then(() => readNextEntry(token)).then(undefined, e));
                    return;
                }
                const stream = openZipStream(zipfile, entry);
                const mode = modeFromEntry(entry);
                last = (0, async_1.createCancelablePromise)(token => throttler.queue(() => stream.then(stream => extractEntry(stream, fileName, mode, targetPath, options, token).then(() => readNextEntry(token)))).then(null, e));
            });
        }).finally(() => listener.dispose());
    }
    async function openZip(zipFile, lazy = false) {
        const { open } = await new Promise((resolve_1, reject_1) => { require(['yauzl'], resolve_1, reject_1); });
        return new Promise((resolve, reject) => {
            open(zipFile, lazy ? { lazyEntries: true } : undefined, (error, zipfile) => {
                if (error) {
                    reject(toExtractError(error));
                }
                else {
                    resolve((0, types_1.assertIsDefined)(zipfile));
                }
            });
        });
    }
    function openZipStream(zipFile, entry) {
        return new Promise((resolve, reject) => {
            zipFile.openReadStream(entry, (error, stream) => {
                if (error) {
                    reject(toExtractError(error));
                }
                else {
                    resolve((0, types_1.assertIsDefined)(stream));
                }
            });
        });
    }
    async function zip(zipPath, files) {
        const { ZipFile } = await new Promise((resolve_2, reject_2) => { require(['yazl'], resolve_2, reject_2); });
        return new Promise((c, e) => {
            const zip = new ZipFile();
            files.forEach(f => {
                if (f.contents) {
                    zip.addBuffer(typeof f.contents === 'string' ? Buffer.from(f.contents, 'utf8') : f.contents, f.path);
                }
                else if (f.localPath) {
                    zip.addFile(f.localPath, f.path);
                }
            });
            zip.end();
            const zipStream = (0, fs_1.createWriteStream)(zipPath);
            zip.outputStream.pipe(zipStream);
            zip.outputStream.once('error', e);
            zipStream.once('error', e);
            zipStream.once('finish', () => c(zipPath));
        });
    }
    exports.zip = zip;
    function extract(zipPath, targetPath, options = {}, token) {
        const sourcePathRegex = new RegExp(options.sourcePath ? `^${options.sourcePath}` : '');
        let promise = openZip(zipPath, true);
        if (options.overwrite) {
            promise = promise.then(zipfile => pfs_1.Promises.rm(targetPath).then(() => zipfile));
        }
        return promise.then(zipfile => extractZip(zipfile, targetPath, { sourcePathRegex }, token));
    }
    exports.extract = extract;
    function read(zipPath, filePath) {
        return openZip(zipPath).then(zipfile => {
            return new Promise((c, e) => {
                zipfile.on('entry', (entry) => {
                    if (entry.fileName === filePath) {
                        openZipStream(zipfile, entry).then(stream => c(stream), err => e(err));
                    }
                });
                zipfile.once('close', () => e(new Error(nls.localize('notFound', "{0} not found inside zip.", filePath))));
            });
        });
    }
    function buffer(zipPath, filePath) {
        return read(zipPath, filePath).then(stream => {
            return new Promise((c, e) => {
                const buffers = [];
                stream.once('error', e);
                stream.on('data', (b) => buffers.push(b));
                stream.on('end', () => c(Buffer.concat(buffers)));
            });
        });
    }
    exports.buffer = buffer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemlwLmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9iYXNlL25vZGUvemlwLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Z0dBR2dHOzs7OztJQVluRixRQUFBLGlCQUFpQixHQUFXLHFEQUFxRCxDQUFDO0lBQy9GLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxNQUFNLENBQUMseUJBQWlCLENBQUMsQ0FBQztJQWtCMUQsTUFBYSxZQUFhLFNBQVEsS0FBSztRQUl0QyxZQUFZLElBQWtDLEVBQUUsS0FBWTtZQUMzRCxJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1lBRTVCLFFBQVEsSUFBSSxFQUFFLENBQUM7Z0JBQ2QsS0FBSyxZQUFZO29CQUFFLE9BQU8sR0FBRyxnQkFBZ0IsT0FBTyxFQUFFLENBQUM7b0JBQUMsTUFBTTtZQUMvRCxDQUFDO1lBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ2YsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7WUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7UUFDcEIsQ0FBQztLQUNEO0lBZkQsb0NBZUM7SUFFRCxTQUFTLGFBQWEsQ0FBQyxLQUFZO1FBQ2xDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxzQkFBc0IsSUFBSSxFQUFFLElBQUksS0FBSyxDQUFDO1FBRXpELE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQzthQUMzRCxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQ3hCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FB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