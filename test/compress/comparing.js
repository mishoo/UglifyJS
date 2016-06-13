keep_comparisons: {
    options = {
        comparisons: true,
        unsafe_comps: false
    }
    input: {
        var obj1 = {
            valueOf: function() {triggeredFirst();}
        }
        var obj2 = {
            valueOf: function() {triggeredSecond();}
        }
        var result1 = obj1 <= obj2;
        var result2 = obj1 <  obj2;
        var result3 = obj1 >= obj2;
        var result4 = obj1 >  obj2;
    }
    expect: {
        var obj1 = {
            valueOf: function() {triggeredFirst();}
        }
        var obj2 = {
            valueOf: function() {triggeredSecond();}
        }
        var result1 = obj1 <= obj2;
        var result2 = obj1 <  obj2;
        var result3 = obj1 >= obj2;
        var result4 = obj1 >  obj2;
    }
}

keep_comparisons_with_unsafe_comps: {
    options = {
        comparisons: true,
        unsafe_comps: true
    }
    input: {
        var obj1 = {
            valueOf: function() {triggeredFirst();}
        }
        var obj2 = {
            valueOf: function() {triggeredSecond();}
        }
        var result1 = obj1 <= obj2;
        var result2 = obj1 <  obj2;
        var result3 = obj1 >= obj2;
        var result4 = obj1 >  obj2;
    }
    expect: {
        var obj1 = {
            valueOf: function() {triggeredFirst();}
        }
        var obj2 = {
            valueOf: function() {triggeredSecond();}
        }
        var result1 = obj2 >= obj1;
        var result2 = obj2 >  obj1;
        var result3 = obj1 >= obj2;
        var result4 = obj1 >  obj2;
    }
}

dont_change_in_or_instanceof_expressions: {
    input: {
        1 in 1;
        null in null;
        1 instanceof 1;
        null instanceof null;
    }
    expect: {
        1 in 1;
        null in null;
        1 instanceof 1;
        null instanceof null;
    }
}