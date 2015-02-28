var substitute = substitute || {};

if (typeof require === 'function') {
	substitute = require('../src/index.js');
}

describe('jsSubstitute Substitute', function () {
    var factory, sub, target;
    beforeEach(function(){
        factory = substitute;
        target = {
            string: '',
            number: 1,
            method: function(){
                return 'calledThrough';
            },
            method2: function(){
                return 'calledThrough';
            },
            obj: {},
            array: ['one', 'two', 'three']
        };
        factory.throwErrors(false);
        sub = factory.for(target);
    });

    describe('Target Interface', function(){
        it('Should define string property on substitute', function(){
            expect(sub.string).toBeDefined();
            expect(sub.string).toBe(target.string);
        });

        it('Should define number property on substitute', function(){
            expect(sub.number).toBeDefined();
            expect(sub.number).toBe(target.number);
        });

        it('Should define object property on substitute', function(){
            expect(sub.obj).toBeDefined();
            expect(sub.obj).toEqual(target.obj);
        });

        it('Should define array property on substitute', function(){
            expect(sub.array).toBeDefined();
            expect(sub.array).toEqual(target.array);
        });

        it('Should define method on substitute', function(){
            expect(sub.method).toBeDefined();
            expect(typeof sub.method).toBe('function');
        });

        it('Should define method2 on substitute', function(){
            expect(sub.method2).toBeDefined();
            expect(typeof sub.method2).toBe('function');
        });
    });

    describe('Received calls', function(){

        it('Should define received method', function(){
            expect(sub.received).toBeDefined();
            expect(typeof sub.received).toBe('function');
        });

        it('Should support specifying the method name and number of expected calls', function(){
            expect(sub.received.length).toBe(2);
        });
        it('Should report method was never called', function(){
            expect(sub.received('method')).toBe(false);
        });
        it('Should report method was called at least once', function(){
            sub.method();
            expect(sub.received('method')).toBe(true);
        });

        it('Should report method was called a specific number of times', function(){
            sub.method();
            sub.method();
            expect(sub.received('method', 2)).toBe(true);
        });

        it('Should report method was not called a specific number of times', function(){
            sub.method();
            expect(sub.received('method', 2)).toBe(false);
        });

        it('Shold throw an error if method not being tracked', function(){
            expect(function(){
                sub.received('badMethod');
            }).toThrow(new Error('badMethod is not being tracked by this substitute, check it exists at the time the substitute was created'));
        });
    });

    describe('Received a call with arguments', function(){
        it('Should define receivedWith method', function(){
            expect(sub.receivedWith).toBeDefined();
            expect(typeof sub.receivedWith).toBe('function');
        });
        it('Should support specifying the method name', function(){
            expect(sub.receivedWith.length).toBe(1);
        });
        it('Should throw an error if method not being tracked', function(){
            expect(function(){
                sub.receivedWith('badMethod');
            }).toThrow(new Error('badMethod is not being tracked by this substitute, check it exists at the time the substitute was created'));
        });
        it('Should report method was never called with specified argument values', function(){
            expect(sub.receivedWith('method', 1, 2)).toBe(false);
        });
        it('Should report method was called at least once with specified argument values', function(){
            sub.method(1, 2);
            expect(sub.receivedWith('method', 1, 2)).toBe(true);
        });
        it('Should report method was called at least once with specified arguments using a comparer function', function(){
            sub.method(1, 2);
            expect(sub.receivedWith('method', 1, function(arg){
                return arg === 2;
            })).toBe(true);
        });
    });

    describe('Returns on call', function(){

        it('Should define returns method', function(){
            expect(sub.returns).toBeDefined();
            expect(typeof sub.returns).toBe('function');
        });

        it('Should support specifying method name and return value', function(){
            expect(sub.returns.length).toBe(2);
        });
        it('Should return string specified on call', function(){
            sub.returns('method', 'string');
            expect(sub.method()).toBe('string');
        });

        it('Should return number specified on call', function(){
            sub.returns('method', 1);
            expect(sub.method()).toBe(1);
        });

        it('Should return object specified on call', function(){
            var obj = {};
            sub.returns('method', obj);
            expect(sub.method()).toBe(obj);
        });

        it('Should return function specified on call', function(){
            var fn = function(){
            };
            sub.returns('method', fn);
            expect(sub.method()).toBe(fn);
        });

        it('Should return last value specified', function(){
            sub.returns('method', 'string');
            sub.returns('method', 'string2');
            expect(sub.method()).toBe('string2');
        });
    });

    describe('Returns on call with args', function(){

        it('Should define returns method', function(){
            expect(sub.returnsFor).toBeDefined();
            expect(typeof sub.returnsFor).toBe('function');
        });

        it('Should support specifying method name and return value', function(){
            expect(sub.returnsFor.length).toBe(2);
        });
        it('Should return string specified on call', function(){
            sub.returnsFor('method', 'string', 1, 5);
            expect(sub.method(5)).toBe('string');
        });

        it('Should return number specified on call', function(){
            sub.returnsFor('method', 1, 5);
            expect(sub.method(5)).toBe(1);
        });

        it('Should return object specified on call', function(){
            var obj = {};
            sub.returnsFor('method', obj, 5);
            expect(sub.method(5)).toBe(obj);
        });

        it('Should return function specified on call', function(){
            var fn = function(){
            };
            sub.returnsFor('method', fn, 5);
            expect(sub.method(5)).toBe(fn);
        });

        it('Should return last value specified', function(){
            sub.returnsFor('method', 'string', 5);
            sub.returnsFor('method', 'string2', 5);
            expect(sub.method(5)).toBe('string2');
        });
    });

    describe('Call through', function(){
        it('Should define callsThrough method', function(){
            expect(sub.callsThrough).toBeDefined();
            expect(typeof sub.callsThrough).toBe('function');
        });

        it('Should support specifying method name', function(){
            expect(sub.callsThrough.length).toBe(1);
        });
        it('Should call through to underlying method when specified', function(){
            sub.callsThrough('method');
            expect(sub.method()).toBe('calledThrough');
        });

        it('Should ignore returns config if call through enabled', function(){
            sub.returns('method', 'something to return');
            sub.callsThrough('method');
            expect(sub.method()).not.toBe('something to return');
        });
        it('Should ignore returns promise if call through enabled', function(){
            sub.returnsPromise('method');
            sub.callsThrough('method');
            expect(sub.method().constructor.name).not.toBe('PromiseSubstitute');
        });
    });

    describe('Returns promise on method call', function(){
        it('Should define returnsPromise method', function(){
            expect(sub.returnsPromise).toBeDefined();
            expect(typeof sub.returnsPromise).toBe('function');
        });

        it('Should support specifying method name', function(){
            expect(sub.returnsPromise.length).toBe(1);
        });

        it('Should return a mock promise on method call', function(){
            sub.returnsPromise('method');

            // NB: this will fail if tests are run in IE<10
            expect(sub.method().constructor.name).toBe('PromiseSubstitute');
        });
    });

    describe('Argument retrieval', function(){
        it('Should define method to retrieve arguments for a call', function(){
            expect(sub.argsForCall).toBeDefined();
            expect(typeof sub.argsForCall).toBe('function');
        });

        it('Should support specifying method name and call index', function(){
            expect(sub.argsForCall.length).toBe(2);
        });

        it('Should throw error if no calls received for method', function(){
            expect(function(){
                sub.argsForCall('method', 0);
            }).toThrow(new Error('No calls received for method'));
        });

        it('Should return array of arguments to specified call', function(){
            sub.method(1, 'string');
            expect(sub.argsForCall('method', 0) instanceof Array).toBeTruthy();
        });

        it('Should return correct number of arguments to a specified call', function(){
            sub.method(1, 'string');
            expect(sub.argsForCall('method', 0).length).toBe(2);
        });

        it('Should return correct arguments to a specified call', function(){
            sub.method(1, 'string');
            var argsForCall = sub.argsForCall('method', 0);
            expect(argsForCall[0]).toBe(1);
            expect(argsForCall[1]).toBe('string');
        });

        it('Should return arguments for last call if no index specified', function(){
            sub.method(1, 'string');
            sub.method(2, 'string2');
            var argsForCall = sub.argsForCall('method');
            expect(argsForCall[0]).toBe(2);
            expect(argsForCall[1]).toBe('string2');
        });
    });

    describe('Assertions throwing errors', function(){

        beforeEach(function(){
            factory.throwErrors(true);
            sub = factory.for(target);
        });

        afterEach(function(){
            factory.throwErrors(false);
        });

        it('Should define method to query whether the substitute throws error on assertion failure', function(){
            expect(sub.throwsErrors).toBeDefined();
            expect(typeof sub.throwsErrors).toBe('function');
        });

        it('Should throw error on received', function(){
            expect(function(){
                sub.received('method');
            }).toThrow(new Error('method did not receive the expected 1 calls, actually received 0 calls.'));
        });

        it('Should throw error on receivedWith', function(){
            expect(function(){
                sub.receivedWith('method', 1, 2);
            }).toThrow();
        });
    });

    describe('Report Calls', function(){
        beforeEach(function(){
            sub = factory.for(target, false);
        });

        it('Should define a method to return a report of actual calls for a method', function(){
            expect(sub.getActualCallsString).toBeDefined();
            expect(typeof sub.getActualCallsString).toBe('function');
        });

        it('Should report no calls correctly', function(){
            var report = sub.getActualCallsString('method');
            expect(report).toBe('No actual calls were received');
        });

        it('Should start report correctly when calls exist', function(){
            sub.method();
            var report = sub.getActualCallsString('method');
            expect(report.substr(0, 15)).toBe('Actual call/s :');
        });

        it('Should report a single call without arguments correctly', function(){
            sub.method2();
            var report = sub.getActualCallsString('method2');
            expect(report.toString().indexOf('\n    1: method2 ();')).toBeGreaterThan(-1);
        });

        it('Should report a single call with single single argument correctly', function(){
            sub.method2(1);
            var report = sub.getActualCallsString('method2');
            expect(report.toString().indexOf('\n    1: method2 (1);')).toBeGreaterThan(-1);
        });

        it('Should report a single call with multiple simple arguments correctly', function(){
            sub.method2(1, 'string');
            var report = sub.getActualCallsString('method2');
            expect(report.toString().indexOf('\n    1: method2 (1, string);')).toBeGreaterThan(-1);
        });

        it('Should report multiple calls with mixed simple arguments correctly', function(){
            sub.method2(1);
            sub.method2(1, 'string');
            var report = sub.getActualCallsString('method2');
            expect(report.toString().indexOf('\n    1: method2 (1);')).toBeGreaterThan(-1);
            expect(report.toString().indexOf('\n    2: method2 (1, string);')).toBeGreaterThan(-1);
        });

        it('Should report call with object argument correctly', function(){
            sub.method2(1, {field1: 1, field2: 'string'});
            var report = sub.getActualCallsString('method2');
            console.log(report);
            expect(report.toString().indexOf('\n    1: method2 (1, [object Object]);')).toBeGreaterThan(-1);
        });
    });

    describe('Invoke Arguments Of Last Call', function(){
        beforeEach(function(){
            sub = factory.for(target, false);
        });

        it('Should define a method to invoke a function argument with arguments', function(){
            expect(sub.invokeArgOfLastCallWith).toBeDefined();
            expect(typeof sub.invokeArgOfLastCallWith).toBe('function');
        });

        it('Should expect at least the method name and argument index', function(){
            expect(sub.invokeArgOfLastCallWith.length).toBe(2);
        });

        it('Should call valid function argument', function(){
            var wasCalled = false;
            sub.method(1, function(){
                wasCalled = true;
            });
            sub.invokeArgOfLastCallWith('method', 1);
            expect(wasCalled).toBeTruthy();
        });

        it('Should throw an error if specified argument is not a function', function()
        {
            sub.method(1, function(){
            });
            expect(function(){
            sub.invokeArgOfLastCallWith('method', 0);
            }).toThrow(new Error('Cannot invoke argument 0 of method, it is not a function'));
        });

        it('Should pass specified arguments to function', function(){
            var arg1, arg2;
            sub.method(1, function(a, b){
                arg1 = a;
                arg2 = b;
            });
            sub.invokeArgOfLastCallWith('method', 1, 1, 'string');
            expect(arg1).toBe(1);
            expect(arg2).toBe('string');
        });
    });

    describe('Invoke Arguments Of Specific Call', function(){
        
        beforeEach(function(){
            sub = factory.for(target, false);
        });

        it('Should define a method to invoke a function argument with arguments', function(){
            expect(sub.invokeArgOfCallWith).toBeDefined();
            expect(typeof sub.invokeArgOfCallWith).toBe('function');
        });

        it('Should expect at least the method name, call index and argument index', function(){
            expect(sub.invokeArgOfCallWith.length).toBe(3);
        });

        it('Should call valid function argument', function(){
            var calledBy;
            sub.method(1, function(){
                calledBy = 1;
            });
            sub.method(2, function(){
                calledBy = 2;
            });
            sub.invokeArgOfCallWith('method', 1, 1);
            expect(calledBy).toBe(2);
        });

        it('Should throw an error if specified argument is not a function', function()
        {
            sub.method(1, function(){
            });
            sub.method(2, function(){
            });
            expect(function(){
                sub.invokeArgOfCallWith('method', 1, 0);
            }).toThrow(new Error('Cannot invoke argument 0 of call 1 of method, it is not a function'));
        });

        it('Should pass specified arguments to function', function(){
            var arg1, arg2;
            sub.method(1, function(a, b){
            });
            sub.method(2, function(a, b){
                arg1 = a;
                arg2 = b;
            });
            sub.invokeArgOfCallWith('method', 1, 1, 1, 'string');
            expect(arg1).toBe(1);
            expect(arg2).toBe('string');
        });
    });

    describe('Substitute from Array of Method Names', function (){
	    var methodNames = ['one', 'two', 'three'];
    	beforeEach(function (){
		    sub = substitute.for(methodNames);
    	});

		it('Should have one method', function(){
			expect(sub.one).toBeDefined();
			expect(typeof sub.one).toBe('function');
		});

		it('Should have two method', function () {
			expect(sub.two).toBeDefined();
			expect(typeof sub.two).toBe('function');
		});

		it('Should have three method', function () {
			expect(sub.three).toBeDefined();
			expect(typeof sub.three).toBe('function');
		});

	    it('Should throw an error if callsThrough is attempted', function(){
		    expect(function(){
			    sub.callsThrough('one');
		    }).toThrow(new Error('Cannot call through as substitute was not created from an object with a method of this name'));
	    });
	});
});