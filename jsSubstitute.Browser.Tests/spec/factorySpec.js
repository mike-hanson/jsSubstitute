describe('jsSubstitute Factory', function(){
    var factory, expectedError;
    beforeEach(function(){
        factory = substitute;
        expectedError = new Error('jsSubstitute can only create substitutes for objects or functions');
    });

    it('Should be defined', function(){
        expect(factory).toBeDefined();
    });

    it('Should provide a method to create a substitute for an object', function(){
        expect(factory.for).toBeDefined();
        expect(typeof factory.for).toBe('function');
    });

    it('Should define arguments to specify the target for the substitute and override the error throwing behaviour', function(){
        expect(factory.for.length).toBe(2);
    });

    it('Should provide a method to configure whether substitutes throw errors on assertion failure', function(){
        expect(factory.throwErrors).toBeDefined();
        expect(typeof factory.throwErrors).toBe('function');
    });

    it('Should define an argument for the error configuration method', function(){
        expect(factory.throwErrors.length).toBe(1);
    });

    it('Should provide a method to query whether substitutes throw errors on assertion failure', function(){
        expect(factory.throwsErrors).toBeDefined();
        expect(typeof factory.throwsErrors).toBe('function');
    });

    it('Should default to not throwing errors', function(){
        expect(factory.throwsErrors()).toBeFalsy();
    });

    it('Should default to throwing errors if no arguments specified to method', function(){
        factory.throwErrors();
        expect(factory.throwsErrors()).toBeTruthy();
        factory.throwErrors(false);
    });

    it('Should report errors will be thrown if set', function(){
        factory.throwErrors(true);
        expect(factory.throwsErrors()).toBeTruthy();
    });

    it('Should throw an error if argument is number', function(){
        expect(function(){
            factory.for(1);
        }).toThrow(expectedError);
    });
    it('Should throw an error if argument is string', function(){
        expect(function(){
            factory.for('some string');
        }).toThrow(expectedError);
    });
    it('Should throw an error if argument is and array', function(){
        expect(function(){
            factory.for(['one', 'two', 'three']);
        }).toThrow(expectedError);
    });
    it('Should not throw an error if argument is an object literal', function(){
        expect(function(){
            factory.for({
                field1: 'value',
                field2: function(){
                }
            });
        }).not.toThrow(expectedError);
    });

    it('Should not throw an error if argument is an object constructed from a function', function(){

        var ctor = function(){
        };
        expect(function(){
            factory.for(new ctor());
        }).not.toThrow(expectedError);
    });

    it('Should not throw an error if argument is a constructor function', function(){
        var ctor = function(){
        };
        expect(function(){
            factory.for(ctor);
        }).not.toThrow(expectedError);
    });

    it('Should return an instance of Substitute', function(){
        var substitute = factory.for({
            method: function(){
            }
        });
        expect(substitute.constructor).toBeDefined();

        // NB: this will fail if tests are run in IE<10
        expect(substitute.constructor.name).toBe('Substitute');
    });

    it('Should use configured default for throwing errors on creating substitute', function(){
        factory.throwErrors(true);
        var substitute = factory.for({
            method: function(){
            }
        });
        expect(substitute.throwsErrors()).toBe(factory.throwsErrors());                    
    });
});