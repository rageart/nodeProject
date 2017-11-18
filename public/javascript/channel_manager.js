var chManger = (function() {
    
    'use strict';
    var doing = [];

	var addUser = function (userInfo) {
		var obj = {};
		obj.DOING = "add";
		obj.DEV_KEY = userInfo.DEV_KEY;
		obj.DEV_NM = userInfo.DEV_NM;
		obj.DEV_DEPT_NM = userInfo.DEV_DEPT_NM;
		obj.CHANNEL_NM = userInfo.CHANNEL_NM;
		obj.MOBILE_NUM = userInfo.MOBILE_NUM;
		
		validObj(obj);

		if(chResult=='00') {
			doing.push(obj);
		}
	};
	
	var deleteUser = function (userInfo) {
		var obj = {};
		obj.DOING = "delete";
		obj.DEV_KEY = userInfo.DEV_KEY;

		validObj(obj);

		if(chResult=='00' || chResult!='88') {
			doing.push(obj);
		}
    };
    
    var changeManger = function (userInfo) {
		var obj = {};
		obj.DOING = "change";
		obj.DEV_KEY = userInfo.DEV_KEY;
		obj.LEVEL = userInfo.LEVEL;
		obj.CHANNEL_NM = userInfo.CHANNEL_NM;

		validObj(obj);

    	if(chResult=='00') {
			doing.push(obj);
		}
    };
	
	var validObj = function(obj) {
		for(var i=0; i<doing.length; i++) {
			if((doing[i].DOING==obj.DOING) && (doing[i].DEV_KEY==obj.DEV_KEY)) {
				chResult = '99';
				break;
			}
			if((doing[i].DEV_KEY==obj.DEV_KEY) && (doing[i].DOING=="add" && obj.DOING=="delete")) {
				doing.splice(i, 1);
				chResult = '88';
				break;
			} 
			if(obj.DOING=="change" && doing[i].LEVEL==2) {
				doing.splice(i, 1);
				chResult = '00';
				break;
			}
			if(obj.DOING=="delete" && (doing[i].DEV_KEY==obj.DEV_KEY)) {
				doing.splice(i, 1);
				break;
			}
		}
	}

    var getChangeInfo = function () {
    	return doing;
    };
	
	var setDefault = function() {
		doing = [];
	}

    var run = function() {
		for (var i = 0; i < doing.length; i++) {
			console.log(doing[i]);
			if (doing[i].DOING === "add") {
				console.log("add request");
				common_list.ajaxRequest('/channel/'+doing[i].DEV_KEY, 'post', doing[i]);
			} else if (doing[i].DOING === "delete") {
				console.log("delete request");
				common_list.ajaxRequest('/channel/'+doing[i].DEV_KEY, 'delete', doing[i]);
			} else if (doing[i].DOING === "change") {
				console.log("change request");
				common_list.ajaxRequest('/channel/'+doing[i].DEV_KEY, 'put', doing[i]);
			}
		}
		doing = [];
   	};
    
	return {
    	addUser : addUser,
    	deleteUser : deleteUser,
		changeManger : changeManger,
		validObj : validObj,
		getChangeInfo : getChangeInfo,
		setDefault : setDefault,
		run : run,
    };
})();
