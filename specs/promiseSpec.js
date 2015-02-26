var substitute = substitute || {};

if (typeof require === 'function') {
	substitute = require('../src/index.js');
}

describe('PromiseSubstitute', function () {
    var promise, sub;
    beforeEach(function(){
        var target = {
            string: '',
            number: 1,
            method: function(){
                return 'calledThrough';
            },
            obj: {},
            array: ['one', 'two', 'three']
        };
        sub = substitute.for(target);
        sub.returnsPromise('method');
        promise = sub.method();
    });

    it('Should define then method expected on a promise', function(){
        expect(promise.then).toBeDefined();
        expect(typeof promise.then).toBe('function');
    });

    it('Should define arguments for success and error handlers', function(){
        expect(promise.then.length).toBe(2);
    });

    it('Should define a method to initiate successful resolution', function(){
        expect(promise.success).toBeDefined();
        expect(typeof promise.success).toBe('function');
    });

    it('Should support passing data on succesful resolution', function(){
        expect(promise.success.length).toBe(1);
    });

    it('Should define a method to initiate failed resolution', function(){
        expect(promise.error).toBeDefined();
        expect(typeof promise.error).toBe('function');
    });

    it('Should support passing rejection data on failed resolution', function(){
        expect(promise.error.length).toBe(1);
    });

    it('Should define a method to assert that then was called', function(){
        expect(promise.receivedThen).toBeDefined();
        expect(typeof promise.receivedThen).toBe('function');
    });

    it('Should define a method to assert that a success handler was provided to then', function(){
        expect(promise.hasSuccessHandler).toBeDefined();
        expect(typeof promise.hasSuccessHandler).toBe('function');
    });

    it('Should define a method to assert that error handler was provided to then', function(){
        expect(promise.hasErrorHandler).toBeDefined();
        expect(typeof promise.hasErrorHandler).toBe('function');
    });

    it('Should report that then was called', function(){
        promise.then(function(){
        }, function(){
        });
        expect(promise.receivedThen()).toBeTruthy();
    });

    it('Should report that then was not called', function(){
        expect(promise.receivedThen()).toBeFalsy();
    });

    it('Should report success handler has been provided', function(){
        promise.then(function(){
        });
        expect(promise.hasSuccessHandler()).toBeTruthy();
    });

    it('Should report success handler has not been provided', function(){
        expect(promise.hasSuccessHandler()).toBeFalsy();
    });

    it('Should report error handler has been provided', function(){
        promise.then(function(){
        }, function(){
        });
        expect(promise.hasErrorHandler()).toBeTruthy();
    });

    it('Should report success handler has not been provided', function(){
        expect(promise.hasErrorHandler()).toBeFalsy();
    });
});