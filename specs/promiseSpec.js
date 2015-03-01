var substitute = substitute || {};

if(typeof require === 'function'){
	substitute = require('../src/index.js');
}

describe('PromiseSubstitute', function(){
	var promise;
	beforeEach(function (){
		promise = substitute.forPromise();
	});

	describe('Interface', function(){

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

		it('Should define a method to assert that then was called with a success handler', function(){
			expect(promise.receivedThenWithOneHandler).toBeDefined();
			expect(typeof promise.receivedThenWithOneHandler).toBe('function');
		});

		it('Should define a method to assert that then was called with both success and error handlers', function(){
			expect(promise.receivedThenWithBothHandlers).toBeDefined();
			expect(typeof promise.receivedThenWithBothHandlers).toBe('function');
		});

		it('Should define a method to configure the promise to throw errors on assertion', function(){
			expect(promise.throwErrors).toBeDefined();
			expect(typeof promise.throwErrors).toBe('function');
		});

		it('Should support specifying whether to throw errors', function(){
			expect(promise.throwErrors.length).toBe(1);
		});

		it('Should define a method to query whether throwing errors is enabled', function(){
			expect(promise.throwsErrors).toBeDefined();
			expect(typeof promise.throwsErrors).toBe('function');
		});
	});

	describe('Without Errors Enabled', function (){

		beforeEach(function(){
			substitute.throwErrors(false);
			promise = substitute.forPromise();
		});

		it('Should report that errors are not enabled by default', function () {
			expect(promise.throwsErrors()).toBe(false);
		});

		it('Should report that errors are not enabled when set explicitly', function () {
			expect(promise.throwErrors(false));
			expect(promise.throwsErrors()).toBe(false);
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

		it('Should report that then was not called with a success handler', function(){
			expect(promise.receivedThenWithOneHandler()).toBeFalsy();
		});

		it('Should report that then was called with a success handler', function () {
			promise.then(function () {
			});
			expect(promise.receivedThenWithOneHandler()).toBeTruthy();
		});

		it('Should report that then was not called with an error handler', function () {
			expect(promise.receivedThenWithBothHandlers()).toBeFalsy();
		});

		it('Should report that then was called with both a success and error handler', function () {
			promise.then(function () {
			}, function (){});
			expect(promise.receivedThenWithBothHandlers()).toBeTruthy();
		});
	});

	describe('With Errors Enabled', function(){

		beforeEach(function(){
			promise.throwErrors(true);
		});

		it('Should report that errors are enabled', function () {
			expect(promise.throwsErrors()).toBe(true);
		});

		it('Should throw error if then was not called', function (){
			expect(function(){
				promise.receivedThen();
			}).toThrow(new Error('then has not received expected call'));
		});

		it('Should not throw error if then was called', function(){
			promise.then(function(){
			}, function(){
			});
			expect(function(){
				promise.receivedThen();
			}).not.toThrow();
		});
		
		it('Should throw error if success handler has not been provided', function (){
			expect(function(){
				promise.hasSuccessHandler();
			}).toThrow(new Error('Promise does not have expected success handler'));
		});

		it('Should not throw error if success handler has been provided', function(){
			promise.then(function(){
			});
			expect(function () {
				promise.hasSuccessHandler();
			}).not.toThrow();
		});

		it('Should throw error if error handler has not been provided', function () {
			expect(function () {
				promise.hasErrorHandler();
			}).toThrow(new Error('Promise does not have expected error handler'));
		});

		it('Should not throw error if error handler has been provided', function(){
			promise.then(function(){
			}, function(){
			});
			expect(function () {
				promise.hasErrorHandler();
			}).not.toThrow();
		});

		it('Should throw error if then has not been called with success handler', function () {
			expect(function () {
				promise.receivedThenWithOneHandler();
			}).toThrow(new Error('then has not been called with expected success handler'));
		});

		it('Should not throw error if then has been called with a success handler', function () {
			promise.then(function () {
			});
			expect(function (){
				promise.receivedThenWithOneHandler();
			}).not.toThrow();
		});

		it('Should throw error if then has not been called with error handler', function () {
			expect(function (){
				promise.receivedThenWithBothHandlers();
			}).toThrow(new Error('then has not been called with expected success and error handlers'));
		});

		it('Should not throw error if then as been called with error handler', function () {
			promise.then(function () {
			}, function () {
			});
			expect(function (){
				promise.receivedThenWithBothHandlers();
			}).not.toThrow();
		});
	});
});