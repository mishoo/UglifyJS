function assignToGlobal() {
    x = 1;
}

function eval() {
    eval("var x = 1");
}

function funcArguments() {
    console.log("args: ", arguments);
}

function nestedDefuns() {
    if (true) {
        function fn() { }
    }
}

function unreferencedFnc() { }
undeclaredFnc();