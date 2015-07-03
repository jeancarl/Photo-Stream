// Filename: public/photostream.js

var PhotoStreamApp = angular.module('PhotoStreamApp', ['ngRoute']);

PhotoStreamApp.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'user_list.html',
      controller: 'UserListCtrl'
    }).
    when('/stream/:emailAddress', {
      templateUrl: 'photo_stream.html',
      controller: 'PhotoStreamCtrl'
    }).
    otherwise({
      redirectTo: '/'
    });
}]);

PhotoStreamApp.controller('PhotoStreamCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
  $scope.email = $routeParams.emailAddress;

  $http.get('/api/uploads?email='+$scope.email).then(function(response) {
    if(response.data.error) {
      return;
    }
    
    $scope.photos = response.data;
  });  
}]);

PhotoStreamApp.controller('UserListCtrl', ['$scope', '$http', function($scope, $http) {
  $http.get('/api/users').then(function(response) {
    if(response.data.error) {
      return;
    }
    
    $scope.accounts = response.data;
  });  
}]);