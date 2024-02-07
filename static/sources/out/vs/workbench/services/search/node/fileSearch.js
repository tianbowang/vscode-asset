/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "child_process", "fs", "vs/base/common/path", "string_decoder", "vs/base/common/arrays", "vs/base/common/errorMessage", "vs/base/common/glob", "vs/base/common/normalization", "vs/base/common/extpath", "vs/base/common/platform", "vs/base/common/stopwatch", "vs/base/common/strings", "vs/base/common/types", "vs/base/node/pfs", "vs/workbench/services/search/common/search", "./ripgrepFileSearch", "vs/base/common/fuzzyScorer"], function (require, exports, childProcess, fs, path, string_decoder_1, arrays, errorMessage_1, glob, normalization, extpath_1, platform, stopwatch_1, strings, types, pfs_1, search_1, ripgrepFileSearch_1, fuzzyScorer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Engine = exports.FileWalker = void 0;
    const killCmds = new Set();
    process.on('exit', () => {
        killCmds.forEach(cmd => cmd());
    });
    class FileWalker {
        constructor(config) {
            this.normalizedFilePatternLowercase = null;
            this.maxFilesize = null;
            this.isCanceled = false;
            this.fileWalkSW = null;
            this.cmdSW = null;
            this.cmdResultCount = 0;
            this.config = config;
            this.filePattern = config.filePattern || '';
            this.includePattern = config.includePattern && glob.parse(config.includePattern);
            this.maxResults = config.maxResults || null;
            this.exists = !!config.exists;
            this.walkedPaths = Object.create(null);
            this.resultCount = 0;
            this.isLimitHit = false;
            this.directoriesWalked = 0;
            this.filesWalked = 0;
            this.errors = [];
            if (this.filePattern) {
                this.normalizedFilePatternLowercase = (0, fuzzyScorer_1.prepareQuery)(this.filePattern).normalizedLowercase;
            }
            this.globalExcludePattern = config.excludePattern && glob.parse(config.excludePattern);
            this.folderExcludePatterns = new Map();
            config.folderQueries.forEach(folderQuery => {
                const folderExcludeExpression = Object.assign({}, folderQuery.excludePattern || {}, this.config.excludePattern || {});
                // Add excludes for other root folders
                const fqPath = folderQuery.folder.fsPath;
                config.folderQueries
                    .map(rootFolderQuery => rootFolderQuery.folder.fsPath)
                    .filter(rootFolder => rootFolder !== fqPath)
                    .forEach(otherRootFolder => {
                    // Exclude nested root folders
                    if ((0, extpath_1.isEqualOrParent)(otherRootFolder, fqPath)) {
                        folderExcludeExpression[path.relative(fqPath, otherRootFolder)] = true;
                    }
                });
                this.folderExcludePatterns.set(fqPath, new AbsoluteAndRelativeParsedExpression(folderExcludeExpression, fqPath));
            });
        }
        cancel() {
            this.isCanceled = true;
            killCmds.forEach(cmd => cmd());
        }
        walk(folderQueries, extraFiles, onResult, onMessage, done) {
            this.fileWalkSW = stopwatch_1.StopWatch.create(false);
            // Support that the file pattern is a full path to a file that exists
            if (this.isCanceled) {
                return done(null, this.isLimitHit);
            }
            // For each extra file
            extraFiles.forEach(extraFilePath => {
                const basename = path.basename(extraFilePath.fsPath);
                if (this.globalExcludePattern && this.globalExcludePattern(extraFilePath.fsPath, basename)) {
                    return; // excluded
                }
                // File: Check for match on file pattern and include pattern
                this.matchFile(onResult, { relativePath: extraFilePath.fsPath /* no workspace relative path */, searchPath: undefined });
            });
            this.cmdSW = stopwatch_1.StopWatch.create(false);
            // For each root folder
            this.parallel(folderQueries, (folderQuery, rootFolderDone) => {
                this.call(this.cmdTraversal, this, folderQuery, onResult, onMessage, (err) => {
                    if (err) {
                        const errorMessage = (0, errorMessage_1.toErrorMessage)(err);
                        console.error(errorMessage);
                        this.errors.push(errorMessage);
                        rootFolderDone(err, undefined);
                    }
                    else {
                        rootFolderDone(null, undefined);
                    }
                });
            }, (errors, _result) => {
                this.fileWalkSW.stop();
                const err = errors ? arrays.coalesce(errors)[0] : null;
                done(err, this.isLimitHit);
            });
        }
        parallel(list, fn, callback) {
            const results = new Array(list.length);
            const errors = new Array(list.length);
            let didErrorOccur = false;
            let doneCount = 0;
            if (list.length === 0) {
                return callback(null, []);
            }
            list.forEach((item, index) => {
                fn(item, (error, result) => {
                    if (error) {
                        didErrorOccur = true;
                        results[index] = null;
                        errors[index] = error;
                    }
                    else {
                        results[index] = result;
                        errors[index] = null;
                    }
                    if (++doneCount === list.length) {
                        return callback(didErrorOccur ? errors : null, results);
                    }
                });
            });
        }
        call(fun, that, ...args) {
            try {
                fun.apply(that, args);
            }
            catch (e) {
                args[args.length - 1](e);
            }
        }
        cmdTraversal(folderQuery, onResult, onMessage, cb) {
            const rootFolder = folderQuery.folder.fsPath;
            const isMac = platform.isMacintosh;
            const killCmd = () => cmd && cmd.kill();
            killCmds.add(killCmd);
            let done = (err) => {
                killCmds.delete(killCmd);
                done = () => { };
                cb(err);
            };
            let leftover = '';
            const tree = this.initDirectoryTree();
            const ripgrep = (0, ripgrepFileSearch_1.spawnRipgrepCmd)(this.config, folderQuery, this.config.includePattern, this.folderExcludePatterns.get(folderQuery.folder.fsPath).expression);
            const cmd = ripgrep.cmd;
            const noSiblingsClauses = !Object.keys(ripgrep.siblingClauses).length;
            const escapedArgs = ripgrep.rgArgs.args
                .map(arg => arg.match(/^-/) ? arg : `'${arg}'`)
                .join(' ');
            let rgCmd = `${ripgrep.rgDiskPath} ${escapedArgs}\n - cwd: ${ripgrep.cwd}`;
            if (ripgrep.rgArgs.siblingClauses) {
                rgCmd += `\n - Sibling clauses: ${JSON.stringify(ripgrep.rgArgs.siblingClauses)}`;
            }
            onMessage({ message: rgCmd });
            this.cmdResultCount = 0;
            this.collectStdout(cmd, 'utf8', onMessage, (err, stdout, last) => {
                if (err) {
                    done(err);
                    return;
                }
                if (this.isLimitHit) {
                    done();
                    return;
                }
                // Mac: uses NFD unicode form on disk, but we want NFC
                const normalized = leftover + (isMac ? normalization.normalizeNFC(stdout || '') : stdout);
                const relativeFiles = normalized.split('\n');
                if (last) {
                    const n = relativeFiles.length;
                    relativeFiles[n - 1] = relativeFiles[n - 1].trim();
                    if (!relativeFiles[n - 1]) {
                        relativeFiles.pop();
                    }
                }
                else {
                    leftover = relativeFiles.pop() || '';
                }
                if (relativeFiles.length && relativeFiles[0].indexOf('\n') !== -1) {
                    done(new Error('Splitting up files failed'));
                    return;
                }
                this.cmdResultCount += relativeFiles.length;
                if (noSiblingsClauses) {
                    for (const relativePath of relativeFiles) {
                        this.matchFile(onResult, { base: rootFolder, relativePath, searchPath: this.getSearchPath(folderQuery, relativePath) });
                        if (this.isLimitHit) {
                            killCmd();
                            break;
                        }
                    }
                    if (last || this.isLimitHit) {
                        done();
                    }
                    return;
                }
                // TODO: Optimize siblings clauses with ripgrep here.
                this.addDirectoryEntries(folderQuery, tree, rootFolder, relativeFiles, onResult);
                if (last) {
                    this.matchDirectoryTree(tree, rootFolder, onResult);
                    done();
                }
            });
        }
        /**
         * Public for testing.
         */
        spawnFindCmd(folderQuery) {
            const excludePattern = this.folderExcludePatterns.get(folderQuery.folder.fsPath);
            const basenames = excludePattern.getBasenameTerms();
            const pathTerms = excludePattern.getPathTerms();
            const args = ['-L', '.'];
            if (basenames.length || pathTerms.length) {
                args.push('-not', '(', '(');
                for (const basename of basenames) {
                    args.push('-name', basename);
                    args.push('-o');
                }
                for (const path of pathTerms) {
                    args.push('-path', path);
                    args.push('-o');
                }
                args.pop();
                args.push(')', '-prune', ')');
            }
            args.push('-type', 'f');
            return childProcess.spawn('find', args, { cwd: folderQuery.folder.fsPath });
        }
        /**
         * Public for testing.
         */
        readStdout(cmd, encoding, cb) {
            let all = '';
            this.collectStdout(cmd, encoding, () => { }, (err, stdout, last) => {
                if (err) {
                    cb(err);
                    return;
                }
                all += stdout;
                if (last) {
                    cb(null, all);
                }
            });
        }
        collectStdout(cmd, encoding, onMessage, cb) {
            let onData = (err, stdout, last) => {
                if (err || last) {
                    onData = () => { };
                    this.cmdSW?.stop();
                }
                cb(err, stdout, last);
            };
            let gotData = false;
            if (cmd.stdout) {
                // Should be non-null, but #38195
                this.forwardData(cmd.stdout, encoding, onData);
                cmd.stdout.once('data', () => gotData = true);
            }
            else {
                onMessage({ message: 'stdout is null' });
            }
            let stderr;
            if (cmd.stderr) {
                // Should be non-null, but #38195
                stderr = this.collectData(cmd.stderr);
            }
            else {
                onMessage({ message: 'stderr is null' });
            }
            cmd.on('error', (err) => {
                onData(err);
            });
            cmd.on('close', (code) => {
                // ripgrep returns code=1 when no results are found
                let stderrText;
                if (!gotData && (stderrText = this.decodeData(stderr, encoding)) && rgErrorMsgForDisplay(stderrText)) {
                    onData(new Error(`command failed with error code ${code}: ${this.decodeData(stderr, encoding)}`));
                }
                else {
                    if (this.exists && code === 0) {
                        this.isLimitHit = true;
                    }
                    onData(null, '', true);
                }
            });
        }
        forwardData(stream, encoding, cb) {
            const decoder = new string_decoder_1.StringDecoder(encoding);
            stream.on('data', (data) => {
                cb(null, decoder.write(data));
            });
            return decoder;
        }
        collectData(stream) {
            const buffers = [];
            stream.on('data', (data) => {
                buffers.push(data);
            });
            return buffers;
        }
        decodeData(buffers, encoding) {
            const decoder = new string_decoder_1.StringDecoder(encoding);
            return buffers.map(buffer => decoder.write(buffer)).join('');
        }
        initDirectoryTree() {
            const tree = {
                rootEntries: [],
                pathToEntries: Object.create(null)
            };
            tree.pathToEntries['.'] = tree.rootEntries;
            return tree;
        }
        addDirectoryEntries(folderQuery, { pathToEntries }, base, relativeFiles, onResult) {
            // Support relative paths to files from a root resource (ignores excludes)
            if (relativeFiles.indexOf(this.filePattern) !== -1) {
                this.matchFile(onResult, {
                    base,
                    relativePath: this.filePattern,
                    searchPath: this.getSearchPath(folderQuery, this.filePattern)
                });
            }
            const add = (relativePath) => {
                const basename = path.basename(relativePath);
                const dirname = path.dirname(relativePath);
                let entries = pathToEntries[dirname];
                if (!entries) {
                    entries = pathToEntries[dirname] = [];
                    add(dirname);
                }
                entries.push({
                    base,
                    relativePath,
                    basename,
                    searchPath: this.getSearchPath(folderQuery, relativePath),
                });
            };
            relativeFiles.forEach(add);
        }
        matchDirectoryTree({ rootEntries, pathToEntries }, rootFolder, onResult) {
            const self = this;
            const excludePattern = this.folderExcludePatterns.get(rootFolder);
            const filePattern = this.filePattern;
            function matchDirectory(entries) {
                self.directoriesWalked++;
                const hasSibling = (0, search_1.hasSiblingFn)(() => entries.map(entry => entry.basename));
                for (let i = 0, n = entries.length; i < n; i++) {
                    const entry = entries[i];
                    const { relativePath, basename } = entry;
                    // Check exclude pattern
                    // If the user searches for the exact file name, we adjust the glob matching
                    // to ignore filtering by siblings because the user seems to know what they
                    // are searching for and we want to include the result in that case anyway
                    if (excludePattern.test(relativePath, basename, filePattern !== basename ? hasSibling : undefined)) {
                        continue;
                    }
                    const sub = pathToEntries[relativePath];
                    if (sub) {
                        matchDirectory(sub);
                    }
                    else {
                        self.filesWalked++;
                        if (relativePath === filePattern) {
                            continue; // ignore file if its path matches with the file pattern because that is already matched above
                        }
                        self.matchFile(onResult, entry);
                    }
                    if (self.isLimitHit) {
                        break;
                    }
                }
            }
            matchDirectory(rootEntries);
        }
        getStats() {
            return {
                cmdTime: this.cmdSW.elapsed(),
                fileWalkTime: this.fileWalkSW.elapsed(),
                directoriesWalked: this.directoriesWalked,
                filesWalked: this.filesWalked,
                cmdResultCount: this.cmdResultCount
            };
        }
        doWalk(folderQuery, relativeParentPath, files, onResult, done) {
            const rootFolder = folderQuery.folder;
            // Execute tasks on each file in parallel to optimize throughput
            const hasSibling = (0, search_1.hasSiblingFn)(() => files);
            this.parallel(files, (file, clb) => {
                // Check canceled
                if (this.isCanceled || this.isLimitHit) {
                    return clb(null);
                }
                // Check exclude pattern
                // If the user searches for the exact file name, we adjust the glob matching
                // to ignore filtering by siblings because the user seems to know what they
                // are searching for and we want to include the result in that case anyway
                const currentRelativePath = relativeParentPath ? [relativeParentPath, file].join(path.sep) : file;
                if (this.folderExcludePatterns.get(folderQuery.folder.fsPath).test(currentRelativePath, file, this.config.filePattern !== file ? hasSibling : undefined)) {
                    return clb(null);
                }
                // Use lstat to detect links
                const currentAbsolutePath = [rootFolder.fsPath, currentRelativePath].join(path.sep);
                fs.lstat(currentAbsolutePath, (error, lstat) => {
                    if (error || this.isCanceled || this.isLimitHit) {
                        return clb(null);
                    }
                    // If the path is a link, we must instead use fs.stat() to find out if the
                    // link is a directory or not because lstat will always return the stat of
                    // the link which is always a file.
                    this.statLinkIfNeeded(currentAbsolutePath, lstat, (error, stat) => {
                        if (error || this.isCanceled || this.isLimitHit) {
                            return clb(null);
                        }
                        // Directory: Follow directories
                        if (stat.isDirectory()) {
                            this.directoriesWalked++;
                            // to really prevent loops with links we need to resolve the real path of them
                            return this.realPathIfNeeded(currentAbsolutePath, lstat, (error, realpath) => {
                                if (error || this.isCanceled || this.isLimitHit) {
                                    return clb(null);
                                }
                                realpath = realpath || '';
                                if (this.walkedPaths[realpath]) {
                                    return clb(null); // escape when there are cycles (can happen with symlinks)
                                }
                                this.walkedPaths[realpath] = true; // remember as walked
                                // Continue walking
                                return pfs_1.Promises.readdir(currentAbsolutePath).then(children => {
                                    if (this.isCanceled || this.isLimitHit) {
                                        return clb(null);
                                    }
                                    this.doWalk(folderQuery, currentRelativePath, children, onResult, err => clb(err || null));
                                }, error => {
                                    clb(null);
                                });
                            });
                        }
                        // File: Check for match on file pattern and include pattern
                        else {
                            this.filesWalked++;
                            if (currentRelativePath === this.filePattern) {
                                return clb(null, undefined); // ignore file if its path matches with the file pattern because checkFilePatternRelativeMatch() takes care of those
                            }
                            if (this.maxFilesize && types.isNumber(stat.size) && stat.size > this.maxFilesize) {
                                return clb(null, undefined); // ignore file if max file size is hit
                            }
                            this.matchFile(onResult, {
                                base: rootFolder.fsPath,
                                relativePath: currentRelativePath,
                                searchPath: this.getSearchPath(folderQuery, currentRelativePath),
                            });
                        }
                        // Unwind
                        return clb(null, undefined);
                    });
                });
            }, (error) => {
                const filteredErrors = error ? arrays.coalesce(error) : error; // find any error by removing null values first
                return done(filteredErrors && filteredErrors.length > 0 ? filteredErrors[0] : undefined);
            });
        }
        matchFile(onResult, candidate) {
            if (this.isFileMatch(candidate) && (!this.includePattern || this.includePattern(candidate.relativePath, path.basename(candidate.relativePath)))) {
                this.resultCount++;
                if (this.exists || (this.maxResults && this.resultCount > this.maxResults)) {
                    this.isLimitHit = true;
                }
                if (!this.isLimitHit) {
                    onResult(candidate);
                }
            }
        }
        isFileMatch(candidate) {
            // Check for search pattern
            if (this.filePattern) {
                if (this.filePattern === '*') {
                    return true; // support the all-matching wildcard
                }
                if (this.normalizedFilePatternLowercase) {
                    return (0, search_1.isFilePatternMatch)(candidate, this.normalizedFilePatternLowercase);
                }
            }
            // No patterns means we match all
            return true;
        }
        statLinkIfNeeded(path, lstat, clb) {
            if (lstat.isSymbolicLink()) {
                return fs.stat(path, clb); // stat the target the link points to
            }
            return clb(null, lstat); // not a link, so the stat is already ok for us
        }
        realPathIfNeeded(path, lstat, clb) {
            if (lstat.isSymbolicLink()) {
                return fs.realpath(path, (error, realpath) => {
                    if (error) {
                        return clb(error);
                    }
                    return clb(null, realpath);
                });
            }
            return clb(null, path);
        }
        /**
         * If we're searching for files in multiple workspace folders, then better prepend the
         * name of the workspace folder to the path of the file. This way we'll be able to
         * better filter files that are all on the top of a workspace folder and have all the
         * same name. A typical example are `package.json` or `README.md` files.
         */
        getSearchPath(folderQuery, relativePath) {
            if (folderQuery.folderName) {
                return path.join(folderQuery.folderName, relativePath);
            }
            return relativePath;
        }
    }
    exports.FileWalker = FileWalker;
    class Engine {
        constructor(config) {
            this.folderQueries = config.folderQueries;
            this.extraFiles = config.extraFileResources || [];
            this.walker = new FileWalker(config);
        }
        search(onResult, onProgress, done) {
            this.walker.walk(this.folderQueries, this.extraFiles, onResult, onProgress, (err, isLimitHit) => {
                done(err, {
                    limitHit: isLimitHit,
                    stats: this.walker.getStats(),
                    messages: [],
                });
            });
        }
        cancel() {
            this.walker.cancel();
        }
    }
    exports.Engine = Engine;
    /**
     * This class exists to provide one interface on top of two ParsedExpressions, one for absolute expressions and one for relative expressions.
     * The absolute and relative expressions don't "have" to be kept separate, but this keeps us from having to path.join every single
     * file searched, it's only used for a text search with a searchPath
     */
    class AbsoluteAndRelativeParsedExpression {
        constructor(expression, root) {
            this.expression = expression;
            this.root = root;
            this.init(expression);
        }
        /**
         * Split the IExpression into its absolute and relative components, and glob.parse them separately.
         */
        init(expr) {
            let absoluteGlobExpr;
            let relativeGlobExpr;
            Object.keys(expr)
                .filter(key => expr[key])
                .forEach(key => {
                if (path.isAbsolute(key)) {
                    absoluteGlobExpr = absoluteGlobExpr || glob.getEmptyExpression();
                    absoluteGlobExpr[key] = expr[key];
                }
                else {
                    relativeGlobExpr = relativeGlobExpr || glob.getEmptyExpression();
                    relativeGlobExpr[key] = expr[key];
                }
            });
            this.absoluteParsedExpr = absoluteGlobExpr && glob.parse(absoluteGlobExpr, { trimForExclusions: true });
            this.relativeParsedExpr = relativeGlobExpr && glob.parse(relativeGlobExpr, { trimForExclusions: true });
        }
        test(_path, basename, hasSibling) {
            return (this.relativeParsedExpr && this.relativeParsedExpr(_path, basename, hasSibling)) ||
                (this.absoluteParsedExpr && this.absoluteParsedExpr(path.join(this.root, _path), basename, hasSibling));
        }
        getBasenameTerms() {
            const basenameTerms = [];
            if (this.absoluteParsedExpr) {
                basenameTerms.push(...glob.getBasenameTerms(this.absoluteParsedExpr));
            }
            if (this.relativeParsedExpr) {
                basenameTerms.push(...glob.getBasenameTerms(this.relativeParsedExpr));
            }
            return basenameTerms;
        }
        getPathTerms() {
            const pathTerms = [];
            if (this.absoluteParsedExpr) {
                pathTerms.push(...glob.getPathTerms(this.absoluteParsedExpr));
            }
            if (this.relativeParsedExpr) {
                pathTerms.push(...glob.getPathTerms(this.relativeParsedExpr));
            }
            return pathTerms;
        }
    }
    function rgErrorMsgForDisplay(msg) {
        const lines = msg.trim().split('\n');
        const firstLine = lines[0].trim();
        if (firstLine.startsWith('Error parsing regex')) {
            return firstLine;
        }
        if (firstLine.startsWith('regex parse error')) {
            return strings.uppercaseFirstLetter(lines[lines.length - 1].trim());
        }
        if (firstLine.startsWith('error parsing glob') ||
            firstLine.startsWith('unsupported encoding')) {
            // Uppercase first letter
            return firstLine.charAt(0).toUpperCase() + firstLine.substr(1);
        }
        if (firstLine === `Literal '\\n' not allowed.`) {
            // I won't localize this because none of the Ripgrep error messages are localized
            return `Literal '\\n' currently not supported`;
        }
        if (firstLine.startsWith('Literal ')) {
            // Other unsupported chars
            return firstLine;
        }
        return undefined;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZVNlYXJjaC5qcyIsInNvdXJjZVJvb3QiOiJmaWxlOi8vL1VzZXJzL3RpYW5ib3cvRGVza3RvcC92c2NvZGUvc3JjLyIsInNvdXJjZXMiOlsidnMvd29ya2JlbmNoL3NlcnZpY2VzL3NlYXJjaC9ub2RlL2ZpbGVTZWFyY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztnR0FHZ0c7Ozs7O0lBZ0NoRyxNQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsRUFBYyxDQUFDO0lBQ3ZDLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRTtRQUN2QixRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztJQUNoQyxDQUFDLENBQUMsQ0FBQztJQUVILE1BQWEsVUFBVTtRQXVCdEIsWUFBWSxNQUFrQjtZQXBCdEIsbUNBQThCLEdBQWtCLElBQUksQ0FBQztZQUlyRCxnQkFBVyxHQUFrQixJQUFJLENBQUM7WUFHbEMsZUFBVSxHQUFHLEtBQUssQ0FBQztZQUNuQixlQUFVLEdBQXFCLElBQUksQ0FBQztZQUlwQyxVQUFLLEdBQXFCLElBQUksQ0FBQztZQUMvQixtQkFBYyxHQUFXLENBQUMsQ0FBQztZQVFsQyxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztZQUNyQixJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDO1lBQzVDLElBQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUNqRixJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDO1lBQzVDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDOUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMs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