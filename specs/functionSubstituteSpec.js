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
        sub.returnsFor(99, 1, 3)
        expect(sub(2, 3)).toBe(5);
    });

    describe('Invoke Arguments Of Last Call', function(){

        it('Should define a method to invoke a function argument with arguments', function(){
            expect(sub.invokeArgOfLastCallWith).toBeDefined();
            expect(typeof sub.invokeArgOfLastCallWith).toBe('function');
        });

        it('Should expect argument index', function(){
            expect(sub.invokeArgOfLastCallWith.length).toBe(1);
        });

        it('Should call valid function argument', function(){
            var wasCalled = false;
            sub(1, function(){
                wasCalled = true;
            });
            sub.invokeArgOfLastCallWith(1);
            expect(wasCalled).toBeTruthy();
        });

        it('Should throw an error if specified argument is not a function', function()
        {
            sub(1, function(){
            });
            expect(function(){
                sub.invokeArgOfLastCallWith(0);
            }).toThrow(new Error('Cannot invoke argument 0 of anonymous function, it is not a function'));
        });

        it('Should pass specified arguments to function', function(){
            var arg1, arg2;
            sub(1, function(a, b){
                arg1 = a;
                arg2 = b;
            });
            sub.invokeArgOfLastCallWith(1, 1, 'string');
            expect(arg1).toBe(1);
            expect(arg2).toBe('string');
        });
    });

    describe('Invoke Arguments Of Specific Call', function(){

        it('Should define a method to invoke a function argument with arguments', function(){
            expect(sub.invokeArgOfCallWith).toBeDefined();
            expect(typeof sub.invokeArgOfCallWith).toBe('function');
        });

        it('Should expect call index and argument index', function(){
            expect(sub.invokeArgOfCallWith.length).toBe(2);
        });

        it('Should call argument of first call when requested after multiple calls', function(){
            var calledBy;
            sub(1, function(){
                calledBy = 1;
            });
            sub(2, function(){
                calledBy = 2;
            });
            sub.invokeArgOfCallWith(0, 1);
            expect(calledBy).toBe(1);
        });

        it('Should call argument of second call when requested after multiple calls', function(){
            var calledBy;
            sub(1, function(){
                calledBy = 1;
            });
            sub(2, function(){
                calledBy = 2;
            });;
            sub(3, function(){
                calledBy = 3;
            });
            sub.invokeArgOfCallWith( 1, 1);
            expect(calledBy).toBe(2);
        });

        it('Should throw an error if specified argument is not a function', function()
        {
            sub(1, function(){
            });
            sub(2, function(){
            });
            expect(function(){
                sub.invokeArgOfCallWith( 1, 0);
            }).toThrow(new Error('Cannot invoke argument 0 of call 1 of anonymous function, it is not a function'));
        });

        it('Should pass specified arguments to function', function(){
            var arg1, arg2;
            sub(1, function(a, b){
            });
            sub(2, function(a, b){
                arg1 = a;
                arg2 = b;
            });
            sub.invokeArgOfCallWith( 1, 1, 1, 'string');
            expect(arg1).toBe(1);
            expect(arg2).toBe('string');
        });
    });
})
