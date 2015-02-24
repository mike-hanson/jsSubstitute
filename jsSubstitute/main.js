(function () {
    'use strict';
    
    function Arg() {
        function areEqual(source, target) {
            var sourceType = typeof source, targetType = typeof target;
            
            if (sourceType === 'function') {
                return true; // ignore functions
            }
            
            if (sourceType !== targetType) {
                return false;
            }
            
            // TODO: Probably need to do more intelligent matching here
            return source.toString() === target.toString();
        }        ;
        this.any = function (type) {
            return function (arg) {
                return arg instanceof type || typeof arg === type;
            };
        };
        this.is = function (type, expected) {
            return function (arg) {
                var isInstanceOf;
                try {
                    isInstanceOf = arg instanceof type;
                }
                catch (error) {
                    isInstanceOf = false;
                }
                
                var isTypeOf = typeof arg === type;
                
                return (isInstanceOf || isTypeOf) && arg === expected;
            };
        };
        this.hasState = function (source) {
            return function (arg) {
                for (var member in source) {
                    if (source.hasOwnProperty(member) && typeof source[member] !== 'function') {
                        if (!arg.hasOwnProperty(member) || !areEqual(source[member], arg[member])) {
                            return false;
                        }
                    }
                }
                return true;
            };
        };
    }
    
    function PromiseSubstitute() {
        var successHandler, errorHandler, thenCalled = false;
        this.then = function (success, error) {
            thenCalled = true;
            successHandler = success;
            errorHandler = error;
        };
        this.success = function (data) {
            if (successHandler) {
                successHandler(data);
            }
        };
        this.error = function (error) {
            if (errorHandler) {
                errorHandler(error);
            }
        };
        this.receivedThen = function () {
            return thenCalled;
        };
        this.receivedThenWithOneHandler = function () {
            return this.receivedThen() && this.hasSuccessHandler();
        };
        this.receivedThenWithBothHandlers = function () {
            return this.receivedThen() && this.hasSuccessHandler() && this.hasErrorHandler();
        };
        this.hasSuccessHandler = function () {
            return successHandler && typeof successHandler === 'function';
        };
        this.hasErrorHandler = function () {
            return errorHandler && typeof errorHandler === 'function';
        };
    }
    
    function MethodState(methodName, type) {
        var calls = [], returns = [], callsThrough;
        this.name = methodName;
        this.callThrough = function (args) {
            return type[methodName].apply(type, args);
        };
        this.addCall = function (args) {
            calls.push(args);
        };
        this.clearCalls = function () {
            calls = [];
        };
        this.callCount = function () {
            return calls.length;
        };
        this.getArgs = function (index) {
            return calls[index];
        };
        this.hasCallWithArgs = function (args) {
            for (var i = 0; i < calls.length; i++) {
                if (argsMatch(calls[i], args)) {
                    return true;
                }
            }
            return false;
        };
        this.addReturn = function (returnValue, args) {
            returns.push({ returnValue: returnValue, args: args });
        };
        this.getReturnForArgs = function (args) {
            if (returns.length === 0) {
                return undefined;
            }
            
            if (args && args.length > 0) {
                for (var i = returns.length - 1; i >= 0; i--) {
                    if (argsMatch(args, returns[i].args)) {
                        return returns[i].returnValue;
                    }
                }
            }
            
            return returns[returns.length - 1].returnValue;
        };
        this.setCallsThrough = function () {
            callsThrough = true;
        };
        this.getCallsThrough = function () {
            return callsThrough;
        };

        function argsMatch(source, target) {
            if (!source) {
                return false;
            }
            
            if (!target) {
                return false;
            }
            
            for (var i = 1; i < source.length; i++) {
                var sourceArg = source[i];
                var targetArg = target[i + 1]; //first argument is method name from substitute
                var isMatch = false;
                if (typeof targetArg === 'function') {
                    isMatch = targetArg(sourceArg);
                }
                else {
                    isMatch = targetArg === sourceArg;
                }
                
                if (!isMatch) {
                    return false;
                }
            }
            
            return true;
        }
    }
    
    function MethodStateCollection() {
        var states = [];
        this.add = function (state) {
            states.push(state);
        };
        
        this.get = function (methodName) {
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                if (state && state.name == methodName) {
                    return state;
                }
            }
            
            throw new Error(methodName + ' is not being tracked by this substitute, check it exists at the time the substitute was created');
        };
    }
    
    function Substitute(target, throwErrors) {
        var self = this, states = new MethodStateCollection();
        
        this.throwsErrors = function () {
            return throwErrors;
        };
        
        this.received = function (methodName, expectedCallCount) {
            var state = states.get(methodName);
            
            if (isNaN(expectedCallCount)) {
                expectedCallCount = 1;
            }
            
            var result = state.callCount() === expectedCallCount;
            if (!result && throwErrors) {
                throw new Error(methodName + ' did not receive the expected ' + expectedCallCount + ' calls.');
            }
            return result;
        };
        this.receivedWith = function (methodName) {
            var state = states.get(methodName);
            
            var result = state.hasCallWithArgs(arguments);
            if (!result && throwErrors) {
                throw new Error(methodName + ' did not receive a call with the expected arguments');
            }
            return result;
        };
        this.returns = function (methodName, returnValue) {
            var state = states.get(methodName);
            state.addReturn(returnValue);
        };
        this.returnsFor = function (methodName, returnValue) {
            var state = states.get(methodName);
            state.addReturn(returnValue, arguments);
        };
        this.returnsPromise = function (methodName) {
            var state = states.get(methodName);
            var promiseSubstitute = new PromiseSubstitute();
            state.addReturn(promiseSubstitute);
            return promiseSubstitute;
        };
        this.callsThrough = function (methodName) {
            var state = states.get(methodName);
            state.setCallsThrough();
        };
        this.argsForCall = function (methodName, callIndex) {
            var state = states.get(methodName);
            var callCount = state.callCount();
            if (callCount === 0) {
                throw new Error('No calls received for ' + methodName);
            }
            if (callIndex === undefined) {
                callIndex = callCount - 1;
            }
            
            var args = state.getArgs(callIndex);
            var result = [];
            for (var i = 0; i < args.length; i++) {
                result.push(args[i]);
            }
            return result;
        };
        
        function buildFunction(name) {
            return function () {
                var state = states.get(name);
                state.addCall(arguments);
                
                if (state.getCallsThrough()) {
                    return state.callThrough(arguments);
                }
                
                var returnValue = state.getReturnForArgs(arguments);
                if (returnValue) {
                    return returnValue;
                }
            };
        }
        
        function build(targetType) {
            for (var member in targetType) {
                if (targetType.hasOwnProperty(member)) {
                    var memberType = typeof targetType[member];
                    if (memberType !== 'function') {
                        self[member] = targetType[member];
                    }
                    else {
                        var methodState = new MethodState(member, targetType);
                        states.add(methodState);
                        self[member] = buildFunction(member);
                    }
                }
            }
        }
        
        build(target);
    }
    
    function Factory() {
        var throwOnFailure = false;
        this.for = function (target, throwErrors) {
            if (throwErrors === undefined) {
                throwErrors = throwOnFailure;
            }
            var targetType = typeof target;
            if (target instanceof Array || (targetType !== 'function' && targetType !== 'object')) {
                throw new Error('jsSubstitute can only create substitutes for objects or functions');
            }
            
            return new Substitute(target, throwErrors);
        };
        this.forPromise = function () {
            return new PromiseSubstitute();
        };
        this.throwErrors = function (throwErrors) {
            if (throwErrors === undefined) {
                throwErrors = true;
            }
            throwOnFailure = throwErrors;
        };
        this.throwsErrors = function () {
            return throwOnFailure;
        };
        this.arg = new Arg();
    }
    
    if (window) {
        window.substitute = new Factory();
    }
    else if (require && typeof require === 'function') {
        if (define && typeof define === 'function') {
            define([], function () {
                return new Factory();
            });
        }
        else {
            module.exports = new Factory();
        }
    }
})();