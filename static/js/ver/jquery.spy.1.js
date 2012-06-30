// @Author: Steve Tomlin
// @Date: 11th June 2012
// @Version: 1
// @depends: jquery, qunit, sinon, sinon-qunit
// @licence: inherits from the above dependencies...

var jQuery = (typeof jQuery!=='undefined')?jQuery:{};


// @Module: $.spy
// @depends: jquery, qunit, sinon, sinon-qunit
(function($){
	var trace = function(str){try{console.log(str);}catch(err){}}
					
	$.spy = function(options){
		var sinonSpy = sinon.spy;
		return new Spy(sinonSpy, options);
	};
	var Spy = function(sinonSpy, options){
	//initialise all variables
	//note: dev can provide custom config options...
	
		this.model = {arr:[]};		//arr[{testName,expectKey, expectParam}] This collects all the tests excluding some hidden tests, like testing if ajax was called, or if a view exists before running other tests.
		this.strAjaxType = null; // This collects the top ajax name, whether it be: ajax, getJSON or some ajax method supplied. options:{[getJSON]:{}}		
		
		//used for: expect(model.arr.count + this.intExpectExtraPrivate + this.intExpectExtra)
		this.intExpectExtraPrivate = 0;
		
		//config options...		
		this.config = {};
		this.config.intExpectExtra = 0; //provided by user in config: used for: expect(model.arr.count + this.intExpectExtraPrivate + this.intExpectExtra)		
		this.config.intMaxWaitMS = 4000;//default		
		this.config.intAjaxInterval = 50;
					
		this.init(sinonSpy, options);
	};
	Spy.prototype = {
		strAjaxPossibles:',ajax,getJSON,',
		init:function(sinonSpy, options){
			//Collect the top method type:
			//$.spy({
			//	[ajax]:{
			//If it is ajax, or getJSON or some other ajax method return the type
			//Also, apply any custom configuration provided by the developer, like:
				//	intMaxAjaxWait = for ajax maximum wait time
				//	intExpectExtra = to catch a custom tests added via a success method..
			var strAjaxType = this.configAndGetAjaxType(options);		
			if(strAjaxType){
				this.strAjaxType = strAjaxType;
				
				//Apply sinon spy on the ajax type.
				//spy on ajax strAjaxType === 'ajax' or strAjaxType==='getJSON'
				sinonSpy($, strAjaxType );  
				
				//if ajax is used, add an additional number to the test count, because there is a hidden test
				//ok(isAjaxCalled, 'Ajax has been called.');
				this.intExpectExtraPrivate += 1;//tests ajax has been called.
			}
			//recurse all options and build an array of tests into this.model.arr
			this['init.recurseOptionsAndBuildTestArray'](options, 0, 'options');					
		},
		configAndGetAjaxType:function(options){
			var strAjaxPossibles = this.strAjaxPossibles,
			key,
			strAjaxType = null;
			for(key in options){
				if(key === 'config'){
					this.configCustom(options[key]);
				}else if(strAjaxPossibles.indexOf(',' + key + ',') !==-1 ){
					strAjaxType = key;
				}
			}
			
			//if intMaxWaitSeconds have been provided by the user, convert the seconds into milliseconds format and override the default intMaxWaitMS
			if(this.config.hasOwnProperty('intMaxWaitSeconds')){
				this.config.intMaxWaitMS = this.configMaxWaitMS(this.config.intMaxWaitSeconds);
			}
			
			return strAjaxType;
		},
		configCustom:function(options){
		//allow defaults to be overrident by custom parameters supplied when instantiating instance of spy.
		//example: intMaxAjaxWait;
			var i;			
			for(i in options){		
				this.config[i] = options[i];				
			}
		},
		configMaxWaitMS:function(intSec){
			return (intSec * 1000);
		},		
		'init.recurseOptionsAndBuildTestArray':function(optionsEach, intLevel, strParent){
			var key;
			for(key in optionsEach){
				if(optionsEach.hasOwnProperty(key) && !(strParent === 'options' && key ==='config')){

					
					if(key === 'views'){
					//if the options key === views
						//add an extra test count that detects if the element exists
							//ajax.views
								//ok(el.length, 'element ' + strEl + ' exists');
						//then count the items in the view to add to the test count.
							//example = 3:
							//views:[{
							//	el:'#someSelector',
							//	css:{'visibility':'visible'},
							//	html:'Some code here...'					
							//}]
							
							//total 4
						//Exclude 1 for the match on views.
						//When  spyTests.ajax() method is run, arrTests = [ajax, views]
						//the expect count will add the length of arrTests.
						//We don't do a test on views, instead we do a test on view length. [{},]
						this.intExpectExtraPrivate -=1; 
						var intLen = util.recurseArrObj(optionsEach[key]);
						this.intExpectExtraPrivate += intLen;	

					}
				
					this['model.build'](key, optionsEach, intLevel, strParent);					
					var item = optionsEach[key];
					
					if(typeof item ==='object'){																
						this['init.recurseOptionsAndBuildTestArray'](item, intLevel + 1, key);
					}
				}
			}
		},
		'model.build':function(expectKey, obj, intLevel, strParent){
	
			//var strTestName = this['model.getTestName'](expectKey, intLevel, strParent);			
			//if(spyTests.hasOwnProperty(strTestName)){
			if(spyTests.hasOwnProperty(expectKey)){
			//if spyTests[expectKey]
				//push the test.function into the model array for running later.
				//this.model.arr.push(spyTests[ref]);//push the ref and the value.
				//this.model.arr.push({testName:strTestName, expectKey: expectKey, expectParam:obj[expectKey]});
				this.model.arr.push({testName:expectKey, expectKey: expectKey, expectParam:obj[expectKey]});			
			}else if(spyTests.hasOwnProperty('ajax.' + expectKey)){		
			//else if spyTests['ajax.' + expectKey]
				//handle ajax.views etc... which will come under ajax.success, therefore its parent won't be ajax
				this.model.arr.push({testName:'ajax.' + expectKey, expectKey: expectKey, expectParam:obj[expectKey]});
				
			}else if(this.strAjaxPossibles.indexOf(','+strParent+',')!==-1){//is parent ajax or getJSON etc...
			//else if !spyTests['ajax.' + expectKey] && strParent === 'ajax' 
				//run ajaxCatchAll
				//get options provided by user and upate.				
				this.model.arr.push({testName:'ajaxCatchAll', expectKey: expectKey, expectParam:obj[expectKey]});					
			}
		},/*
		'model.getTestName':function(expectKey, intLevel, strParent){
			//if(strParent ==='ajax'){
			var strAjaxPossibles = this.strAjaxPossibles;
			if(strAjaxPossibles.indexOf(',' + strParent + ',')!==-1){
				return 'ajax.' + expectKey; //this['model.mapTest'](expectKey, intLevel, strParent);
			}
			return expectKey;
		},*/
		run:function(){
			if(this.strAjaxType){
				//if the top item is ajax
				//do not run all the tests
				//instead extract the first item from the array - ie the ajax method
				// and pass the rest of the array into the ajax method, for later running.
				
				var arrTests = this.model.arr,
				item1 = arrTests.shift();//remove the first item from the array
				
				var testName1 = item1['testName'],
				expectKey1 = item1['expectKey'],
				expectParam1 = item1['expectParam'],				
				fnTest1 = spyTests[testName1],
				sinonAjaxData = $.ajax.getCall(0);
			
				var intExpectExtra = this.intExpectExtraPrivate + this.config.intExpectExtra;
				
				fnTest1(arrTests, this, sinonAjaxData, expectKey1, expectParam1, intExpectExtra);//just run the top test. Ajax will handle the rest.
			}else{
				//collect ajax response
				//run tests...
				var arr = this.model.arr;
				runTests(arr);
			}
		}
	}
	
	var spyTests = {
	
		'getJSON':function(){
		//note: when this method runs, you might want to config custom changes to the ajax method
		//like: 'Ajax has been called' to 'getJSON has been called' etc...
			spyTests.ajax.apply(this,arguments);
		},
		'ajax':function(arrTests, inst, sinonAjaxData, expectKey, params, intExpectExtraPrivate){
		//TESTS 1: ajax has been called

			var intMaxWaitMS = inst.config.intMaxWaitMS,
			intAjaxInterval = inst.config.intAjaxInterval,
			isAjaxCalled = $.ajax.calledOnce;
						
			ok(isAjaxCalled, 'Ajax has been called.');
						
			if(!isAjaxCalled){return;}
			
						
			var intExpects = arrTests.length + intExpectExtraPrivate;// plus one for ajax call.			
			expect(intExpects);		
			stop();		
			/*
			$('body').ajaxComplete( function(){		
				//oncomplete				
				//trace('body changed - call an ajaxComplete method.');
				//trace('oncomplete - status = ' + sinonAjaxData.returnValue.status);			
				//equals( $('#someSelector').html(), 'Some code here...' ); 
				//equals( $('#someSelector').css('visibility'), 'visible' ); 				
				runTests(arrTests, sinonAjaxData);				
				start();
			});	
			*/		
			//TESTING WHEN AJAX HAS COMPLETE
			//INSTEAD USE THE ajaxComplete method on the body.
			var intStartTime = new Date().getTime(),
			fnTimer = function(){
				setTimeout(function(){
			
					var intEndTime = new Date().getTime(),
					intDifference = ((intEndTime - intStartTime)),					
					isMaxTimeElapsed = (intDifference > intMaxWaitMS);
				
					if(sinonAjaxData.returnValue.status === 200){	
						runTests(arrTests, sinonAjaxData);
						start();
						fnReset();
					}else if(isMaxTimeElapsed){			
						spyTests['ajax.incomplete'](intMaxWaitMS);
						start();
						fnReset();
					}else{
						fnTimer();
					}				
				},intAjaxInterval);	//test every 50 milliseconds.
			},
			fnReset = function(){
				//sinon.reset($);
			}
			fnTimer();
		},

		'ajax.incomplete':function(intMaxWaitMS){		
			ok(false, 'Ajax exceeded time limit of ' + intMaxWaitMS + ' milliseconds.');
		},
		'ajax.success':function(sinonAjaxData, expectKey, expectParam){

		//TESTS 1: responded succesfully		
			ok(true, 'ajax responded successfully');
			if(typeof expectParam === 'function'){
				expectParam();
			}
		},
		ajaxCatchAll:function(sinonAjaxData, expectKey, expectParam){//url, dataType, cache, jsonP etc...

		//TESTS EACH OPTION SUPPLIED TO AJAX
			var actual = sinonAjaxData.args[0][expectKey];
			//allow case insensitive
			if(expectParam!==''){
				var strAnyCase = ',get,jsonp',
				regSearch = RegExp('\\,' + util.encodeReg(expectParam) + '\\,','g');
				if(strAnyCase.search(regSearch)!==-1){
					actual = actual.toLowerCase();
					expectParam = expectParam.toLowerCase();
				}
			}
			//assert			
			equals( actual, expectParam,' Ajax options: ' + expectKey); 					
		},
		'ajax.views':function(sinonAjaxData, expectKey, expectParam){		
		//TEST Element Exists	
			//loop each
			for(var i=0, intLen = expectParam.length; i < intLen; ++i){
				var item = expectParam[i];
				var strEl = item.el;	
				if(strEl){
					var el = $(strEl);//requires jquery
					//test element exists
					//test element against each parameter...
				
					ok(el.length, 'element ' + strEl + ' exists');
					spyTests['ajax.views.each'](el, item);
				}else{
					ok(false,'property el not provided for view ' + i);
				}
			}
		},		
		'ajax.views.each':function(el, obj){
		//test: each property per view	
			var strJqueryMethod, isEL = true;//first item is el, exclude...
			//exclude first item = el
			for(strJqueryMethod in obj){					
				if(isEL){isEL = false; continue;}
				var whatExpect = obj[strJqueryMethod];
				if(typeof whatExpect === 'object'){//example if css:{visibility:visible, color:red} etc...
					spyTests['ajax.views.each.objectAsValue'](el, whatExpect, strJqueryMethod);
				}else if(util.isVarLiteral(whatExpect)){//string, boolean, number etc - NOT function/array/object/constructor/reg/any other object type/
					//only variable literals..											
					if(!el[strJqueryMethod]){
						trace('this is not supported el[' + strJqueryMethod + ']()');
						continue;
					}
					spyTests['ajax.views.each.whatInMethod'](el, strJqueryMethod, whatExpect );
					
				}else{
					trace('this is not supported = el[' + strJqueryMethod + ']()');
				}
			}				
				
		},	
		'ajax.views.each.whatInMethod':function(el, strJqueryMethod, whatExpect ){
			//example: .hasClass(param), etc...
			//or .html(), .outerHTML(),
			var strActual, strExpect, strType = '';
			strNoParamSupplied = ',html,';
			
			if(strNoParamSupplied.indexOf(',' + strJqueryMethod + ',')!==-1){
				strActual = el[strJqueryMethod]();
				strExpect = whatExpect;
				strType = ' el[' + strJqueryMethod + ']()';
			}else{
				strActual = el[strJqueryMethod](whatExpect);
				strExpect = true;
				strType = ' el[' + strJqueryMethod + ']('  + whatExpect + ')';
			}						
			//single test per element
			equals(strActual, strExpect,'view ' + strType + ' === ' + strExpect);
		},	
		'ajax.views.each.objectAsValue':function(el, whatExpect, strJqueryMethod){
			//testing css for example
			//css:{
				//visibility:visible,
				//color:green
			//}
		//test: each objectAsValue property 
			//iterate over each property
			var expectKey, strActual, strExpect;
			for(expectKey in whatExpect){	
				
				strExpect = whatExpect[expectKey];
				if(!util.isVarLiteral(strExpect)){
					trace('This is not supported =  el[' + strJqueryMethod + '](' + expectKey + ')');
					continue;
				}
				/*
				//match all posssible ajax combinations.
				if(spyTests['$.' + strJqueryMethod]){
					return spyTests['$.' + strJqueryMethod]();
				}
				*/
				
				if(!el[strJqueryMethod]){
					trace('el.'+strJqueryMethod + '() does not exist');
					ok(false, 'el.'+strJqueryMethod + '() does it exist?');
					continue;
				}
				strActual = el[strJqueryMethod](expectKey);
				
				//multiple tests per element...
				equals(strActual, strExpect,'view el.' + strJqueryMethod + '(' + expectKey + ') === ' + strExpect);
			}			
		},
		'$.hasClass':function(){
			
		}
	}
	//end spyTests...
	
	var runTests = function(arrTests){//,sinonAjaxData
		var sinonAjaxData = (arguments.length > 1)?arguments[1]:null;
		for(var i = 0, intLen = arrTests.length; i < intLen; ++i){
			//arrTests[i](sinonAjaxData);//call tests
			var item = arrTests[i],
			testName = item['testName'],
			expectParam = item['expectParam'],
			expectKey = item['expectKey'],
			fnTest = spyTests[testName];
			
			fnTest(sinonAjaxData, expectKey,  expectParam);
		}
	}	
	var util = {
		encodeReg:function(str){
			return (''+str).replace(/([^\w\d\s])/g,'\\'+'$1');
		},
		isVarLiteral:function(item){
			return (typeof item === 'string' || typeof item === 'boolean'  || typeof item === 'number');
		},
		recurseArrObj:function(arr){
			var obj, i, intCount = 0;
			for(var a=0, intLen = arr.length; a < intLen;++a){
				obj = arr[a];
				//iterate over every array item
				intCount = util['recurseArrObj.recurseObj'](obj, intCount);
			}
			return intCount;
		},
		'recurseArrObj.recurseObj':function(obj, intCount){
			for(i in obj){
				if(obj.hasOwnProperty(i)){							
					var item = obj[i];
					if(typeof item ==='object'){
						intCount = util['recurseArrObj.recurseObj'](item, intCount);
					}else{
						++intCount;			
					}
				}
			}	
			return intCount;
		}
	}
	
	$.spy = $.spy;
})(jQuery);