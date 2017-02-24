drop_error_1: {
    options = {};
    input: {
        Error('foo');
        Error('foo', arguments);
        EvalError('foo');
        EvalError('foo', arguments);
        InternalError('foo');
        InternalError('foo', arguments);
        RangeError('foo');
        RangeError('foo', arguments);
        ReferenceError('foo');
        ReferenceError('foo', arguments);
        SyntaxError('foo');
        SyntaxError('foo', arguments);
        TypeError('foo');
        TypeError('foo', arguments);
        URIError('foo');
        URIError('foo', arguments);

    }
    expect: {
        Error('foo');
        Error('foo', arguments);
        EvalError('foo');
        EvalError('foo', arguments);
        InternalError('foo');
        InternalError('foo', arguments);
        RangeError('foo');
        RangeError('foo', arguments);
        ReferenceError('foo');
        ReferenceError('foo', arguments);
        SyntaxError('foo');
        SyntaxError('foo', arguments);
        TypeError('foo');
        TypeError('foo', arguments);
        URIError('foo');
        URIError('foo', arguments);
    }
}

drop_error_2: {
    options = { drop_error: true };
    input: {
        Error('foo');
        Error('foo', arguments);
        EvalError('foo');
        EvalError('foo', arguments);
        InternalError('foo');
        InternalError('foo', arguments);
        RangeError('foo');
        RangeError('foo', arguments);
        ReferenceError('foo');
        ReferenceError('foo', arguments);
        SyntaxError('foo');
        SyntaxError('foo', arguments);
        TypeError('foo');
        TypeError('foo', arguments);
        URIError('foo');
        URIError('foo', arguments);
    }
    expect: {
        Error();
        Error();
        EvalError();
        EvalError();
        InternalError();
        InternalError();
        RangeError();
        RangeError();
        ReferenceError();
        ReferenceError();
        SyntaxError();
        SyntaxError();
        TypeError();
        TypeError();
        URIError();
        URIError();
    }
}
