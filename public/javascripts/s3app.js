//for loading screen during ajax call
angular.module('SharedServices', [])
.config(function ($httpProvider) {
	$httpProvider.responseInterceptors.push('myHttpInterceptor');
	var spinnerFunction = function (data, headersGetter) {
		// todo start the spinner here
		//alert('start spinner');
		$('#myModal').modal('show');
		return data;
	};
	$httpProvider.defaults.transformRequest.push(spinnerFunction);
})
//register the interceptor as a service, intercepts ALL angular ajax http calls
.factory('myHttpInterceptor', function ($q, $window) {
	return function (promise) {
		return promise.then(function (response) {
//			do something on success
//			todo hide the spinner
//			alert('stop spinner');
			$('#myModal').modal('hide');
			return response;

		}, function (response) {
//			do something on error
//			todo hide the spinner
//			alert('stop spinner');
			$('#myModal').modal('hide');
			return $q.reject(response);
		});
	};
});

//end loading screen for ajax call


var app=angular.module('S3browserapp', ['SharedServices']);

app.controller('s3Controller', function($scope,$http,$compile,$timeout,$window) {
	$scope.orderByField = 'size';
	$scope.reverseSort = false;
	$scope.currentPage = 0;
	$scope.pageSize = 10;
	var counter=2; //counter for navigation string
	$scope.foldercontents;
	$scope.errorstatus=false;
	
	/*angular.element($window).bind('beforeunload', function() {
        //alert('hifwf');
		$http({
				async:false,
				url:"clearauthenticate",
				method:"POST"
				
		}).success(function(){
			alert('successfully done');
		});
		console.log("place ajax call here");
		console.log("how are you");
		console.log("how do you do");
		
	});*/
//	when click on table folder
	$scope.clickfn=function(para1){
		//alert(para1);	

		var currentfoldername=document.getElementById('cliable1').innerHTML;

		for(i=2; i<counter; i++){
			currentfoldername+=document.getElementById("cliable"+i).innerHTML;
		}

//		alert(currentfoldername);
		url="getobjects?mname="+currentfoldername+para1+"/";
		var status=$http.get(url);
		status.success( function(response) {
			$scope.errorstatus=false;

			var element=angular.element('<span id="cliable'+counter+'" ng-click="menufunc($event)" />');
			element.text(para1+"/");
			$("#currfolder").append(element);
			$("#cliable"+counter).addClass("styleclass");
			$compile(element)($scope);
			counter++;

			$scope.foldercontents = response;
			var bucket=$scope.foldercontents[($scope.foldercontents.length-1)].bucketName;
//			alert('bucket name'+ bucket);

			var folstr=$scope.foldercontents[($scope.foldercontents.length-1)].key;
//			alert(folstr);
			$scope.foldercontents.splice(($scope.foldercontents.length-1),1);
			if(folstr){
				var removeslash=folstr.substr(0,folstr.lastIndexOf("/"));
				$scope.folders=removeslash.split("/");
				var len=$scope.folders.length;
				var iter;
//				alert(len);
				for(iter=0; iter<len; iter++){
					$scope.foldercontents.push({key:$scope.folders[iter]});
				}
			}	
			$scope.numberOfPages=Math.ceil($scope.foldercontents.length/$scope.pageSize);                


			$scope.filter = function() {
				$timeout(function() { 
//					wait for 'filtered' to be changed
					/* change pagination with $scope.filtered */
					$scope.numberOfPages = Math.ceil($scope.filtered.length/$scope.pageSize);
				}, 10);
				$scope.currentPage=0;
			};
			$scope.search="";
			$scope.currentPage=0;
		});
		status.error(function(){
			$scope.errorstatus=true;
		});									
	};
//	when click on navigation url
	$scope.menufunc=function(event){
		var clickedstring=event.target.id;
		var num=parseInt(clickedstring.substr(clickedstring.length-1))
		var currentfoldername=document.getElementById('cliable1').innerHTML;
		var i;
		for(i=2; i<=num; i++){
			currentfoldername+=document.getElementById('cliable'+i).innerHTML;
		}

		url="getobjects?mname="+currentfoldername;
		var status=$http.get(url);
		status.success( function(response) {
			$scope.errorstatus=false;
			$scope.foldercontents = response;
			for(i=num+1; i<counter; i++){
				$("#cliable"+i).remove();
			}
			counter=num+1;
			var folstr=$scope.foldercontents[($scope.foldercontents.length-1)].key;
			$scope.foldercontents.splice(($scope.foldercontents.length-1),1);
			if(folstr){
				var removeslash=folstr.substr(0,folstr.lastIndexOf("/"));
//				alert('in if');
				$scope.folders=removeslash.split("/");
				var iter;
				var len=$scope.folders.length;
				for(iter=0; iter<len; iter++){
					$scope.foldercontents.push({key:$scope.folders[iter]});
				}
			}
			$scope.numberOfPages=Math.ceil($scope.foldercontents.length/$scope.pageSize);                


			$scope.filter = function() {
				$timeout(function() { 
//					wait for 'filtered' to be changed
					/* change pagination with $scope.filtered */
					$scope.numberOfPages = Math.ceil($scope.filtered.length/$scope.pageSize);
					$scope.currentPage=0;
				}, 10);

			};
			$scope.search="";
			$scope.currentPage=0;  
		});
		
		status.error(function(){
			$scope.errorstatus=true;
		});

	};


	$timeout(function() {
		angular.element('span.cmnasd').trigger('click');
	},0);            
});

//startfrom filter
app.filter('startFrom', function() {
	return function(input, start) {
		if (!input || !input.length) { return; } //checking if input is there or not
		start = +start; //parse to int
		return input.slice(start);
	}
});