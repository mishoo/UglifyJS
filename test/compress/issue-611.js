issue_611: {
  options = {
        sequences: true,
        side_effects: true,
    }
  input: {
    define(function() {
      function fn() {}
      if (fn()) {
        fn();
        return void 0;
      }
    });
  }
  expect: {
    define(function() {
      function fn(){}
      if (fn()) return void fn();
    });
  }
}
