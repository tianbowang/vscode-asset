define(["require", "exports", "assert", "vs/base/common/platform", "vs/platform/contextkey/common/contextkey"], function (require, exports, assert, platform_1, contextkey_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function createContext(ctx) {
        return {
            getValue: (key) => {
                return ctx[key];
            }
        };
    }
    suite('ContextKeyExpr', () => {
        test('ContextKeyExpr.equals', () => {
            const a = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('a1'), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('and.a')), contextkey_1.ContextKeyExpr.has('a2'), contextkey_1.ContextKeyExpr.regex('d3', /d.*/), contextkey_1.ContextKeyExpr.regex('d4', /\*\*3*/), contextkey_1.ContextKeyExpr.equals('b1', 'bb1'), contextkey_1.ContextKeyExpr.equals('b2', 'bb2'), contextkey_1.ContextKeyExpr.notEquals('c1', 'cc1'), contextkey_1.ContextKeyExpr.notEquals('c2', 'cc2'), contextkey_1.ContextKeyExpr.not('d1'), contextkey_1.ContextKeyExpr.not('d2'));
            const b = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('b2', 'bb2'), contextkey_1.ContextKeyExpr.notEquals('c1', 'cc1'), contextkey_1.ContextKeyExpr.not('d1'), contextkey_1.ContextKeyExpr.regex('d4', /\*\*3*/), contextkey_1.ContextKeyExpr.notEquals('c2', 'cc2'), contextkey_1.ContextKeyExpr.has('a2'), contextkey_1.ContextKeyExpr.equals('b1', 'bb1'), contextkey_1.ContextKeyExpr.regex('d3', /d.*/), contextkey_1.ContextKeyExpr.has('a1'), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.equals('and.a', true)), contextkey_1.ContextKeyExpr.not('d2'));
            assert(a.equals(b), 'expressions should be equal');
        });
        test('issue #134942: Equals in comparator expressions', () => {
            function testEquals(expr, str) {
                const deserialized = contextkey_1.ContextKeyExpr.deserialize(str);
                assert.ok(expr);
                assert.ok(deserialized);
                assert.strictEqual(expr.equals(deserialized), true, str);
            }
            testEquals(contextkey_1.ContextKeyExpr.greater('value', 0), 'value > 0');
            testEquals(contextkey_1.ContextKeyExpr.greaterEquals('value', 0), 'value >= 0');
            testEquals(contextkey_1.ContextKeyExpr.smaller('value', 0), 'value < 0');
            testEquals(contextkey_1.ContextKeyExpr.smallerEquals('value', 0), 'value <= 0');
        });
        test('normalize', () => {
            const key1IsTrue = contextkey_1.ContextKeyExpr.equals('key1', true);
            const key1IsNotFalse = contextkey_1.ContextKeyExpr.notEquals('key1', false);
            const key1IsFalse = contextkey_1.ContextKeyExpr.equals('key1', false);
            const key1IsNotTrue = contextkey_1.ContextKeyExpr.notEquals('key1', true);
            assert.ok(key1IsTrue.equals(contextkey_1.ContextKeyExpr.has('key1')));
            assert.ok(key1IsNotFalse.equals(contextkey_1.ContextKeyExpr.has('key1')));
            assert.ok(key1IsFalse.equals(contextkey_1.ContextKeyExpr.not('key1')));
            assert.ok(key1IsNotTrue.equals(contextkey_1.ContextKeyExpr.not('key1')));
        });
        test('evaluate', () => {
            const context = createContext({
                'a': true,
                'b': false,
                'c': '5',
                'd': 'd'
            });
            function testExpression(expr, expected) {
                // console.log(expr + ' ' + expected);
                const rules = contextkey_1.ContextKeyExpr.deserialize(expr);
                assert.strictEqual(rules.evaluate(context), expected, expr);
            }
            function testBatch(expr, value) {
                /* eslint-disable eqeqeq */
                testExpression(expr, !!value);
                testExpression(expr + ' == true', !!value);
                testExpression(expr + ' != true', !value);
                testExpression(expr + ' == false', !value);
                testExpression(expr + ' != false', !!value);
                testExpression(expr + ' == 5', value == '5');
                testExpression(expr + ' != 5', value != '5');
                testExpression('!' + expr, !value);
                testExpression(expr + ' =~ /d.*/', /d.*/.test(value));
                testExpression(expr + ' =~ /D/i', /D/i.test(value));
                /* eslint-enable eqeqeq */
            }
            testBatch('a', true);
            testBatch('b', false);
            testBatch('c', '5');
            testBatch('d', 'd');
            testBatch('z', undefined);
            testExpression('true', true);
            testExpression('false', false);
            testExpression('a && !b', true && !false);
            testExpression('a && b', true && false);
            testExpression('a && !b && c == 5', true && !false && '5' === '5');
            testExpression('d =~ /e.*/', false);
            // precedence test: false && true || true === true because && is evaluated first
            testExpression('b && a || a', true);
            testExpression('a || b', true);
            testExpression('b || b', false);
            testExpression('b && a || a && b', false);
        });
        test('negate', () => {
            function testNegate(expr, expected) {
                const actual = contextkey_1.ContextKeyExpr.deserialize(expr).negate().serialize();
                assert.strictEqual(actual, expected);
            }
            testNegate('true', 'false');
            testNegate('false', 'true');
            testNegate('a', '!a');
            testNegate('a && b || c', '!a && !c || !b && !c');
            testNegate('a && b || c || d', '!a && !c && !d || !b && !c && !d');
            testNegate('!a && !b || !c && !d', 'a && c || a && d || b && c || b && d');
            testNegate('!a && !b || !c && !d || !e && !f', 'a && c && e || a && c && f || a && d && e || a && d && f || b && c && e || b && c && f || b && d && e || b && d && f');
        });
        test('false, true', () => {
            function testNormalize(expr, expected) {
                const actual = contextkey_1.ContextKeyExpr.deserialize(expr).serialize();
                assert.strictEqual(actual, expected);
            }
            testNormalize('true', 'true');
            testNormalize('!true', 'false');
            testNormalize('false', 'false');
            testNormalize('!false', 'true');
            testNormalize('a && true', 'a');
            testNormalize('a && false', 'false');
            testNormalize('a || true', 'true');
            testNormalize('a || false', 'a');
            testNormalize('isMac', platform_1.isMacintosh ? 'true' : 'false');
            testNormalize('isLinux', platform_1.isLinux ? 'true' : 'false');
            testNormalize('isWindows', platform_1.isWindows ? 'true' : 'false');
        });
        test('issue #101015: distribute OR', () => {
            function t(expr1, expr2, expected) {
                const e1 = contextkey_1.ContextKeyExpr.deserialize(expr1);
                const e2 = contextkey_1.ContextKeyExpr.deserialize(expr2);
                const actual = contextkey_1.ContextKeyExpr.and(e1, e2)?.serialize();
                assert.strictEqual(actual, expected);
            }
            t('a', 'b', 'a && b');
            t('a || b', 'c', 'a && c || b && c');
            t('a || b', 'c || d', 'a && c || a && d || b && c || b && d');
            t('a || b', 'c && d', 'a && c && d || b && c && d');
            t('a || b', 'c && d || e', 'a && e || b && e || a && c && d || b && c && d');
        });
        test('ContextKeyInExpr', () => {
            const ainb = contextkey_1.ContextKeyExpr.deserialize('a in b');
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 3, 'b': [3, 2, 1] })), true);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 3, 'b': [1, 2, 3] })), true);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 3, 'b': [1, 2] })), false);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 3 })), false);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 3, 'b': null })), false);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 'x', 'b': ['x'] })), true);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 'x', 'b': ['y'] })), false);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 'x', 'b': {} })), false);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 'x', 'b': { 'x': false } })), true);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 'x', 'b': { 'x': true } })), true);
            assert.strictEqual(ainb.evaluate(createContext({ 'a': 'prototype', 'b': {} })), false);
        });
        test('ContextKeyNotInExpr', () => {
            const aNotInB = contextkey_1.ContextKeyExpr.deserialize('a not in b');
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 3, 'b': [3, 2, 1] })), false);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 3, 'b': [1, 2, 3] })), false);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 3, 'b': [1, 2] })), true);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 3 })), true);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 3, 'b': null })), true);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 'x', 'b': ['x'] })), false);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 'x', 'b': ['y'] })), true);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 'x', 'b': {} })), true);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 'x', 'b': { 'x': false } })), false);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 'x', 'b': { 'x': true } })), false);
            assert.strictEqual(aNotInB.evaluate(createContext({ 'a': 'prototype', 'b': {} })), true);
        });
        test('issue #106524: distributing AND should normalize', () => {
            const actual = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.has('a'), contextkey_1.ContextKeyExpr.has('b')), contextkey_1.ContextKeyExpr.has('c'));
            const expected = contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('a'), contextkey_1.ContextKeyExpr.has('c')), contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('b'), contextkey_1.ContextKeyExpr.has('c')));
            assert.strictEqual(actual.equals(expected), true);
        });
        test('issue #129625: Removes duplicated terms in OR expressions', () => {
            const expr = contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.has('A'), contextkey_1.ContextKeyExpr.has('B'), contextkey_1.ContextKeyExpr.has('A'));
            assert.strictEqual(expr.serialize(), 'A || B');
        });
        test('Resolves true constant OR expressions', () => {
            const expr = contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.has('A'), contextkey_1.ContextKeyExpr.not('A'));
            assert.strictEqual(expr.serialize(), 'true');
        });
        test('Resolves false constant AND expressions', () => {
            const expr = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('A'), contextkey_1.ContextKeyExpr.not('A'));
            assert.strictEqual(expr.serialize(), 'false');
        });
        test('issue #129625: Removes duplicated terms in AND expressions', () => {
            const expr = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('A'), contextkey_1.ContextKeyExpr.has('B'), contextkey_1.ContextKeyExpr.has('A'));
            assert.strictEqual(expr.serialize(), 'A && B');
        });
        test('issue #129625: Remove duplicated terms when negating', () => {
            const expr = contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('A'), contextkey_1.ContextKeyExpr.or(contextkey_1.ContextKeyExpr.has('B1'), contextkey_1.ContextKeyExpr.has('B2')));
            assert.strictEqual(expr.serialize(), 'A && B1 || A && B2');
            assert.strictEqual(expr.negate().serialize(), '!A || !A && !B1 || !A && !B2 || !B1 && !B2');
            assert.strictEqual(expr.negate().negate().serialize(), 'A && B1 || A && B2');
            assert.strictEqual(expr.negate().negate().negate().serialize(), '!A || !A && !B1 || !A && !B2 || !B1 && !B2');
        });
        test('issue #129625: remove redundant terms in OR expressions', () => {
            function strImplies(p0, q0) {
                const p = contextkey_1.ContextKeyExpr.deserialize(p0);
                const q = contextkey_1.ContextKeyExpr.deserialize(q0);
                return (0, contextkey_1.implies)(p, q);
            }
            assert.strictEqual(strImplies('a && b', 'a'), true);
            assert.strictEqual(strImplies('a', 'a && b'), false);
        });
        test('implies', () => {
            function strImplies(p0, q0) {
                const p = contextkey_1.ContextKeyExpr.deserialize(p0);
                const q = contextkey_1.ContextKeyExpr.deserialize(q0);
                return (0, contextkey_1.implies)(p, q);
            }
            assert.strictEqual(strImplies('a', 'a'), true);
            assert.strictEqual(strImplies('a', 'a || b'), true);
            assert.strictEqual(strImplies('a', 'a && b'), false);
            assert.strictEqual(strImplies('a', 'a && b || a && c'), false);
            assert.strictEqual(strImplies('a && b', 'a'), true);
            assert.strictEqual(strImplies('a && b', 'b'), true);
            assert.strictEqual(strImplies('a && b', 'a && b || c'), true);
            assert.strictEqual(strImplies('a || b', 'a || c'), false);
            assert.strictEqual(strImplies('a || b', 'a || b'), true);
            assert.strictEqual(strImplies('a && b', 'a && b'), true);
            assert.strictEqual(strImplies('a || b', 'a || b || c'), true);
            assert.strictEqual(strImplies('c && a && b', 'c && a'), true);
        });
        test('Greater, GreaterEquals, Smaller, SmallerEquals evaluate', () => {
            function checkEvaluate(expr, ctx, expected) {
                const _expr = contextkey_1.ContextKeyExpr.deserialize(expr);
                assert.strictEqual(_expr.evaluate(createContext(ctx)), expected);
            }
            checkEvaluate('a > 1', {}, false);
            checkEvaluate('a > 1', { a: 0 }, false);
            checkEvaluate('a > 1', { a: 1 }, false);
            checkEvaluate('a > 1', { a: 2 }, true);
            checkEvaluate('a > 1', { a: '0' }, false);
            checkEvaluate('a > 1', { a: '1' }, false);
            checkEvaluate('a > 1', { a: '2' }, true);
            checkEvaluate('a > 1', { a: 'a' }, false);
            checkEvaluate('a > 10', { a: 2 }, false);
            checkEvaluate('a > 10', { a: 11 }, true);
            checkEvaluate('a > 10', { a: '11' }, true);
            checkEvaluate('a > 10', { a: '2' }, false);
            checkEvaluate('a > 10', { a: '11' }, true);
            checkEvaluate('a > 1.1', { a: 1 }, false);
            checkEvaluate('a > 1.1', { a: 2 }, true);
            checkEvaluate('a > 1.1', { a: 11 }, true);
            checkEvaluate('a > 1.1', { a: '1.1' }, false);
            checkEvaluate('a > 1.1', { a: '2' }, true);
            checkEvaluate('a > 1.1', { a: '11' }, true);
            checkEvaluate('a > b', { a: 'b' }, false);
            checkEvaluate('a > b', { a: 'c' }, false);
            checkEvaluate('a > b', { a: 1000 }, false);
            checkEvaluate('a >= 2', { a: '1' }, false);
            checkEvaluate('a >= 2', { a: '2' }, true);
            checkEvaluate('a >= 2', { a: '3' }, true);
            checkEvaluate('a < 2', { a: '1' }, true);
            checkEvaluate('a < 2', { a: '2' }, false);
            checkEvaluate('a < 2', { a: '3' }, false);
            checkEvaluate('a <= 2', { a: '1' }, true);
            checkEvaluate('a <= 2', { a: '2' }, true);
            checkEvaluate('a <= 2', { a: '3' }, false);
        });
        test('Greater, GreaterEquals, Smaller, SmallerEquals negate', () => {
            function checkNegate(expr, expected) {
                const a = contextkey_1.ContextKeyExpr.deserialize(expr);
                const b = a.negate();
                assert.strictEqual(b.serialize(), expected);
            }
            checkNegate('a > 1', 'a <= 1');
            checkNegate('a > 1.1', 'a <= 1.1');
            checkNegate('a > b', 'a <= b');
            checkNegate('a >= 1', 'a < 1');
            checkNegate('a >= 1.1', 'a < 1.1');
            checkNegate('a >= b', 'a < b');
            checkNegate('a < 1', 'a >= 1');
            checkNegate('a < 1.1', 'a >= 1.1');
            checkNegate('a < b', 'a >= b');
            checkNegate('a <= 1', 'a > 1');
            checkNegate('a <= 1.1', 'a > 1.1');
            checkNegate('a <= b', 'a > b');
        });
        test('issue #111899: context keys can use `<` or `>` ', () => {
            const actual = contextkey_1.ContextKeyExpr.deserialize('editorTextFocus && vim.active && vim.use<C-r>');
            assert.ok(actual.equals(contextkey_1.ContextKeyExpr.and(contextkey_1.ContextKeyExpr.has('editorTextFocus'), contextkey_1.ContextKeyExpr.has('vim.active'), contextkey_1.ContextKeyExpr.has('vim.use<C-r>'))));
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGV4dGtleS50ZXN0LmpzIiwic291cmNlUm9vdCI6ImZpbGU6Ly8vVXNlcnMvdGlhbmJvdy9EZXNrdG9wL3ZzY29kZS9zcmMvIiwic291cmNlcyI6WyJ2cy9wbGF0Zm9ybS9jb250ZXh0a2V5L3Rlc3QvY29tbW9uL2NvbnRleHRrZXkudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFRQSxTQUFTLGFBQWEsQ0FBQyxHQUFRO1FBQzlCLE9BQU87WUFDTixRQUFRLEVBQUUsQ0FBQyxHQUFXLEVBQUUsRUFBRTtnQkFDekIsT0FBTyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDakIsQ0FBQztTQUNELENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtRQUM1QixJQUFJLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1lBQ2xDLE1BQU0sQ0FBQyxHQUFHLDJCQUFjLENBQUMsR0FBRyxDQUMzQiwyQkFBYyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFDeEIsMkJBQWMsQ0FBQyxHQUFHLENBQUMsMkJBQWMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsRUFDL0MsMkJBQWMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQ3hCLDJCQUFjLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFDakMsMkJBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxFQUNwQywyQkFBYyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQ2xDLDJCQUFjLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFDbEMsMkJBQWMsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUNyQywyQkFBYyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQ3JDLDJCQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxF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QyxhQUFhLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzNDLGFBQWEsQ0FBQyxTQUFTLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFNUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMxQyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFM0MsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMzQyxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFMUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6QyxhQUFhLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFFMUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUMxQyxhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsdURBQXVELEVBQUUsR0FBRyxFQUFFO1lBQ2xFLFNBQVMsV0FBVyxDQUFDLElBQVksRUFBRSxRQUFnQjtnQkFDbEQsTUFBTSxDQUFDLEdBQUcsMkJBQWMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFFLENBQUM7Z0JBQzVDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDN0MsQ0FBQztZQUVELFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDL0IsV0FBVyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNuQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRS9CLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0IsV0FBVyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNuQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRS9CLFdBQVcsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDL0IsV0FBVyxDQUFDLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUNuQyxXQUFXLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBRS9CLFdBQVcsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDL0IsV0FBVyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUNuQyxXQUFXLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGlEQUFpRCxFQUFFLEdBQUcsRUFBRTtZQUM1RCxNQUFNLE1BQU0sR0FBRywyQkFBYyxDQUFDLFdBQVcsQ0FBQywrQ0FBK0MsQ0FBRSxDQUFDO1lBQzVGLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FDdEIsMkJBQWMsQ0FBQyxHQUFHLENBQ2pCLDJCQUFjLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEVBQ3JDLDJCQUFjLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxFQUNoQywyQkFBYyxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FDakMsQ0FDRixDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUMsQ0FBQyxDQUFDIn0=