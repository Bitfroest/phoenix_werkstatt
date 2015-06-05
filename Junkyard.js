angular.module('junk',['ui.bootstrap'])
.controller('Junkyard', ['$scope', '$filter' , 'dateFilter', '$http', '$interval', '$log', function($scope, $filter, dateFilter, $http, $interval, $log){
	
	$scope.format = 'yyyy-MM-dd HH:mm:ss'; //2015-06-03 11:31:05
	
	$scope.time = new Date().getTime();
	
	$scope.name = "";
	
	$scope.changedName = function () {
		$log.log($scope.name);
		$scope.firstname = $scope.name.split(' ')[0];
		$scope.lastname = $scope.name.split(' ')[1];
	}
	
	var t = $interval(function(){
		$scope.time = new Date().getTime();
		getPersons();
	}, 60000); // update each minute
	
	
	$scope.calc = function (person){
		//$log.log($scope.time);
		var timeToOffline = Math.floor((new Date(person.onlinetill) - $scope.time)/(1000 * 60));
		if(timeToOffline <= 0){
			timeToOffline = 0;
		}
		return (timeToOffline);
	};
	
	function getPersons () {
		// Simple GET request example :
		$http.get('/update.php?persons').
			success(function(data, status, headers, config) {
				// this callback will be called asynchronously
				// when the response is available
				$scope.persons = angular.fromJson(data);
			}).
			error(function(data, status, headers, config) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
	}
	getPersons();
	
	function getPerson (person) {
		// Simple GET request example :
		$http.get('/update.php?person='+person.id).
			success(function(data, status, headers, config) {
				// this callback will be called asynchronously
				// when the response is available
				var newPerson = angular.fromJson(data);

				var length = $scope.persons.length;
				for(var i = 0; i< length;i++){
					if($scope.persons[i].id == person.id){
						$scope.persons[i] = newPerson[0];
						return;
					}
				}
				
			}).
			error(function(data, status, headers, config) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
	}
	/*
	$scope.persons = [
	{name: 'Fabian Schurig', time: 5, setTime: 30}, {name: 'Hans Kirchner', time: 2, setTime: 30}, {name: 'Philipp Schmette', time: 6, setTime: 30}
	];
	*/
	
	$scope.addName = function () {
		$http.post('/update.php?add', {firstname : $scope.firstname, lastname : $scope.lastname}).
			success(function(data, status, headers, config) {
				// this callback will be called asynchronously
				// when the response is available
				//$log.log(data);
			}).
			error(function(data, status, headers, config) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
			getPersons();
	};
	
	$scope.addTime = function (person) {
		// Simple POST request example (passing data) :
		$http.post('/update.php?time', {id : person.id, minutes: person.setTime}).
			success(function(data, status, headers, config) {
				// this callback will be called asynchronously
				// when the response is available
				//$log.log(data);
			}).
			error(function(data, status, headers, config) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
			getPerson(person);
	};
	
	
	$scope.nulTime = function (person) {
		// Simple POST request example (passing data) :
		$http.post('/update.php?reset', {id : person.id}).
			success(function(data, status, headers, config) {
				// this callback will be called asynchronously
				// when the response is available
				//$log.log(data);
			}).
			error(function(data, status, headers, config) {
				// called asynchronously if an error occurs
				// or server returns response with an error status.
			});
			getPersons();
	};
	
	$scope.setTime = function (person,time) {
		if(person.setTime != null){
			person.setTime = parseInt(person.setTime) + time;
		}else {
			person.setTime = time;
		}
	}
	
	
	$scope.countdown = function (person) {
		
		if (angular.isDefined(person.stop)) return;
		
		person.stop = $interval(function(){
			
			if(person.time > 0){
				person.time = person.time - 1;
			} else {
				$scope.stopCountdown(person);
			}
			
		},1000);
		
	};
	
	$scope.stopCountdown = function (person) {
		if (angular.isDefined(person.stop)) {
            $interval.cancel(person.stop);
            person.stop = undefined;
          }
	};
}])
// Register the 'myCurrentTime' directive factory method.
// We inject $interval and dateFilter service since the factory method is DI.
.directive('myCurrentTime', ['$interval', 'dateFilter',
function($interval, dateFilter) {
	// return the directive link function. (compile function not needed)
	return function(scope, element, attrs) {
	  var format,  // date format
		  stopTime; // so that we can cancel the time updates

	  // used to update the UI
	  function updateTime() {
		element.text(dateFilter(new Date(), format));
	  }

	  // watch the expression, and update the UI on change.
	  scope.$watch(attrs.myCurrentTime, function(value) {
		format = value;
		updateTime();
	  });

	  stopTime = $interval(updateTime, 1000);

	  // listen on DOM destroy (removal) event, and cancel the next UI update
	  // to prevent updating time after the DOM element was removed.
	  element.on('$destroy', function() {
		$interval.cancel(stopTime);
	  });
	}
}]);