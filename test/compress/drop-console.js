drop_console_1: {
    options = {}
    input: {
        console.log('foo');
        console.log.apply(console, arguments);
    }
    expect: {
        console.log('foo');
        console.log.apply(console, arguments);
    }
}

drop_console_2: {
    options = {
        drop_console: true,
    }
    input: {
        console.log('foo');
        console.log.apply(console, arguments);
    }
    expect: {
        // with regular compression these will be stripped out as well
        void 0;
        void 0;
    }
}
