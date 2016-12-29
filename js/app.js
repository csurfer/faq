var app = angular.module('faqEngine', ['elasticsearch']);

app.config(function($locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
});

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
    var structured_query = {
      query_string: {
        query: query
      }
    };

    client.search({
      index: 'faqs',
      type: 'faq',
      body: {
        query: structured_query
      }
    }, function(error, response) {
      $scope.searchStatus = 'unknown';
      if (!error) {
        $scope.searchResult = response.hits.hits;
        $scope.searchResult.forEach(function(element) {
          element._source.details = $sce.trustAsHtml(markdown.toHTML(element._source.details));
        });
        if ($scope.searchResult.length === 0) {
          $scope.searchStatus = 'success';
        }
      } else {
        $scope.searchStatus = 'failure';
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
      $scope.submitStatus = 'unknown';
      if (!error) {
        $scope.submitStatus = 'success';
      } else {
        $scope.submitStatus = 'failure';
        console.log("Failed to submit " + title + " " + details);
        console.log(error);
      }
      $scope.title = null;
      $scope.details = null;
    });
  }

  $scope.delete = function(id, el) {
    client.delete({
      index: 'faqs',
      type: 'faq',
      id: id
    }, function(error, response) {
      if (error) {
        console.log(error);
      }
    });
  }

  $scope.$watch('input_tab', function(newValue) {
    if (newValue === 'preview') {
      if ($scope.details !== undefined) {
        document.getElementById("preview").innerHTML = markdown.toHTML($scope.details);
      } else {
        document.getElementById("preview").innerHTML = "";
      }
    }
  });
});
