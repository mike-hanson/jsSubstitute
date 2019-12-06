(function () {
    'use strict';

    function Arg() {
        var self = this;

        this.any = function (type) {
            return self.matchUsing(function (arg) {
                if (typeof type === 'string') {
                    return typeof arg === type;
                }
                else {
                    return arg instanceof type;
                }
            });
        };

        this.is = function (type, expected) {
            return self.matchUsing(function (arg) {
                var isTypeMatch = self.any(type)(arg);
                var isValueMatch = false;
                if (isTypeMatch) {
                    if (typeof expected === 'function' && typeof type !== 'function' && type !== 'function') {
                        isValueMatch = expected(arg);
                    }
                    else {
                        isValueMatch = arg === expected;
                    }
                }
                return isTypeMatch && isValueMatch;
            });
        };

        this.hasState = function (source) {
            return self.matchUsing(function (arg) {
                if (typeof arg !== 'object') {
                    return false;
                }
                for (var member in source) {
                    if (source.hasOwnProperty(member) && typeof source[member] !== 'function') {
                        if (!arg.hasOwnProperty(member) || !areEqual(source[member], arg[member])) {
                            return false;
                        }
                    }
                }
                return true;
            });
        };

        this.hasProperty = function (name, value) {
            return self.matchUsing(function (arg) {
                return typeof arg === 'object' && arg[name] !== undefined && arg[name] === value;
            });
        };

        this.matchUsing = function (fn) {
            if (typeof fn !== 'function' || fn.length !== 1) {
                throw new Error('matchUsing requires a function that accepts a single argument.');
            }
            var testResult = fn(undefined);
            if (typeof testResult !== 'boolean') {
                throw new Error('matchUsing requires a function that returns a boolean result.');
            }

            fn.isMatcher = true;

            return fn;
        };

        function areEqual(source, target) {
            var sourceType = typeof source, targetType = typeof target;

            if (sourceType === 'function') {
                return true; // ignore functions
            }

            if (sourceType !== targetType) {
                return false;
            }

            // TODO: Probably need to do more intelligent matching here
            if (source && sourceType === 'object') {
                return source.toString() === target.toString();
            }
            else {
                return source === target;
            }
        };
    }

    function PromiseSubstitute(throwErrors) {
        var self = this;
        var successHandler, errorHandler, thenCalled = false, throwOnFailure = false;

        if (throwErrors) {
            throwOnFailure = throwErrors;
        }

        this.then = function (success, error) {
            thenCalled = true;
            successHandler = success;
            errorHandler = error;
            return self;
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
            if (this.throwsErrors() && thenCalled === false) {
                throw new Error('then has not received expected call');
            }
            return thenCalled;
        };
        this.receivedThenWithOneHandler = function () {
            var result = thenCalled && typeof successHandler === 'function';
            if (this.throwsErrors() && result === false) {
                throw new Error('then has not been called with expected success handler');
            }
            return result;
        };
        this.receivedThenWithBothHandlers = function () {
            var result = thenCalled && typeof successHandler === 'function' && typeof errorHandler === 'function';
            if (this.throwsErrors() && result === false) {
                throw new Error('then has not been called with expected success and error handlers');
            }
            return result;
        };
        this.hasSuccessHandler = function () {
            var result = typeof successHandler === 'function';
            if (this.throwsErrors() && result === false) {
                throw new Error('Promise does not have expected success handler');
            }
            return result;
        };
        this.hasErrorHandler = function () {
            var result = typeof errorHandler === 'function';
            if (this.throwsErrors() && result === false) {
                throw new Error('Promise does not have expected error handler');
            }
            return result;
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

    }

    function MethodState(methodName, type) {
        var calls = [], returns = [], callsThrough;
        this.name = methodName;

        this.canCallThrough = function () {
            return typeof type == 'object' && typeof type[methodName] === 'function';
        };
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
            if (index === undefined) {
                index = calls.length - 1;
            }
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
            returns.push({
                returnValue: returnValue,
                args: args
            });
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
        this.getActualCallsString = function () {
            return getCallsString(calls, this.name);
        };
    }

    function MethodStateCollection() {
        var states = [];
        this.add = function (state) {
            states.push(state);
        };

        this.get = function (methodName) {
            for (var i = 0; i < states.length; i++) {
                var state = states[i];
                if (state && state.name === methodName) {
                    return state;
                }
            }

            throw new Error(methodName +
                ' is not being tracked by this substitute, check it exists at the time the substitute was created');
        };
    }

    function Substitute(target, throwErrors) {
        var self = this, states = new MethodStateCollection();

        this.throwsErrors = function () {
            return throwErrors;
        };

        this.received = function (methodName, expectedCallCount) {
            var state = states.get(methodName);
            var matchCallCount = true, actualCallCount = state.callCount();

            if (isNaN(expectedCallCount)) {
                expectedCallCount = 1;
                matchCallCount = false;
            }


            var result = ((matchCallCount && actualCallCount === expectedCallCount) || actualCallCount >= expectedCallCount);
            if (!result && throwErrors) {
                throw new Error(methodName + ' did not receive the expected ' + expectedCallCount +
                    ' calls, actually received ' + state.callCount() + ' calls.');
            }
            return result;
        };
        this.receivedWith = function (methodName) {
            var state = states.get(methodName);
            var actualArgs = argumentsSubset(arguments, 1);
            var result = state.hasCallWithArgs(actualArgs);
            if (!result && throwErrors) {
                throw new Error(methodName + ' did not receive a call with the expected arguments.\n' +
                    state.getActualCallsString());
            }
            return result;
        };
        this.didNotReceive = function (methodName) {
            var state = states.get(methodName);
            var callCount = state.callCount();
            var result = callCount === 0;
            if (!result && throwErrors) {
                throw new Error(methodName + ' received ' + callCount + ' unexpected calls to ' + methodName);
            }
            return result;
        };
        this.returns = function (methodName, returnValue) {
            var state = states.get(methodName);
            state.addReturn(returnValue);
        };
        this.returnsFor = function (methodName, returnValue) {
            var state = states.get(methodName);
            var actualArgs = argumentsSubset(arguments, 2);
            state.addReturn(returnValue, actualArgs);
        };
        this.returnsPromise = function (methodName, throwErrors) {
            if (!throwErrors) {
                throwErrors = this.throwsErrors();
            }

            var state = states.get(methodName);
            var promiseSubstitute = new PromiseSubstitute(throwErrors);
            state.addReturn(promiseSubstitute);
            return promiseSubstitute;
        };
        this.returnsPromiseFor = function (methodName) {
            var state = states.get(methodName);
            var actualArgs = argumentsSubset(arguments, 1);
            var promiseSubstitute = new PromiseSubstitute(this.throwsErrors());
            state.addReturn(promiseSubstitute, actualArgs);
            return promiseSubstitute;
        };
        this.callsThrough = function (methodName) {
            var state = states.get(methodName);
            if (!state.canCallThrough()) {
                throw new Error('Cannot call through as substitute was not created from an object with a method of this name');
            }
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
        this.clearCalls = function (methodName) {
            var state = states.get(methodName);
            state.clearCalls();
        };
        this.getActualCallsString = function (methodName) {
            var state = states.get(methodName);
            return state.getActualCallsString();
        };
        this.invokeArgOfLastCallWith = function (methodName, argIndex) {
            var state = states.get(methodName);
            var actualArgs = argumentsSubset(arguments, 2);
            var arg = state.getArgs()[argIndex];
            if (typeof arg === 'function') {
                arg.apply(null, actualArgs);
            }
            else {
                throw new Error('Cannot invoke argument ' + argIndex + ' of ' + methodName + ', it is not a function');
            }
        };
        this.invokeArgOfCallWith = function (methodName, callIndex, argIndex) {
            var state = states.get(methodName);
            var actualArgs = argumentsSubset(arguments, 3);
            var arg = state.getArgs(callIndex)[argIndex];
            if (typeof arg === 'function') {
                arg.apply(null, actualArgs);
            }
            else {
                throw new Error('Cannot invoke argument ' + argIndex + ' of call ' + callIndex + ' of ' + methodName +
                    ', it is not a function');
            }
        };

        function buildFunction(name) {
            return function () {
                var state = states.get(name);
                var actualArgs = argumentsSubset(arguments, 0);
                state.addCall(actualArgs);

                if (state.getCallsThrough()) {
                    return state.callThrough(actualArgs);
                }

                var returnValue = state.getReturnForArgs(actualArgs);
                if (returnValue) {
                    return returnValue;
                }
            };
        }

        function addMember(name, target) {
            var methodState = new MethodState(name, target);
            states.add(methodState);
            self[name] = buildFunction(name);
        }

        function build(target) {
            for (var member in target) {
                if (target.hasOwnProperty(member)) {
                    var memberType = typeof target[member];
                    if (memberType !== 'function') {
                        self[member] = target[member];
                    }
                    else {
                        addMember(member, target);
                    }
                }
            }
        }

        function buildFromArray(target) {
            for (var i = 0; i < target.length; i++) {
                addMember(target[i], target[i]);
            }
        }

        if (target instanceof Array) {
            buildFromArray(target);
        }
        else {
            build(target);
        }
    }

    function Factory() {
        var throwOnFailure = false;
        this.for = function (target, throwErrors) {
            if (throwErrors === undefined) {
                throwErrors = throwOnFailure;
            }
            var targetType = typeof target;
            if (isArrayOfNonStrings(target) || targetType !== 'object') {
                throw new Error('jsSubstitute.for can only create substitutes for objects or an array of method' +
                    ' names. To test a function try jsSubstitute.forFunction.');
            }

            return new Substitute(target, throwErrors);
        };
        this.forPromise = function (throwErrors) {
            if (!throwErrors) {
                throwErrors = throwOnFailure;
            }
            return new PromiseSubstitute(throwErrors);
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

        this.forFunction = function (fn, throwErrors) {
            var calls = [], name = functionName(fn), absReturnValue, returns = [];

            if (!throwErrors) {
                throwErrors = throwOnFailure;
            }

            var result = function () {
                var actualArgs = argumentsSubset(arguments, 0);
                calls.push(actualArgs);

                if (absReturnValue) {
                    return absReturnValue;
                }

                if (returns.length) {
                    var args = argumentsSubset(arguments, 0);
                    for (var i = 0; i < returns.length; i++) {
                        var obj = returns[i];
                        if (argsMatch(obj.args, args)) {
                            return obj.returns;
                        }
                    }
                }

                return fn.apply(actualArgs);
            };

            result.wasInvoked = function (expectedCalls) {
                if (!expectedCalls) {
                    expectedCalls = 1;
                }
                var wasCalled = calls.length === expectedCalls;

                if (!wasCalled && throwErrors) {
                    throw new Error(name + ' was not invoked ' + expectedCalls + ' times as expected');
                }
                return wasCalled;
            };

            result.wasInvokedWith = function () {
                var args = argumentsSubset(arguments, 0);
                var wasInvoked = hasCallWithArgs(args);
                if (!wasInvoked && throwErrors) {
                    throw new Error(name + ' was not invoked with the expected arguments.\n' +
                        getCallsString(calls, name));
                }

                return wasInvoked;
            };

            result.wasNotInvokedWith = function () {
                var args = argumentsSubset(arguments, 0)
                var wasInvoked = hasCallWithArgs(args)
                if (wasInvoked && throwErrors) {
                    throw new Error(name + ' received an unexpected a call with the specified arguments.\n' +
                        getCallsString(calls, name));
                }
                return wasInvoked === false;
            };

            result.returns = function (returnValue) {
                absReturnValue = returnValue;
            };

            result.returnsFor = function (returnValue) {
                var actualArgs = argumentsSubset(arguments, 1);
                returns.push({args: actualArgs, returns: returnValue});
            };

            function getCall(index) {
                if (index === undefined) {
                    index = calls.length - 1;
                }
                return calls[index];
            }

            result.invokeArgOfLastCallWith = function (argIndex) {
                var call = getCall();
                var actualArgs = argumentsSubset(arguments, 1);
                var arg = call[argIndex];
                if (typeof arg === 'function') {
                    arg.apply(null, actualArgs);
                }
                else {
                    throw new Error('Cannot invoke argument ' + argIndex + ' of ' + name + ', it is not a function');
                }
            };

            result.invokeArgOfCallWith = function (callIndex, argIndex) {
                var call = getCall(callIndex);
                var actualArgs = argumentsSubset(arguments, 2);
                var arg = call[argIndex];
                if (typeof arg === 'function') {
                    arg.apply(null, actualArgs);
                }
                else {
                    throw new Error('Cannot invoke argument ' + argIndex + ' of call ' + callIndex + ' of ' + name +
                        ', it is not a function');
                }
            };

            function hasCallWithArgs(args) {
                if (!calls.length) {
                    return false;
                }

                for (var i = 0; i < calls.length; i++) {
                    if (argsMatch(calls[i], args)) {
                        return true;
                    }
                }
                return false;
            }

            return result;
        };

        this.arg = new Arg();

        function isArrayOfNonStrings(target) {
            if (!(target instanceof Array)) {
                return false;
            }

            for (var i = 0; i < target.length; i++) {
                if (typeof target[i] !== 'string') {
                    return true;
                }
            }
            return false;
        }
    }

    function argumentsSubset(args, startIndex) {
        var result = [];

        if (args && args.length) {
            for (var i = startIndex; i < args.length; i++) {
                result.push(args[i]);
            }
        }

        return result;
    }

    function getCallsString(calls, name) {
        var result = '';

        if (calls.length === 0) {
            result = 'No actual calls were received';
        }
        else {
            result = 'Actual call/s :';
            for (var i = 0; i < calls.length; i++) {
                result += '\n    ' + (i + 1) + ': ' + name + ' (';
                if (calls[i].length) {
                    result += calls[i].join(', ');
                }

                result += ');';
            }
        }

        return result;
    }

    function argsMatch(source, target) {

        if (!source) {
            return false;
        }

        if (!target) {
            return false;
        }

        if (source.length) {
            for (var i = 0; i < source.length; i++) {
                var sourceArg = source[i];
                var targetArg = target[i];

                var isMatch = false;
                if (typeof targetArg === 'function' && targetArg.isMatcher) {
                    isMatch = targetArg(sourceArg);
                }
                else {
                    isMatch = targetArg === sourceArg;
                }

                if (!isMatch) {
                    return false;
                }
            }
        }

        return true;
    }

    function functionName(fn) {
        var name = fn.toString();
        name = name.substr('function '.length);
        name = name.substr(0, name.indexOf('('));

        if (!name) {
            name = 'anonymous function'
        }
        return name;
    }

    var factory = new Factory();
    if (typeof window !== 'undefined') {
        window.substitute = factory;
    }
    else if (typeof require === 'function') {
        if (typeof define === 'function') {
            define([], function () {
                return factory;
            });
        }
        else {
            module.exports = factory;
        }
    }
})();