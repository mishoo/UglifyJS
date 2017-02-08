var Test = function() {
  this.someVar = 123;
};

Test.prototype.someMethod = function() {
  console.log(this.someVar);
}

Test.prototype.someOther = function() {
  console.log("other");
  this.someMethod();
  this.__special();
}

Test.prototype.__special = function() {
  console.log("special");
}

var oTest = new Test();
oTest.someOther();
