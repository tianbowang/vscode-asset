/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/base/common/platform", "vs/base/common/strings", "vs/platform/configuration/common/configuration", "vs/platform/configuration/test/common/testConfigurationService", "vs/platform/instantiation/test/common/instantiationServiceMock", "vs/workbench/contrib/terminalContrib/links/browser/terminalLocalLinkDetector", "vs/platform/terminal/common/capabilities/terminalCapabilityStore", "vs/workbench/contrib/terminalContrib/links/test/browser/linkTestUtils", "vs/base/common/async", "assert", "vs/workbench/contrib/terminalContrib/links/browser/terminalLinkResolver", "vs/platform/files/common/files", "vs/workbench/test/common/workbenchTestServices", "vs/base/common/uri", "vs/platform/log/common/log", "vs/platform/terminal/common/terminal", "vs/amdX", "vs/base/test/common/utils"], function (require, exports, platform_1, strings_1, configuration_1, testConfigurationService_1, instantiationServiceMock_1, terminalLocalLinkDetector_1, terminalCapabilityStore_1, linkTestUtils_1, async_1, assert_1, terminalLinkResolver_1, files_1, workbenchTestServices_1, uri_1, log_1, terminal_1, amdX_1, utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const unixLinks = [
        // Absolute
        '/foo',
        '/foo/bar',
        '/foo/[bar]',
        '/foo/[bar].baz',
        '/foo/[bar]/baz',
        '/foo/bar+more',
        // URI file://
        { link: 'file:///foo', resource: uri_1.URI.file('/foo') },
        { link: 'file:///foo/bar', resource: uri_1.URI.file('/foo/bar') },
        { link: 'file:///foo/bar%20baz', resource: uri_1.URI.file('/foo/bar baz') },
        // User home
        { link: '~/foo', resource: uri_1.URI.file('/home/foo') },
        // Relative
        { link: './foo', resource: uri_1.URI.file('/parent/cwd/foo') },
        { link: './$foo', resource: uri_1.URI.file('/parent/cwd/$foo') },
        { link: '../foo', resource: uri_1.URI.file('/parent/foo') },
        { link: 'foo/bar', resource: uri_1.URI.file('/parent/cwd/foo/bar') },
        { link: 'foo/bar+more', resource: uri_1.URI.file('/parent/cwd/foo/bar+more') },
    ];
    const windowsLinks = [
        // Absolute
        'c:\\foo',
        { link: '\\\\?\\C:\\foo', resource: uri_1.URI.file('C:\\foo') },
        'c:/foo',
        'c:/foo/bar',
        'c:\\foo\\bar',
        'c:\\foo\\bar+more',
        'c:\\foo/bar\\baz',
        // URI file://
        { link: 'file:///c:/foo', resource: uri_1.URI.file('c:\\foo') },
        { link: 'file:///c:/foo/bar', resource: uri_1.URI.file('c:\\foo\\bar') },
        { link: 'file:///c:/foo/bar%20baz', resource: uri_1.URI.file('c:\\foo\\bar baz') },
        // User home
        { link: '~\\foo', resource: uri_1.URI.file('C:\\Home\\foo') },
        { link: '~/foo', resource: uri_1.URI.file('C:\\Home\\foo') },
        // Relative
        { link: '.\\foo', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo') },
        { link: './foo', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo') },
        { link: './$foo', resource: uri_1.URI.file('C:\\Parent\\Cwd\\$foo') },
        { link: '..\\foo', resource: uri_1.URI.file('C:\\Parent\\foo') },
        { link: 'foo/bar', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\bar') },
        { link: 'foo/bar', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\bar') },
        { link: 'foo/[bar]', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\[bar]') },
        { link: 'foo/[bar].baz', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\[bar].baz') },
        { link: 'foo/[bar]/baz', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\[bar]/baz') },
        { link: 'foo\\bar', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\bar') },
        { link: 'foo\\[bar].baz', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\[bar].baz') },
        { link: 'foo\\[bar]\\baz', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\[bar]\\baz') },
        { link: 'foo\\bar+more', resource: uri_1.URI.file('C:\\Parent\\Cwd\\foo\\bar+more') },
    ];
    const supportedLinkFormats = [
        { urlFormat: '{0}' },
        { urlFormat: '{0}" on line {1}', line: '5' },
        { urlFormat: '{0}" on line {1}, column {2}', line: '5', column: '3' },
        { urlFormat: '{0}":line {1}', line: '5' },
        { urlFormat: '{0}":line {1}, column {2}', line: '5', column: '3' },
        { urlFormat: '{0}": line {1}', line: '5' },
        { urlFormat: '{0}": line {1}, col {2}', line: '5', column: '3' },
        { urlFormat: '{0}({1})', line: '5' },
        { urlFormat: '{0} ({1})', line: '5' },
        { urlFormat: '{0}({1},{2})', line: '5', column: '3' },
        { urlFormat: '{0} ({1},{2})', line: '5', column: '3' },
        { urlFormat: '{0}: ({1},{2})', line: '5', column: '3' },
        { urlFormat: '{0}({1}, {2})', line: '5', column: '3' },
        { urlFormat: '{0} ({1}, {2})', line: '5', column: '3' },
        { urlFormat: '{0}: ({1}, {2})', line: '5', column: '3' },
        { urlFormat: '{0}:{1}', line: '5' },
        { urlFormat: '{0}:{1}:{2}', line: '5', column: '3' },
        { urlFormat: '{0} {1}:{2}', line: '5', column: '3' },
        { urlFormat: '{0}[{1}]', line: '5' },
        { urlFormat: '{0} [{1}]', line: '5' },
        { urlFormat: '{0}[{1},{2}]', line: '5', column: '3' },
        { urlFormat: '{0} [{1},{2}]', line: '5', column: '3' },
        { urlFormat: '{0}: [{1},{2}]', line: '5', column: '3' },
        { urlFormat: '{0}[{1}, {2}]', line: '5', column: '3' },
        { urlFormat: '{0} [{1}, {2}]', line: '5', column: '3' },
        { urlFormat: '{0}: [{1}, {2}]', line: '5', column: '3' },
        { urlFormat: '{0}",{1}', line: '5' },
        { urlFormat: '{0}\',{1}', line: '5' },
        { urlFormat: '{0}#{1}', line: '5' },
        { urlFormat: '{0}#{1}:{2}', line: '5', column: '5' }
    ];
    const windowsFallbackLinks = [
        'C:\\foo bar',
        'C:\\foo bar\\baz',
        'C:\\foo\\bar baz',
        'C:\\foo/bar baz'
    ];
    const supportedFallbackLinkFormats = [
        // Python style error: File "<path>", line <line>
        { urlFormat: 'File "{0}"', linkCellStartOffset: 5 },
        { urlFormat: 'File "{0}", line {1}', line: '5', linkCellStartOffset: 5 },
        // Some C++ compile error formats
        { urlFormat: '{0}({1}) :', line: '5', linkCellEndOffset: -2 },
        { urlFormat: '{0}({1},{2}) :', line: '5', column: '3', linkCellEndOffset: -2 },
        { urlFormat: '{0}({1}, {2}) :', line: '5', column: '3', linkCellEndOffset: -2 },
        { urlFormat: '{0}({1}):', line: '5', linkCellEndOffset: -1 },
        { urlFormat: '{0}({1},{2}):', line: '5', column: '3', linkCellEndOffset: -1 },
        { urlFormat: '{0}({1}, {2}):', line: '5', column: '3', linkCellEndOffset: -1 },
        { urlFormat: '{0}:{1} :', line: '5', linkCellEndOffset: -2 },
        { urlFormat: '{0}:{1}:{2} :', line: '5', column: '3', linkCellEndOffset: -2 },
        { urlFormat: '{0}:{1}:', line: '5', linkCellEndOffset: -1 },
        { urlFormat: '{0}:{1}:{2}:', line: '5', column: '3', linkCellEndOffset: -1 },
        // Cmd prompt
        { urlFormat: '{0}>', linkCellEndOffset: -1 },
        // The whole line is the path
        { urlFormat: '{0}' },
    ];
    suite('Workbench - TerminalLocalLinkDetector', () => {
        const store = (0, utils_1.ensureNoDisposablesAreLeakedInTestSuite)();
        let instantiationService;
        let configurationService;
        let detector;
        let resolver;
        let xterm;
        let validResources;
        async function assertLinks(type, text, expected) {
            let to;
            const race = await Promise.race([
                (0, linkTestUtils_1.assertLinkHelper)(text, expected, detector, type).then(() => 'success'),
                (to = (0, async_1.timeout)(2)).then(() => 'timeout')
            ]);
            (0, assert_1.strictEqual)(race, 'success', `Awaiting link assertion for "${text}" timed out`);
            to.cancel();
        }
        async function assertLinksWithWrapped(link, resource) {
            const uri = resource ?? uri_1.URI.file(link);
            await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, link, [{ uri, range: [[1, 1], [link.length, 1]] }]);
            await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, ` ${link} `, [{ uri, range: [[2, 1], [link.length + 1, 1]] }]);
            await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `(${link})`, [{ uri, range: [[2, 1], [link.length + 1, 1]] }]);
            await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `[${link}]`, [{ uri, range: [[2, 1], [link.length + 1, 1]] }]);
        }
        setup(async () => {
            instantiationService = store.add(new instantiationServiceMock_1.TestInstantiationService());
            configurationService = new testConfigurationService_1.TestConfigurationService();
            instantiationService.stub(configuration_1.IConfigurationService, configurationService);
            instantiationService.stub(files_1.IFileService, {
                async stat(resource) {
                    if (!validResources.map(e => e.path).includes(resource.path)) {
                        throw new Error('Doesn\'t exist');
                    }
                    return (0, workbenchTestServices_1.createFileStat)(resource);
                }
            });
            instantiationService.stub(terminal_1.ITerminalLogService, new log_1.NullLogService());
            resolver = instantiationService.createInstance(terminalLinkResolver_1.TerminalLinkResolver);
            validResources = [];
            const TerminalCtor = (await (0, amdX_1.importAMDNodeModule)('@xterm/xterm', 'lib/xterm.js')).Terminal;
            xterm = new TerminalCtor({ allowProposedApi: true, cols: 80, rows: 30 });
        });
        suite('platform independent', () => {
            setup(() => {
                detector = instantiationService.createInstance(terminalLocalLinkDetector_1.TerminalLocalLinkDetector, xterm, store.add(new terminalCapabilityStore_1.TerminalCapabilityStore()), {
                    initialCwd: '/parent/cwd',
                    os: 3 /* OperatingSystem.Linux */,
                    remoteAuthority: undefined,
                    userHome: '/home',
                    backend: undefined
                }, resolver);
            });
            test('should support multiple link results', async () => {
                validResources = [
                    uri_1.URI.file('/parent/cwd/foo'),
                    uri_1.URI.file('/parent/cwd/bar')
                ];
                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, './foo ./bar', [
                    { range: [[1, 1], [5, 1]], uri: uri_1.URI.file('/parent/cwd/foo') },
                    { range: [[7, 1], [11, 1]], uri: uri_1.URI.file('/parent/cwd/bar') }
                ]);
            });
            test('should support trimming extra quotes', async () => {
                validResources = [uri_1.URI.file('/parent/cwd/foo')];
                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, '"foo"" on line 5', [
                    { range: [[1, 1], [16, 1]], uri: uri_1.URI.file('/parent/cwd/foo') }
                ]);
            });
            test('should support trimming extra square brackets', async () => {
                validResources = [uri_1.URI.file('/parent/cwd/foo')];
                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, '"foo]" on line 5', [
                    { range: [[1, 1], [16, 1]], uri: uri_1.URI.file('/parent/cwd/foo') }
                ]);
            });
        });
        suite('macOS/Linux', () => {
            setup(() => {
                detector = instantiationService.createInstance(terminalLocalLinkDetector_1.TerminalLocalLinkDetector, xterm, store.add(new terminalCapabilityStore_1.TerminalCapabilityStore()), {
                    initialCwd: '/parent/cwd',
                    os: 3 /* OperatingSystem.Linux */,
                    remoteAuthority: undefined,
                    userHome: '/home',
                    backend: undefined
                }, resolver);
            });
            for (const l of unixLinks) {
                const baseLink = typeof l === 'string' ? l : l.link;
                const resource = typeof l === 'string' ? uri_1.URI.file(l) : l.resource;
                suite(`Link: ${baseLink}`, () => {
                    for (let i = 0; i < supportedLinkFormats.length; i++) {
                        const linkFormat = supportedLinkFormats[i];
                        const formattedLink = (0, strings_1.format)(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
                        test(`should detect in "${formattedLink}"`, async () => {
                            validResources = [resource];
                            await assertLinksWithWrapped(formattedLink, resource);
                        });
                    }
                });
            }
            test('Git diff links', async () => {
                validResources = [uri_1.URI.file('/parent/cwd/foo/bar')];
                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `diff --git a/foo/bar b/foo/bar`, [
                    { uri: validResources[0], range: [[14, 1], [20, 1]] },
                    { uri: validResources[0], range: [[24, 1], [30, 1]] }
                ]);
                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `--- a/foo/bar`, [{ uri: validResources[0], range: [[7, 1], [13, 1]] }]);
                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `+++ b/foo/bar`, [{ uri: validResources[0], range: [[7, 1], [13, 1]] }]);
            });
        });
        // Only test these when on Windows because there is special behavior around replacing separators
        // in URI that cannot be changed
        if (platform_1.isWindows) {
            suite('Windows', () => {
                const wslUnixToWindowsPathMap = new Map();
                setup(() => {
                    detector = instantiationService.createInstance(terminalLocalLinkDetector_1.TerminalLocalLinkDetector, xterm, store.add(new terminalCapabilityStore_1.TerminalCapabilityStore()), {
                        initialCwd: 'C:\\Parent\\Cwd',
                        os: 1 /* OperatingSystem.Windows */,
                        remoteAuthority: undefined,
                        userHome: 'C:\\Home',
                        backend: {
                            async getWslPath(original, direction) {
                                if (direction === 'unix-to-win') {
                                    return wslUnixToWindowsPathMap.get(original) ?? original;
                                }
                                return original;
                            },
                        }
                    }, resolver);
                    wslUnixToWindowsPathMap.clear();
                });
                for (const l of windowsLinks) {
                    const baseLink = typeof l === 'string' ? l : l.link;
                    const resource = typeof l === 'string' ? uri_1.URI.file(l) : l.resource;
                    suite(`Link "${baseLink}"`, () => {
                        for (let i = 0; i < supportedLinkFormats.length; i++) {
                            const linkFormat = supportedLinkFormats[i];
                            const formattedLink = (0, strings_1.format)(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
                            test(`should detect in "${formattedLink}"`, async () => {
                                validResources = [resource];
                                await assertLinksWithWrapped(formattedLink, resource);
                            });
                        }
                    });
                }
                for (const l of windowsFallbackLinks) {
                    const baseLink = typeof l === 'string' ? l : l.link;
                    const resource = typeof l === 'string' ? uri_1.URI.file(l) : l.resource;
                    suite(`Fallback link "${baseLink}"`, () => {
                        for (let i = 0; i < supportedFallbackLinkFormats.length; i++) {
                            const linkFormat = supportedFallbackLinkFormats[i];
                            const formattedLink = (0, strings_1.format)(linkFormat.urlFormat, baseLink, linkFormat.line, linkFormat.column);
                            const linkCellStartOffset = linkFormat.linkCellStartOffset ?? 0;
                            const linkCellEndOffset = linkFormat.linkCellEndOffset ?? 0;
                            test(`should detect in "${formattedLink}"`, async () => {
                                validResources = [resource];
                                await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, formattedLink, [{ uri: resource, range: [[1 + linkCellStartOffset, 1], [formattedLink.length + linkCellEndOffset, 1]] }]);
                            });
                        }
                    });
                }
                test('Git diff links', async () => {
                    const resource = uri_1.URI.file('C:\\Parent\\Cwd\\foo\\bar');
                    validResources = [resource];
                    await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `diff --git a/foo/bar b/foo/bar`, [
                        { uri: resource, range: [[14, 1], [20, 1]] },
                        { uri: resource, range: [[24, 1], [30, 1]] }
                    ]);
                    await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `--- a/foo/bar`, [{ uri: resource, range: [[7, 1], [13, 1]] }]);
                    await assertLinks("LocalFile" /* TerminalBuiltinLinkType.LocalFile */, `+++ b/foo/bar`, [{ uri: resource, range: [[7, 1], [13, 1]] }]);
                });
                suite('WSL', () => {
                    test('Unix -> Windows /mnt/ style links', async () => {
                        wslUnixToWindowsPathMap.set('/mnt/c/foo/bar', 'C:\\foo\\bar');
                        validResources = [uri_1.URI.file('C:\\foo\\bar')];
                        await assertLinksWithWrapped('/mnt/c/foo/bar', validResources[0]);
                    });
                    test('Windows -> Unix \\\\wsl$\\ style links', async () => {
                        validResources = [uri_1.URI.file('\\\\wsl$\\Debian\\home\\foo\\bar')];
                        await assertLinksWithWrapped('\\\\wsl$\\Debian\\home\\foo\\bar');
                    });
                    test('Windows -> Unix \\\\wsl.localhost\\ style links', async () => {
                        validResources = [uri_1.URI.file('\\\\wsl.localhost\\Debian\\home\\foo\\bar')];
                        await assertLinksWithWrapped('\\\\wsl.localhost\\Debian\\home\\foo\\bar');
                    });
                });
            });
        }
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVybWluYWxMb2NhbExpbmtEZXRlY3Rvci50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy93b3JrYmVuY2gvY29udHJpYi90ZXJtaW5hbENvbnRyaWIvbGlua3MvdGVzdC9icm93c2VyL3Rlcm1pbmFsTG9jYWxMaW5rRGV0ZWN0b3IudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O2dHQUdnRzs7OztJQXVCaEcsTUFBTSxTQUFTLEdBQWlEO1FBQy9ELFdBQVc7UUFDWCxNQUFNO1FBQ04sVUFBVTtRQUNWLFlBQVk7UUFDWixnQkFBZ0I7UUFDaEIsZ0JBQWdCO1FBQ2hCLGVBQWU7UUFDZixjQUFjO1FBQ2QsRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ25ELEVBQUUsSUFBSSxFQUFFLGlCQUFpQixFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1FBQzNELEVBQUUsSUFBSSxFQUFFLHVCQUF1QixFQUFFLFFBQVEsRUFBRSxTQUFHLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUFFO1FBQ3JFLFlBQVk7UUFDWixFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFNBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7UUFDbEQsV0FBVztRQUNYLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1FBQ3hELEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1FBQzFELEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBRyxDQUFD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