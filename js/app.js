var app = angular.module('faqEngine', ['elasticsearch'], ['$locationProvider', function($locationProvider) {
  $locationProvider.html5Mode(true);
}]);

app.service('client', function(esFactory) {
  return esFactory({
    host: location.hostname + ':9200',
    apiVersion: '2.3',
    log: 'trace'
  });
});

app.controller("FAQController", function($scope, $sce, client) {

  $scope.searchResult = [];

  $scope.search = function(query) {
    var query = {
      match: {
        _all: query
      }
    };

    client.search({
      index: 'faqs',
      type: 'faq',
      body: {
        query: query
      }
    }, function(error, response) {
      $scope.successfulSearch = 0;
      if (!error) {
        $scope.searchResult = response.hits.hits;
        $scope.searchResult.forEach(function(element) {
          element._source.details = $sce.trustAsHtml(markdown.toHTML(element._source.details));
        });
        if ($scope.searchResult.length === 0) {
          $scope.successfulSearch = 1;
        }
      } else {
        $scope.successfulSearch = 2;
        console.log("Failed to search " + query);
        console.log(error);
      }
      $scope.query = null;
    });
  }

  $scope.submit = function(title, details) {
    client.index({
      index: 'faqs',
      type: 'faq',
      body: {
        title: title,
        details: details,
      }
    }, function(error, response) {
      $scope.successfulSubmit = 0;
      if (!error) {
        $scope.successfulSubmit = 1;
      } else {
        $scope.successfulSubmit = 2;
        console.log("Failed to submit " + title + " " + details);
        console.log(error);
      }
      $scope.title = null;
      $scope.details = null;
    });
  }

  $scope.$watch('input_tab', function(newValue) {
    if (newValue === 2) {
      if ($scope.details !== undefined) {
        document.getElementById("preview").innerHTML = markdown.toHTML($scope.details);
      } else {
        document.getElementById("preview").innerHTML = "";
      }
    }
  });
});
