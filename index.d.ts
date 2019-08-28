declare var substitute: substitute.Factory;

declare module 'jsSubstitute' {
  export = substitute;
}

declare module substitute {
  /**
   * Provides a factory for creating substitutes
   */
  interface Factory {
    /**
     * @description Provides an argument matcher
     * @returnType {Arg}
     */
    arg: Arg;

    /**
     * @description Creates a substitute for the interface defined by the target
     * @param {{}} target An object literal representing the interface to be substituted
     * @param {boolean} [throwErrors=false] Indicates whether to throw errors on assertion failure, defaults to global configuration or false
     * @returnType {Substitute}
     */
    for(target: {}, throwErrors?: boolean): Substitute;

    /**
     * @description Creates a substitute for the interface defined by the target
     * @param {string[]} target An array of method names representing the interface to be substituted
     * @param {boolean} [throwErrors=false] Indicates whether to throw errors on assertion failure, defaults to global configuration or false
     * @returnType {Substitute}
     */
    for(target: string[], throwErrors?: boolean): Substitute;

    /**
     * @description Creates a substitute for the interface defined by the target
     * @param {Object} target An object instance to be substituted
     * @param {boolean} [throwErrors=false] Indicates whether to throw errors on assertion failure, defaults to global configuration or false
     * @returnType {Substitute}
     */
    for(target: { Object }, throwErrors?: boolean): Substitute;

    /**
     * @description Creates a substitute for a promise
     * @param {boolean} [throwErrors=false] Indicates whether to throw errors on assertion failure, defaults to global configuration or false
     * @returnType {PromiseSubstitute}
     */
    forPromise(throwErrors?: boolean): PromiseSubstitute;

    /**
     * @description Creates a substitute that can be invoked as a function, with call tracking
     * @param {Function} fn The function to be tracked
     * @param {boolean} [throwErrors=false] Indicates whether to throw errors on assertion failure, defaults to global configuration or false
     * @returnType {Function}
     */
    forFunction(fn: Function, throwErrors?: boolean): Function;

    /**
     * @description Configures the promise to throw errors on failed assertions
     * @param {boolean} [throwErrors=true] Indicates whether to throw errors or not
     */
    throwErrors(throwErrors?: boolean): void;

    /**
     * @description Indicates whether the substitute is configured to throw errors on failed assertions
     * @returnType {boolean}
     */
    throwsErrors(): boolean;
  }

  /**
   * @description Provides methods for asserting the state or value of arguments passed to substitutes
   */
  interface Arg {
    /**
     * @description Asserts that the argument matches the specified type using typeof
     * @param type {string} The expected type of the argument
     * @returnType {boolean}
     */
    any(type: string): boolean;

    /**
     * @description Asserts that the argument matches the specified type using instanceOf
     * @param type {Object} The expected type of the argument
     * @returnType {boolean}
     */
    any(type: Object): boolean;

    /**
     * @description Asserts that the arguments matches the specified type using typeof and expected value
     * @param type {string} The expected type of the argument
     * @param expected {any} The expected value of the argument
     * @returnType {boolean}
     */
    is(type: string, expected: any): boolean;

    /**
     * @description Asserts that the arguments matches the specified type using instanceof and expected value
     * @param type {string} The expected type of the argument
     * @param expected {any} The expected value of the argument
     * @returnType {boolean}
     */
    is(type: Object, expected: any): boolean;

    /**
     * @description Asserts that the argument has fields and values matching the source
     * @param source {{}} The expected fields and values
     * @returnType {boolean}
     */
    hasState(source: {}): boolean;

    /**
     * @description Asserts that the argument has a specified field and value
     * @param name {string} The name of the expected field
     * @param value {any} The expected value of the field
     * @returnType {boolean}
     */
    hasProperty(name: string, value: any): boolean;

    /**
     * @description Asserts that the return from the provided predicate function is true
     * @param fn {(a: any) => boolean} The predicate function to test the argument against
     * @returnType {boolean}
     */
    matchUsing(fn: (a: any) => boolean): boolean;
  }

  /**
   * @description Substitute for promises
   */
  interface PromiseSubstitute {
    /**
     * @description Stub for the then method expected on a promise, tracks calls to the method by production code
     * @param  {(result) => void} success The handler for successful resolution of the promise
     * @param {(error) => void error The handler for failed or error resolution of the promise
     */
    then(success: (result) => void, error: (error) => void);

    /**
     * @description Initiate successful resolution of the promise
     * @param {any} [data] Optional data to be passed to the success handler
     */
    success(data?: any);

    /**
     * @description Initiate failure resolution of the promise
     * @param {any} [error] Optional error to be pased to error handler
     */
    error(error?: any);

    /**
     * @description Asserts that then was called on the promise
     * @returnType {boolean}
     */
    receivedThen(): boolean;

    /**
     * @description Asserts that then was called with at least a success handler
     * @returnType {boolean}
     */
    receivedThenWithOneHandler(): boolean;

    /**
     * @description Asserts that then was called with both a success and error handler
     * @returnType {boolean}
     */
    receivedThenWithBothHandlers(): boolean;

    /**
     * @description Asserts that the promise was created with a success handler
     * @returnType {boolean}
     */
    hasSuccessHandler(): boolean;

    /**
     * @description Asserts that the promise was created with an error handler
     * @returnType {boolean}
     */
    hasErrorHandler(): boolean;

    /**
     * @description Configures the promise to throw errors on failed assertions
     * @param {boolean} [throwErrors=true] Indicates whether to throw errors or not
     */
    throwErrors(throwErrors?: boolean): void;

    /**
     * @description Indicates whether the substitute is configured to throw errors on failed assertions
     * @returnType {boolean}
     */
    throwsErrors(): boolean;
  }

  /**
   * Substitutes an object tracking method calls
   */
  interface Substitute {
    /**
     * @description Indicates whether the substitute is configured to throw errors on failed assertions
     * @returnType {boolean}
     */
    throwsErrors(): boolean;

    /**
     * @description Asserts that the object received a call to the specified method at least once
     * @param {string} methodName The name of the method that was expected to have been called
     * @param {number} [expectedCallCount] The number of expected calls
     */
    received(methodName: string, expectedCallCount?: number): boolean;

    /**
     * @description Asserts that the object received a call to the specified method with the specified arguments
     * @param {string} methodName The name of the method that was expected to have been called
     * @param {...any} expectedArgs Arguments that were expected to have been passed to the method
     */
    receivedWith(methodName: string, ...expectedArgs: any[]): boolean;

    /**
     * @description Asserts that the object did not receive any calls to the specified method
     * @param {string} methodName The name of the method that should not have been called
     * @returnType {boolean}
     */
    didNotReceive(methodName: string): boolean;

    /**
     * @description Configures the substitute to return a value regardless of arguments passed to the specified method
     * @param {string} methodName The name of the method being configured
     * @param {any} returnValue The value to be returned
     */
    returns(methodName: string, returnValue: any): void;

    /**
     * @description Configures the substitute to return a value when the specified method is called with the specified arguments
     * @param {string} methodName The name of the method being configured
     * @param {any} returnValue The value to be returned
     * @param {...any} expectedArgs Arguments values that are to matched when evaluating return for a method call
     */
    returnsFor(methodName: string, returnValue: any, ...expectedArgs: any[]): void;

    /**
     * @description Configures the specified method to return a promise when called
     * @param {string} methodName The name of the method being configured
     * @param {boolean} [throwErrors] Indicates whether the promise substitute returned should throw errors on failed assertions
     */
    returnsPromise(methodName: string, throwErrors?: boolean): void;

    /**
     * @description Configures the specified method to return a promise for a specified set of argument values
     * @param {string} methodName The name of the method being configured
     * @param {any[]} expectedArgs Argument values that are to be matched when evaluating return for a method call
     */
    returnsPromiseFor(methodName: string, ...expectedArgs: any[]): void;

    /**
     * @description Configures the specified method to call through to any underlying method on the object the substitute was created from
     * @param {string} methodName The name of the method being configured
     * @throws Error If the object does not have an underlying method, e.g. the substitute was created from an interface rather than a real object instance
     */
    callsThrough(methodName: string): void;

    /**
     * @description Retrieves the arguments passed to a call to the specified method
     * @param {string} methodName The name of the target method
     * @param {number} [callIndex=0] The index of the call of interest
     * @returnType {any}
     * @throws Error If there have been no calls to the specified method
     */
    argsForCall(methodName: string, callIndex?: number): any;

    /**
     * @description Removes all calls to date from the tracking state for the specified method
     * @param {string} methodName The name of the target method
     */
    clearCalls(methodName: string): void;

    /**
     * @description Gets a string representation of the call history for the specified method
     * @param {string} methodName The name of the target method
     * @returnType {string}
     */
    getActualCallString(methodName: string): string;

    /**
     * @description Invokes the argument at the specified index passed to the last call of the specified method
     * @param {string} methodName The name of the target method
     * @param {number} argIndex The index of the argument to invoke
     * @param {...any[]} args Optional arguments that are passed through to the invoked argument
     * @throws Error if the specified argument is not a function
     */
    invokeArgOfLastCallWith(methodName: string, argIndex: number, ...args: any[]): void;

    /**
     * @description Invokes the argument at the specified index passed to the specified call of the specified method
     * @param {string} methodName The name of the target method
     * @param {number} callIndex The index of the call to invoke
     * @param {number} argIndex The index of the argument to invoke
     * @param {...any[]} args Optional arguments that are passed through to the invoked argument
     * @throws Error if the specified argument is not a function
     */
    invokeArgOfCallWith(methodName: string, callIndex: number, argIndex: number, ...args: any[]): void;
  }
}
