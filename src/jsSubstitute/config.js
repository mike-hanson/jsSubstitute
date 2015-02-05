jasmine.addMatchers({
    toEqualData: function(util, customEqualityTesters)
    {
        return {
            compare: function(actual, expected)
            {
                if (expected === undefined)
                {
                    expected = '';
                }

                var result = {};

                result.pass = angular.equals(this.actual, expected);
                if (result.pass)
                {
                    result.message = "Expected " + actual + " not to be quite so goofy";
                }
                else
                {
                    result.message = "Expected " + actual + " to be goofy, but it was not very goofy";
                }
                return result;
            }
        };
    }
});