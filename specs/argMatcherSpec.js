var substitute = substitute || {};

if(typeof require === 'function') {
    substitute = require('../src/index.js');
}

describe('Arg', function() {
    var arg;

    beforeEach(function() {
        arg = substitute.arg;
    });

    it('Should be defined as property of factory', function() {
        expect(substitute.arg).toBeDefined();
        expect(substitute.arg.constructor.name).toBe('Arg');
    });

    describe('any - type assertion', function() {
        it('Should be defined', function() {
            expect(arg.any).toBeDefined();
            expect(typeof arg.any).toBe('function');
        });

        it('Should return valid assertion function', function() {
            assertReturnsValidAssertionFunction(arg.any(Function));
        });

        it('Should pass valid function', function() {
            expect(arg.any(Function)(function() {
            })).toBeTruthy();
        });

        it('Should pass valid object', function() {
            expect(arg.any(Object)({})).toBeTruthy();
        });

        it('Should pass valid array', function() {
            expect(arg.any(Array)([])).toBeTruthy();
        });

        it('Should pass valid custom type', function() {
            function Ctor() {
            }

            expect(arg.any(Ctor)(new Ctor())).toBeTruthy();
        });

        it('Should fail invalid argument', function() {
            expect(arg.any(Function)('string')).toBeFalsy();
        });
    });

    describe('is - type and value assertion', function() {
        it('Should be defined', function() {
            expect(arg.is).toBeDefined();
            expect(typeof arg.is).toBe('function');
        });

        it('Should return valid assertion function', function() {
            assertReturnsValidAssertionFunction(arg.is('string', 'string'));
        });

        it('Should pass valid string assertion', function() {
            expect(arg.is('string', 'valid')('valid')).toBeTruthy();
        });

        it('Should pass valid number assertions', function() {
            expect(arg.is('number', 1)(1)).toBeTruthy();
            expect(arg.is('number', 1.5)(1.5)).toBeTruthy();
        });

        it('Should pass valid object assertion', function() {
            var expected = {};
            expect(arg.is(Object, expected)(expected)).toBeTruthy();
        });

        it('Should pass valid array assertion', function() {
            var expected = [];
            expect(arg.is(Array, expected)(expected)).toBeTruthy();
        });

        it('Should pass valid function assertion', function() {
            var expected = function() {
            };
            expect(arg.is(Function, expected)(expected)).toBeTruthy();
        });

        it('Should fail invalid string assertions', function() {
            expect(arg.is('string', '1')(1)).toBeFalsy();
            expect(arg.is('string', 'string2')('string3')).toBeFalsy();
        });

        it('Should fail invalid number assertions', function() {
            expect(arg.is('number', 1)('1')).toBeFalsy();
            expect(arg.is('number', 1)(2)).toBeFalsy();
        });

        it('Should pass valid matcher function assertion', function() {
            expect(arg.is('string', function(arg) {
                return arg === 'valid';
            })('valid')).toBeTruthy();
        });

        it('Should fail invalid matcher function assertion', function() {
            expect(arg.is('string', function(arg) {
                return arg === 'valid';
            })('invalid')).toBeFalsy();
        });
    });

    describe('hasState - field name and value matching', function() {
        it('Should be defined', function() {
            expect(arg.hasState).toBeDefined();
            expect(typeof arg.hasState).toBe('function');
        });

        it('Should return valid assertion function', function() {
            assertReturnsValidAssertionFunction(arg.hasState({}));
        });

        it('Should pass valid assertions', function() {
            var now = new Date();
            expect(function(){return arg.hasState({number: 1, string: 'string'})({number: 1, string: 'string'})}).toBeTruthy();
            expect(function(){arg.hasState({number: 1, string: 'string', date: now})({
                number: 1,
                string: 'string',
                date: now
            })}).toBeTruthy();
            expect(function(){arg.hasState({number: 1, string: 'string', array: ['one', 'two', 'three']})({
                number: 1,
                string: 'string',
                array: ['one', 'two', 'three']
            })}).toBeTruthy();
            expect(function(){arg.hasState({
                number: 1,
                string: 'string',
                obj: {one: 'one', two: 'two', three: 'three'}
            })({number: 1, string: 'string', obj: {one: 'one', two: 'two', three: 'three'}})}).toBeTruthy();
        });
    });

    describe('matchUsing - match using a custom function', function(){
        it('Should define a method to match arguments using a function', function() {
            expect(arg.matchUsing).toBeDefined();
            expect(typeof arg.matchUsing).toBe('function');
        });

        it('Should throw an error if the argument is not a function', function() {
            expect(function(){ arg.matchUsing({})}).toThrowError('matchUsing requires a function that accepts a single argument.')
        });

        it('Should throw an error if the custom function does not expect a single argument', function() {
            expect(function(){ arg.matchUsing(function(){})}).toThrowError('matchUsing requires a function that accepts a single argument.')
        });

        it('Should throw an error if the custom function does not return a boolean result', function() {
            expect(function(){ arg.matchUsing(function(a){})}).toThrowError('matchUsing requires a function that' +
                                                                            ' returns a boolean result.')
        });

        it('Should add a flag to the function indicating it is a matcher', function() {
            var fn = function(arg){return arg !== undefined};
            arg.matchUsing(fn);
            expect(fn.isMatcher).toBeDefined();

        });

        it('Should return original function', function() {
            var fn = function(arg){return arg !== undefined};
            expect(arg.matchUsing(fn)).toBe(fn);
        });
    });

    function assertReturnsValidAssertionFunction(target) {
        expect(typeof target).toBe('function');
        expect(target.length).toBe(1);
    };
});