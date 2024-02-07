define(["require", "exports", "assert", "vs/platform/contextkey/common/contextkey"], function (require, exports, assert, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function parseToStr(input) {
        const parser = new contextkey_1.Parser();
        const prints = [];
        const print = (...ss) => { ss.forEach(s => prints.push(s)); };
        const expr = parser.parse(input);
        if (expr === undefined) {
            if (parser.lexingErrors.length > 0) {
                print('Lexing errors:', '\n\n');
                parser.lexingErrors.forEach(lexingError => print(`Unexpected token '${lexingError.lexeme}' at offset ${lexingError.offset}. ${lexingError.additionalInfo}`, '\n'));
            }
            if (parser.parsingErrors.length > 0) {
                if (parser.lexingErrors.length > 0) {
                    print('\n --- \n');
                }
                print('Parsing errors:', '\n\n');
                parser.parsingErrors.forEach(parsingError => print(`Unexpected '${parsingError.lexeme}' at offset ${parsingError.offset}.`, '\n'));
            }
        }
        else {
            print(expr.serialize());
        }
        return prints.join('');
    }
    suite('Context Key Parser', () => {
        test(' foo', () => {
            const input = ' foo';
            assert.deepStrictEqual(parseToStr(input), "foo");
        });
        test('!foo', () => {
            const input = '!foo';
            assert.deepStrictEqual(parseToStr(input), "!foo");
        });
        test('foo =~ /bar/', () => {
            const input = 'foo =~ /bar/';
            assert.deepStrictEqual(parseToStr(input), "foo =~ /bar/");
        });
        test(`foo || (foo =~ /bar/ && baz)`, () => {
            const input = `foo || (foo =~ /bar/ && baz)`;
            assert.deepStrictEqual(parseToStr(input), "foo || baz && foo =~ /bar/");
        });
        test('foo || (foo =~ /bar/ || baz)', () => {
            const input = 'foo || (foo =~ /bar/ || baz)';
            assert.deepStrictEqual(parseToStr(input), "baz || foo || foo =~ /bar/");
        });
        test(`(foo || bar) && (jee || jar)`, () => {
            const input = `(foo || bar) && (jee || jar)`;
            assert.deepStrictEqual(parseToStr(input), "bar && jar || bar && jee || foo && jar || foo && jee");
        });
        test('foo && foo =~ /zee/i', () => {
            const input = 'foo && foo =~ /zee/i';
            assert.deepStrictEqual(parseToStr(input), "foo && foo =~ /zee/i");
        });
        test('foo.bar==enabled', () => {
            const input = 'foo.bar==enabled';
            assert.deepStrictEqual(parseToStr(input), "foo.bar == 'enabled'");
        });
        test(`foo.bar == 'enabled'`, () => {
            const input = `foo.bar == 'enabled'`;
            assert.deepStrictEqual(parseToStr(input), `foo.bar == 'enabled'`);
        });
        test('foo.bar:zed==completed - equality with no space', () => {
            const input = 'foo.bar:zed==completed';
            assert.deepStrictEqual(parseToStr(input), "foo.bar:zed == 'completed'");
        });
        test('a && b || c', () => {
            const input = 'a && b || c';
            assert.deepStrictEqual(parseToStr(input), "c || a && b");
        });
        test('fooBar && baz.jar && fee.bee<K-loo+1>', () => {
            const input = 'fooBar && baz.jar && fee.bee<K-loo+1>';
            assert.deepStrictEqual(parseToStr(input), "baz.jar && fee.bee<K-loo+1> && fooBar");
        });
        test('foo.barBaz<C-r> < 2', () => {
            const input = 'foo.barBaz<C-r> < 2';
            assert.deepStrictEqual(parseToStr(input), `foo.barBaz<C-r> < 2`);
        });
        test('foo.bar >= -1', () => {
            const input = 'foo.bar >= -1';
            assert.deepStrictEqual(parseToStr(input), "foo.bar >= -1");
        });
        test(`key contains &nbsp: view == vsc-packages-activitybar-folders && vsc-packages-folders-loaded`, () => {
            const input = `view == vsc-packages-activitybar-folders && vsc-packages-folders-loaded`;
            assert.deepStrictEqual(parseToStr(input), "vsc-packages-folders-loaded && view == 'vsc-packages-activitybar-folders'");
        });
        test('foo.bar <= -1', () => {
            const input = 'foo.bar <= -1';
            assert.deepStrictEqual(parseToStr(input), `foo.bar <= -1`);
        });
        test('!cmake:hideBuildCommand \u0026\u0026 cmake:enableFullFeatureSet', () => {
            const input = '!cmake:hideBuildCommand \u0026\u0026 cmake:enableFullFeatureSet';
            assert.deepStrictEqual(parseToStr(input), "cmake:enableFullFeatureSet && !cmake:hideBuildCommand");
        });
        test('!(foo && bar)', () => {
            const input = '!(foo && bar)';
            assert.deepStrictEqual(parseToStr(input), "!bar || !foo");
        });
        test('!(foo && bar || boar) || deer', () => {
            const input = '!(foo && bar || boar) || deer';
            assert.deepStrictEqual(parseToStr(input), "deer || !bar && !boar || !boar && !foo");
        });
        test(`!(!foo)`, () => {
            const input = `!(!foo)`;
            assert.deepStrictEqual(parseToStr(input), "foo");
        });
        suite('controversial', () => {
            /*
                new parser KEEPS old one's behavior:
    
                old parser output: { key: 'debugState', op: '==', value: '"stopped"' }
                new parser output: { key: 'debugState', op: '==', value: '"stopped"' }
    
                TODO@ulugbekna: we should consider breaking old parser's behavior, and not take double quotes as part of the `value` because that's not what user expects.
            */
            test(`debugState == "stopped"`, () => {
                const input = `debugState == "stopped"`;
                assert.deepStrictEqual(parseToStr(input), "debugState == '\"stopped\"'");
            });
            /*
                new parser BREAKS old one's behavior:
    
                old parser output: { key: 'viewItem', op: '==', value: 'VSCode WorkSpace' }
                new parser output: { key: 'viewItem', op: '==', value: 'VSCode' }
    
                TODO@ulugbekna: since this's breaking, we can have hacky code that tries detecting such cases and replicate old parser's behavior.
            */
            test(` viewItem == VSCode WorkSpace`, () => {
                const input = ` viewItem == VSCode WorkSpace`;
                assert.deepStrictEqual(parseToStr(input), "Parsing errors:\n\nUnexpected 'WorkSpace' at offset 20.\n");
            });
        });
        suite('regex', () => {
            test(`resource =~ //foo/(barr|door/(Foo-Bar%20Templates|Soo%20Looo)|Web%20Site%Jjj%20Llll)(/.*)*$/`, () => {
                const input = `resource =~ //foo/(barr|door/(Foo-Bar%20Templates|Soo%20Looo)|Web%20Site%Jjj%20Llll)(/.*)*$/`;
                assert.deepStrictEqual(parseToStr(input), "resource =~ /\\/foo\\/(barr|door\\/(Foo-Bar%20Templates|Soo%20Looo)|Web%20Site%Jjj%20Llll)(\\/.*)*$/");
            });
            test(`resource =~ /((/scratch/(?!update)(.*)/)|((/src/).*/)).*$/`, () => {
                const input = `resource =~ /((/scratch/(?!update)(.*)/)|((/src/).*/)).*$/`;
                assert.deepStrictEqual(parseToStr(input), "resource =~ /((\\/scratch\\/(?!update)(.*)\\/)|((\\/src\\/).*\\/)).*$/");
            });
            test(`resourcePath =~ /\.md(\.yml|\.txt)*$/giym`, () => {
                const input = `resourcePath =~ /\.md(\.yml|\.txt)*$/giym`;
                assert.deepStrictEqual(parseToStr(input), "resourcePath =~ /.md(.yml|.txt)*$/im");
            });
        });
        suite('error handling', () => {
            test(`/foo`, () => {
                const input = `/foo`;
                assert.deepStrictEqual(parseToStr(input), "Lexing errors:\n\nUnexpected token '/foo' at offset 0. Did you forget to escape the '/' (slash) character? Put two backslashes before it to escape, e.g., '\\\\/'.\n\n --- \nParsing errors:\n\nUnexpected '/foo' at offset 0.\n");
            });
            test(`!b == 'true'`, () => {
                const input = `!b == 'true'`;
                assert.deepStrictEqual(parseToStr(input), "Parsing errors:\n\nUnexpected '==' at offset 3.\n");
            });
            test('!foo &&  in bar', () => {
                const input = '!foo &&  in bar';
                assert.deepStrictEqual(parseToStr(input), "Parsing errors:\n\nUnexpected 'in' at offset 9.\n");
            });
            test('vim<c-r> == 1 && vim<2<=3', () => {
                const input = 'vim<c-r> == 1 && vim<2<=3';
                assert.deepStrictEqual(parseToStr(input), "Lexing errors:\n\nUnexpected token '=' at offset 23. Did you mean == or =~?\n\n --- \nParsing errors:\n\nUnexpected '=' at offset 23.\n"); // FIXME
            });
            test(`foo && 'bar`, () => {
                const input = `foo && 'bar`;
                assert.deepStrictEqual(parseToStr(input), "Lexing errors:\n\nUnexpected token ''bar' at offset 7. Did you forget to open or close the quote?\n\n --- \nParsing errors:\n\nUnexpected ''bar' at offset 7.\n");
            });
            test(`config.foo &&  &&bar =~ /^foo$|^bar-foo$|^joo$|^jar$/ && !foo`, () => {
                const input = `config.foo &&  &&bar =~ /^foo$|^bar-foo$|^joo$|^jar$/ && !foo`;
                assert.deepStrictEqual(parseToStr(input), "Parsing errors:\n\nUnexpected '&&' at offset 15.\n");
            });
            test(`!foo == 'test'`, () => {
                const input = `!foo == 'test'`;
                assert.deepStrictEqual(parseToStr(input), "Parsing errors:\n\nUnexpected '==' at offset 5.\n");
            });
            test(`!!foo`, function () {
                const input = `!!foo`;
                assert.deepStrictEqual(parseToStr(input), "Parsing errors:\n\nUnexpected '!' at offset 1.\n");
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiZmlsZTovLy9Vc2Vycy90aWFuYm93L0Rlc2t0b3AvdnNjb2RlL3NyYy8iLCJzb3VyY2VzIjpbInZzL3BsYXRmb3JtL2NvbnRleHRrZXkvdGVzdC9jb21tb24vcGFyc2VyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBT0EsU0FBUyxVQUFVLENBQUMsS0FBYTtRQUNoQyxNQUFNLE1BQU0sR0FBRyxJQUFJLG1CQUFNLEVBQUUsQ0FBQztRQUU1QixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7UUFFNUIsTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFHLEVBQVksRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUV4RSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLElBQUksSUFBSSxLQUFLLFNBQVMsRUFBRSxDQUFDO1lBQ3hCLElBQUksTUFBTSxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDaEMsTUFBTSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMscUJBQXFCLFdBQVcsQ0FBQyxNQUFNLGVBQWUsV0FBVyxDQUFDLE1BQU0sS0FBSyxXQUFXLENBQUMsY0FBYyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNwSyxDQUFDO1lBRUQsSUFBSSxNQUFNLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDckMsSUFBSSxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FB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