### jsSubstitute
An expressive library for creating substitutes (mocks, fakes, stubs) for testing JavaScript objects inspired by [NSubstitute][http://nsubstitute.github.io] my preferred .NET mocking framework, that supports the Arrange, Act, Assert pattern of testing.

####Installing

jsSubstitute is designed to work in browsers with or without RequireJS or with Node.js.  It hasn't been fully tested with RequireJS as I don't use it myself, but I hope to do more testing with it at some point.

Install with npm
```
npm install jssubstitute --save-dev
```

Install with bower
```
bower install jsSubstitute --save-dev
```

Support for NuGet is planned and instructions will be added here when it is completed.


####Usage

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

Once you have the factory you create a substitute by passing a real instance of an object or an object literal that represents the 'interface' of the object to the **for** method like this

```javascript
var mySub = substitute.for({method1: function(){}, method2: function(){});
```

Now you have your substitute your can continue the Arrange step of the test and pass it as a dependency to another object or function.  Something like this (details of the full set of options for configuring a substitute will follow)

```javascript
mySub.callsThrough('method1');
var mySut = new MyObject(mySub);
```

Once all is arranged you can Act by doing something with your system under test that interacts with the substitute.

```javascript
mySut.doSomething();
```

Then Assert that the expected interaction took place

```javascript
mySub.received('method1');
```

###Configuring a substitute
The following methods are exposed by a substitute to arrange how they respond to interactions.  All methods expect the name of a method exposed by the object being substituted as a first argument.

**returns**
This method allows you to arrange for the substitute to return a value or object regardless of the arguments passed to it like this:
```javascript
mySub.returns('method1', {field: value});
```



