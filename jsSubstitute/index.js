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
            if (source && sourceType === 'object') {
                return source.toString() === target.toString();
            }
            else {
                return source === target;
            }
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
        this.hasProperty = function (name, value) {
            return function (arg) {
                return typeof arg === 'object' && arg[name] !== undefined && arg[name] === value;
            }
        }
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
        this.addCall = function (args){
            var actualArgs = [];
            if(args.length){
                for(var i = 0; i < args.length; i++){
                    actualArgs.push(args[i]);
                }
            }
            calls.push(actualArgs);
        };
        this.clearCalls = function () {
            calls = [];
        };
        this.callCount = function () {
            return calls.length;
        };
        this.getArgs = function (index) {
            if(!index){
                index = calls.length - 1;
            }
            return calls[index];
        };
        
        function argsMatch(source, target) {
            if (!source) {
                return false;
            }
            
            if (!target) {
                return false;
            }
            
            for (var i = 0; i < source.length; i++) {
                var sourceArg = source[i];
                var targetArg = target[i + 1]; // first argument is name of method
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
        this.getActualCallsString = function () {
            var result = '';
            
            if (calls.length === 0) {
                result = 'No actual calls were received';
            }
            else {
                result = 'Actual call/s :';
                for(var i = 0; i < calls.length; i++){
                    result += '\n    ' + (i + 1) + ': ' + this.name + ' (';
                    if(calls[i].length){
                        result += calls[i].join(', ');
                    }

                    result += ');';
                }
            }
            
            return result;
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
                if (state && state.name === methodName) {
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
                throw new Error(methodName + ' did not receive the expected ' + expectedCallCount + ' calls, actually received ' + state.callCount() + ' calls.');
            }
            return result;
        };
        this.receivedWith = function (methodName) {
            var state = states.get(methodName);
            
            var result = state.hasCallWithArgs(arguments);
            if (!result && throwErrors) {
                throw new Error(methodName + ' did not receive a call with the expected arguments.\n' + state.getActualCallsString());
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
        this.clearCalls = function(methodName){
            var state = states.get(methodName);
            state.clearCalls();
        };
        this.getActualCallsString = function(methodName){
            var state = states.get(methodName);
            return state.getActualCallsString();
        };
        this.invokeArgOfLastCallWith = function(methodName, argIndex){
            var state = states.get(methodName);
            var actualArgs = argumentsSubset(arguments, 2);
            var arg = state.getArgs()[argIndex];
            if(typeof arg === 'function'){
                arg.apply(null, actualArgs);
            }
            else{
                throw new Error('Cannot invoke argument ' + argIndex + ' of ' + methodName + ', it is not a function');
            }
        };
        this.invokeArgOfCallWith = function(methodName, callIndex, argIndex){
            var state = states.get(methodName);
            var actualArgs = argumentsSubset(arguments, 3);
            var arg = state.getArgs(callIndex)[argIndex];
            if(typeof arg === 'function'){
                arg.apply(null, actualArgs);
            }
            else{
                throw new Error('Cannot invoke argument ' + argIndex + ' of call ' + callIndex + ' of ' + methodName + ', it is not a function');
            }
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

    var factory = new Factory();
    if(typeof window !== 'undefined'){
        window.substitute = factory;
    }
    else if(typeof require === 'function'){
        if(typeof define === 'function'){
            define([], function(){
                return factory;
            });
        }
        else{
            module.exports = factory;
        }
    }

    function argumentsSubset(args, startIndex){
        var result = [];

        if(args.length){
            for(var i = startIndex; i < args.length; i++){
                result.push(args[i]);
            }
        }

        return result;
    }
})();