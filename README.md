jqueryspy
=

Providing concise syntax for ajax tdd

See <a href="http://jqueryspy.com/">http://jqueryspy.com/</a> for further details:

What is JQuery Spy?
==

Jquery spy is a plugin to extend jquery, qunit and sinon.js providing developers a concise, elegant way to write / describe tests for test driven development (tdd)

Why do we need JQuery Spy?
==

The most important reason is to be able to test ajax in a ledgible way.
Secondly, to encourage testing by making it easier for every tom dick and harry javascript developer.

As a Developer, I want to test
==

As a Developer, I want to test the following in an easy to remember syntax:

* Test the $.ajax method was called
* Test ajax request url
* Test ajax request type
* Test ajax request dataType
* Test ajax response success method was called within a certain time
* After ajax response, test an element exists
* After ajax response, test an element style
* After ajax response, test an element contents

Without JQuery Spy Example
==

<pre>

test( "Test ajax and view", function () {

<strong>

//Prepare spy tests....	
   var intMaxAjaxWait = 4,	
   intExpectCount = 8,
   fnTestRequest = function(spyDetails){					
      ok($.ajax.calledOnce, 'ajax has been called ');		
      var ajaxParams = spyDetails.args[0];		
      //Run ajax request tests
      equals( ajaxParams.url, "/actions/jsonpproxy/?url=/actions/json.js" , 'ajax url');  
      equals( ajaxParams.dataType, "jsonp", 'ajax jsonp' ); 			
      equals( ajaxParams.type, "GET", 'ajax type' ); 

   },		
   fnTestResponse = function(spyDetails){	
//Collect data from spy and run response tests		
      ok(spyDetails, 'ajax success method completed under ' + intMaxAjaxWait + ' seconds.');
      ok( $('#someSelector').length, 'someSelector exists'); 
      equals( $('#someSelector').html(), 'Some code here...' , 'someSelector html'); 
      equals( $('#someSelector').css('visibility'), 'visible', 'someSelector visibility' );	
   };	

   var spyDetails = {returnValue:{status:null}},
   intStartTime = new Date().getTime(),
   fnTimer = function(){
      setTimeout(function(){
         var intEndTime = new Date().getTime(),
         intDifference = ((intEndTime - intStartTime) / 1000),					
         isMaxTimeElapsed = intDifference &gt; intMaxAjaxWait;	
         if(spyDetails.returnValue.status === 200){	
            fnTestResponse(spyDetails); 
            start();
         }else if(isMaxTimeElapsed){			
            fnTestResponse(null); 
            start();
         }else{
            fnTimer();
         }
      },100);	//test every 10th of a second.
   }

   expect(intExpectCount);
   this.spy($, 'ajax');
   stop();
   fnTimer();
</strong>

//Run original ajax method
   $.ajax({
      url:'/actions/jsonpproxy/?url=/actions/json.js',
         dataType:'jsonp',
         type:'GET',
         cache:'false',		
         success:function(data){		
            $('#qunit-fixture').html('&lt;div id="someSelector"&gt;Some code here...&lt;/div&gt;');
            $('#someSelector').css({'visibility':'visible'});
         }
   });		

<strong>	
//Collect data from spy and run request tests	
   spyDetails = $.ajax.getCall(0);
   fnTestRequest(spyDetails);	   
   </strong>
}); 
</pre>

With JQuery Spy Example:
==

<pre>
test( "Test ajax and view", function () { 
 	
<strong>	
//Prepare spy tests....	
   var spy = $.spy({
      ajax:{
         url:"/someUrl/",		 
         dataType:'jsonp',
         type:'GET',
         success:{
            views:[{
               el:'#someSelector',
               css:{'visibility':'visible'},
               html:'some code here...'					
            }]
        }
      }			
   });
   </strong>

//Run original ajax method
   $.ajax({
      url:'/actions/jsonpproxy/?url=/actions/json.js',
         dataType:'jsonp',
         type:'GET',
         cache:'false',		
         success:function(data){		
            $('#qunit-fixture').html('&lt;div id="someSelector"&gt;Some code here...&lt;/div&gt;');
            $('#someSelector').css({'visibility':'visible'});
         }
   });	
   <strong>
//Collect data from spy and run request tests
//Collect data from spy and run response tests
   spy.run();</strong>

});		 
</pre>
				
