var app = angular.module('faqEngine', []);
app.controller("MyC", function ($scope) {
  this.product = "Hello world !";

  $scope.search = function (msg) {
    alert(msg);
  }

  $scope.submit = function (title, details) {
    alert(title + " " + details);
  }
});