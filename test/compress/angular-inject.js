ng_inject_defun: {
    options = {
        angular: true
    };
    input: {
        /*@ngInject*/
        function Controller(dependency) {
            return dependency;
        }
    }
    expect: {
        function Controller(dependency) {
            return dependency;
        }
        Controller.$inject=['dependency']
    }
}

ng_inject_assignment: {
    options = {
        angular: true
    };
    input: {
        /*@ngInject*/
        var Controller = function(dependency) {
            return dependency;
        }
    }
    expect: {
        var Controller = function(dependency) {
            return dependency;
        }
        Controller.$inject=['dependency']
    }
}

ng_inject_inline: {
    options = {
        angular: true
    };
    input: {
        angular.module('a').
            factory('b',
                /*@ngInject*/
                function(dependency) {
                    return dependency;
                }).
            directive('c',
                /*@ngInject*/
                function(anotherDependency) {
                    return anotherDependency;
                })
    }
    expect: {
        angular.module('a').
            factory('b',[
                'dependency',
                function(dependency) {
                    return dependency;
                }]).
            directive('c',[
                'anotherDependency',
                function(anotherDependency) {
                    return anotherDependency;
                }])
    }
}
