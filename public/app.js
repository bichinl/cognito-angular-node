'use strict';

angular.module("CAN", [])
	.factory("AWSmaker", function($q, $http) {
		return {
			reachCognito: function(uid){
				var defered = $q.defer();
				var promise = defered.promise;
				console.log("reachCognito with UserID: ", uid);
				$http.post("/simpleapi/aws",{"UserIDFromAngularApp": uid})
					.success(function(data){
						console.log("success: ", data);
						defered.resolve(data);
					}).error(function(error){
						console.log("error: ", error);
						defered.reject(error);
					});
				return promise;
			}
		}
	})
	.controller("ClientController", function(AWSmaker){
		var vm = this;

		vm.title = "Cognito Angular Node";

		vm.tryButtonClick = tryButtonClick;
		function tryButtonClick(uid){
			AWSmaker.reachCognito(uid)
				.then(function(result){
					vm.response = result;
				}, function errorHandler1(error){
					vm.response = error;
				}).catch(function errorHandler2(error){
					vm.response = error;
				});
		}

	});
