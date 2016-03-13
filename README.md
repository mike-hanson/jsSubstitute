### jsSubstitute
An expressive library for creating substitutes (mocks, fakes, stubs) for testing JavaScript objects inspired by [NSubstitute](http://nsubstitute.github.io) my preferred .NET mocking framework, that supports the Arrange, Act, Assert pattern of testing.

### v2.0.0 - Breaking Change
Following the changes to support substitutes for functions I encountered some conflicts that I could not resolve after updating some of my test suites.  So I have made a breaking change to avoid the conflicts, hence bumping the major version of this library.

Once you upgrade to v2.* any tests that pass a custom matcher function to **receivedWith** will fail and probably break because this is no longer supported.  Instead you must use the **matchUsing** factory method of **substitute.arg**.

```javascript
var arg = substitute.arg;
// this
mySub.receivedWith(1, 2, function(arg){return arg === 3;});

// must become
mySub.receivedWith(1, 2, arg.matchUsing(function(arg){return arg === 3;}));
```

Internally the new factory method adds a flag to indicate the function is a matcher and this flag is later used during argument matching to determine whether a function argument should be executed or simply compared.

#### Installing

jsSubstitute is designed to work in browsers with or without RequireJS or with Node.js.  It hasn't been fully tested with RequireJS as I don't use it myself, but I hope to do more testing with it at some point.

Install with npm
```
npm install jssubstitute --save-dev
```

Install with bower
```
bower install jsSubstitute --save-dev
```

Install with NuGet

To install with NuGet search for jsSubstitute or use Package Manager Console to execute
```
Install-Package jsSubstitute
```

#### Usage

To create a substitute/fake/mock (they are all the same to jsSubstitute) you will need a reference to the factory object.

In a browser it is made available as **substitute** in the global space aka **window.substitute**

In Node a new instance is exported by the module so you will use something like

```javascript
var substitute = require('jssubstitute');
```

If you are using RequireJS you will declare a dependency something like this

```javascript
define(['jsSubstitute'], function(substitute){
});
```
Once you have the factory you create a substitute by passing a real instance of an object or a representation of the 'interface' of the object the **for** method.  The 'interface' can be specified using an object literal that has all the fields and methods without implementation or an array of method names.  The latter is great if you only want to test behaviour interaction with the substitute, if you need to also test state i.e. fields values you will need to use an object literal or a stub.

```javascript
// using an object literal as an interface
var iDoSomething = {method1: function(){}, method2: function(){}};
var mySub = substitute.for(iDoSomething);

// using an array of method names
var names = ['doThis', 'doThat'];
var mySub = substitute.for(names);
```
 
Now you have your substitute you can continue the Arrange step of the test and pass it as a dependency to another object or function.  Something like this (details of the full set of options for configuring a substitute will follow)

```javascript
mySub.callsThrough('method1');
var mySut = new MyObject(mySub);
```
Once all is arranged you can Act by doing something with your system under test to trigger interaction with the substitute.

```javascript
mySut.doSomething();
```

Then Assert that the expected interaction took place

```javascript
mySub.received('method1');
```

#### Calling Pattern
As mentioned NSubstitute was the influence for creating this library.  NSubstitute uses .NET Generics and Lambda expressions to create a fluent readable API.  e.g.

```C#
var sub = Substitute.For<IDoSomething>()
sub.Method1().Returns(1);
```

This can't be replicated with JavaScript (so far) but it influenced the creation of a common calling pattern for methods on a substitute.  Each method of a substitute expects the first argument to be a string that represents the name of the target method.

#### Arrange
The following methods are exposed by a substitute to arrange how they respond to interactions.

**returns**
This method allows you to arrange for the substitute to return a value or object regardless of the arguments passed to it.
```javascript
mySub.returns('method1', 1);
mySub.returns('method2', {field: value});
```

**returnsFor**
This method allows you to arrange for the substitute to return a value or object when passed a specific set of argument values.
```javascript
var returnMe = 2;
mySub.resturnsFor('method1', returnMe, 1, 1);
```
*NB: The return value is specified before the expected argument values, all values following this are treated as inputs.

**returnsPromise**
This method allows you to arrange for the substitute to return a promise substitute, which is returned to you and can be resolved or rejected synchronously.  The promise substitute also provides methods for making assertions about interaction with it, more on this in the Assertions section below.
```javascript
var promise = mySub.returnsPromise('method1');
```

**callsThrough**
This method allows you to arrange for the substitute to call through to the underlying object.  This is useful if you have a substitute for a real or stubbed object.  Note if your substitute was created from an array of names calling this method will throw an error as there is no underlying implementation to be called.
```javascript
mySub.callsThrough('method1');
```

#### Act
The following methods are exposed by a substitute as a helpers during the Act phase of your tests.

**clearCalls**
This method allows you to clear all calls to a specific method, this can be useful when a method may be called several times and you want to reset before a specific interaction that results in a call to the method.  This can help to make tests more readable.

**invokeArgOfLastCallWith**
This method allows you to invoke a specific argument of the last call to a substitute, optionally with arguments that will be passed through.  This is helpful to test invocation of callback functions passed to a method.  The second argument to this method is the index of the argument to invoke, all subsequent arguments are passed through
```javascript
mySub.method(1, function(a1, a2){
	// do something here
}
// invoke the anonymous function with (1, 3)
mySub.invokeArgOfLastCallWith('method', 1, 1, 3);
```

**invokeArgOfCallWith**
This method behaves the same as the previous one except it allows you to specify the call and argument index.  This is useful where the same method is called multiple times during a test, for example *on('event', ...)* methods 
```javascript
mySub.method(1, function(a1, a2){
	// do something here
}
mySub.method(2, function(a1, a2){
	// do something here
}
// invoke the second argument of the second call with (1, 3)
mySub.invokeArgOfCallWith('method', 1, 1, 1, 3);
```

#### Assert
The following methods are exposed by a substitute to support interaction assertions.  All assertion methods return a boolean result by default.  However you can change this behaviour either globally or at the point of creating a substitute such that assertions will throw an error on failure.

```javascript
// enable throwing errors on assertion failure
// globally
substitute.throwErrors();
substitute.throwErrors(true);

// creation time
var mySub = substitute.for(myInterface, true);


// disable throwing errors on assertion failure
// globally
substitute.throwErrors(false);

// creation time
var mySub = substitute.for(myInterface, false);
```
You can also query the global and instance setting
```javascript
var globalSetting = substitute.throwsErrors();
var instanceSetting = mySub.throwsErrors();
```

**received**
This method allows you to assert that a method of the substitute was called at least one or a specific number of times, regardless of arguments passed to it.
```javascript
mySub.received('method1'); // at least once
mySub.received('method2', 2); // exactly two times
```

**receivedWith**
This method allows you to assert that a method of the substitute was called at least once with a specific set of argument values or argument values that match a predicate.  The factory exposes an *arg* object that in turn exposes some useful argument assertion methods/predicates, full details of this object are provided in a separate section below.

```javascript
mySub.receivedWith('method1', 1);
mySub.receivedWith('method2', substitute.arg.any(Function));
```

**didNotReceive**
This method allows you to assert that a method was never called, regardless of arguments
```javascript
mySub.didNotReceive('method1');
```

#### Argument Checking
The factory exposes an *arg* object as a property.  This in turn exposes the following useful methods that allow you to make assertions about an argument passed to a method of a substitute.  To match a specific value you simply specify that value in the call to *receivedWith*.  The *arg* methods are provided for scenarios beyond this.

**any**
This method allows you to assert that an argument is of a specified type.
```javascript
// is or was created using new with a construcor function i.e. instanceof
mySub.receivedWith('method1', substitute.arg.any(Array));

// is a primitive type i.e. typeof
mySub.receivedWith('method1', substitute.arg.any('function');
```

**is**
This method allows you to assert that an argument is of specified type and matches an expected value or predicate.

```javascript
// is or was created using new with a construcor function i.e. instanceof
var myArray = [1,2];
mySub.receivedWith('method1', substitute.arg.is(Array, myArray));

// is a primitive type i.e. typeof
var myObject = {field: value}
mySub.receivedWith('method1', substitute.arg.is('object', myObject);
```

**hasState**
This method allows you to assert that an argument has the same state (fields and values) as an object.  It only asserts that the argument value has the same fields and values it ignores any additional fields the argument may have.
```javascript
var state = {field1: 1, field2: 'two'}
mySub.receivedWith('method1', substitute.arg.hasState(state));
```

**hasProperty**
This method allows you to assert that an argument has a property (field) and that it has a specified value.
```javascript
mySub.receivedWith('method1', substitute.arg.hasProperty('field1', 1));
```

**matchUsing**
This method allows you test an argument using a predicate function, which must accept a single argument and return a boolean result after comparing the argument.
```javascript
mySub.receivedWith(1, 2, substitute.arg.matchUsing(function(a){return a === 3;}));
```

If none of the above methods support your required assertion then you can always resort to getting actual argument values and making assertions against them using your assertion framework.  The factory exposes a method for this purpose

**argsForCall**
This method allows you to retrieve an array of argument values for the last call or a specific call by index.  The argument values are in positional order as they were passed to the method
```javascript
mySub.argsForCall('method1'); // arguments for the last call
mySub.argsForCall('method1', 1); // arguments for the second call
```

#### Promises, Promises, Promises
There are two situations where you can get a promise with jsSubstitute.  The factory has a *forPromise* method and substitutes have a *returnsPromise* method.  Both return you a substitute for a promise that exposes the following methods:

```javascript
// creating a promise substitute that throws errors on assertion failure
var promise = substititute.forPromise(true);
var promise = mySub.returnsPromise('method', true);

// creating a promise substitute that does not throw errors on assertion failure
var promise = substititute.forPromise();
var promise = substititute.forPromise(false);
var promise = mySub.returnsPromise('method');
var promise = mySub.returnsPromise('method', false);
```

**then**
Any code that expects to work with a promise will use this method to provide success and error handlers.  This method mirrors the signature of the expected method and tracks whether it was called or not.

**success**
This method allows you to trigger the successful resolution of a promise and pass data to expectant code.  Calling this method will cause any success handler passed to *then* to be called with the data
```javascript
var data = {field1: value}
promise.success(data)
```
**error**
This method allows you to trigger the rejection of a promise and pass data to expectant code.  Calling this method will cause any error handler passed to *then* to be called with the data
```javascript
var error = new Error("message");
promise.error(error)
```
**receivedThen**
This method allows you to assert that the *then* method of the promise was called

**receivedThenWithOneHandler**
This method allows you to assert that the *then* method of the promise was called with a success handler

**recievedThenWithBothHandlers**
This method allows you to assert that the *then* method of the promise was called with both a success and error handler

**throwErrors**
By default the promise returned will inherit error throwing configuration from the factory or substitute. This can be changed using this method.  As with the factory it accepts a parameter that specifies whether to throw errors on assertion failure.

```javascript
// both of these configure the promise to throw errors
promise.throwErrors();
promise.throwsErrors(true);

// configure the promise not to throw errors
promise.throwErrors(false)
``` 

**throwsErrors**
This method allows you to query whether the promise substitute will throw errors on failed exceptions.

And that is all there is so far. Bear in mind I created this library for my own purposes, I use it all the time and prefer the readability of it to other test or mocking frameworks I have come across to date.  I use jasmine for all my unit and acceptance testing, but find the spy mechanism too wordy and awkward at times.  This library allows me to use the AAA pattern in much the same way as I use NSubstitute with NUnit in my C# code.  I will continue to develop and publish updates to jsSubstitute as I feel the need and welcome any suggestions or feedback.

##### Function Substitutes - From v1.0.14
Support for function substitutes was working from version 1.0.14.  This was added to support creating subsitutes that tracked calls to a function as well as objects and interfaces that were already supported.  This made it possible to use jsSubstitute for testing Angular Services like $timeout or Node Modules that exported a function rather than an object with members.

#### Arrange

First you need your substitute

**forFunction**
```javascript
var myFnSub = substitute.forFunction(function(arg1, arg2){//...})
```

**returns**
Just as with an object substitute you can configure a return value without regard for arguments, which skips the call through to the target function.

```javascript
myFnSub.returns(4);
```

**returnsFor**
This method allows you to configure a return value for a specific set of argument values, it also skips the call through to the target function.

```javascript
var returnMe = 4;
myFnSub.returnsFor(returnMe, 1, 3);
```

#### Act

You can now execute the substitute, or more accurately your production code can, then make assertions about the calls.

```javascript
myFnSub(1, 3);
```

**wasInvoked**
This assertion ignores any arguments simply indicates if the function was invoked 1 or specific number of times.

```javascript
myFnSub.wasInvoked();
myFnSub.wasInvoked(2); // fails if not invoked exactly twice
```

**wasInvokedWith**
The method allows you to assert the function was invoked at least once with a specific set of argument values.  It supports all of the same argument matching options as the object substitute.  I won't repeat them here.
```javascript
myFnSub.wasInvokedWith(1, 2);
myFnSub.wasInvokedWith('string', substitute.arg.any(Function));
```

 






