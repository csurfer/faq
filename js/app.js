var app = angular.module('faqEngine', ['elasticsearch'], ['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]
);

app.service('client', function (esFactory) {
  return esFactory({
    host: 'localhost:9200',
    apiVersion: '2.3',
    log: 'trace'
  });
});

app.controller("MyC", function($scope, client) {

  $scope.searchResult = [];

  $scope.search = function (query) {
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
    }, function (error, response) {
      if (!error) {
        $scope.searchResult = response.hits.hits;
      }
    });
  }

  $scope.submit = function (title, details) {
    client.index({
      index: 'faqs',
      type: 'faq',
      body: {
        title: title,
        details: details,
      }
    }, function (error, response) {
      if (!error) {
        console.log("Success !!!");
      }
    });
  }
});