var substitute = substitute || {};

if (typeof require === 'function') {
    substitute = require('../src/index.js');
}

describe('jsSubstitute Function Substitute', function(){
    var factory, sub, target;
    beforeEach(function(){
        factory = substitute;
        target = function(arg1, arg2){
        }
        factory.throwErrors(false);
        sub = factory.forFunction(target);
    });

    it('Should return a function', function() {
        expect(typeof sub).toBe('function');
    });

    it('Should invoke the target when the function is invoked', function() {
        var wasExecuted = false;

        factory.forFunction(function(){
            wasExecuted = true;
        })();

        expect(wasExecuted).toBeTruthy();
    });

    it('Should pass through any arguments to the function', function() {
        var arg1, arg2;

        factory.forFunction(function(a1, a2){
            arg1 = a1;
            arg2 = a2;
        })(1, 2);
    });

    it('Should define a method to query whether the function was invoked', function() {
        expect(sub.wasInvoked).toBeDefined();
        expect(typeof sub.wasInvoked).toBe('function');
    });

    it('Should define a method to query whether the function was invoked with a set of arguments', function() {
        expect(sub.wasInvokedWith).toBeDefined();
        expect(typeof sub.wasInvokedWith).toBe('function');
    });

    it('Should define a method to query whether the function was not invoked with a set of arguments', function() {
        expect(sub.wasNotInvokedWith).toBeDefined();
        expect(typeof sub.wasNotInvokedWith).toBe('function');
    });

    it('Should define a method to substitute return value of function regardless of arguments', function() {
        expect(sub.returns).toBeDefined();
        expect(typeof sub.returns).toBe('function');
    });

    it('Should expect an argument for the return value', function() {
        expect(sub.returns.length).toBe(1);
    });

    it('Should define a method to return a value for a set of arguments', function() {
        expect(sub.returnsFor).toBeDefined();
        expect(typeof sub.returnsFor).toBe('function');
    });

    it('Should expect at least one argument for the return value', function() {
        expect(sub.returnsFor.length).toBe(1);
    });

    it('Should report target was not invoked correctly', function() {
        expect(sub.wasInvoked()).toBe(false);
    });

    it('Should report target was invoked once correctly', function() {
        sub();
        expect(sub.wasInvoked()).toBe(true);
    });

    it('Should report target was invoked multiple times correctly', function() {
        sub();
        sub();
        expect(sub.wasInvoked(2)).toBe(true);
    });

    it('Should report target was invoked with arguments correctly', function() {
        sub(1, 2);
        expect(sub.wasInvokedWith(1, 2)).toBe(true);
    });

    it('Should report target was not invoked with expected arguments correctly', function() {
        sub(1, 2);
        expect(sub.wasInvokedWith(1, 3)).toBe(false);
    });

    it('Should report target was not invoked with unexpected arguments correctly', function() {
        expect(sub.wasNotInvokedWith(1, 3)).toBe(true);
    });

    it('Should report target was invoked with unexpected arguments correctly', function() {
        sub(1, 2);
        expect(sub.wasNotInvokedWith(1, 2)).toBe(false);
    });

    it('Should return substituted value correctly', function() {
        sub.returns(99);
        expect(sub()).toBe(99);
    });

    it('Should return substituted value for arguments correctly', function() {
        sub.returnsFor(99, 1, 2);
        expect(sub(1, 2)).toBe(99);
    });

    it('Should return actual function return if not configured otherwise', function() {
        sub = substitute.forFunction(function(){
            return 5;
        });
        expect(sub()).toBe(5);
    });

    it('Should return actual function return if configured with non matching args', function() {
        sub = substitute.forFunction(function(){
            return 5;
        });
        sub.returnsFor(1, 3)
        expect(sub(2, 3)).toBe(5);
    });
})
