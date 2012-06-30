<!DOCTYPE html>
<html>
    <head>
		<title>Jquery Spy &gt; Tutorials &gt; 8</title>		   
		<meta name="viewport" content="width=device-width, initial-scale=1"/> 
		<link rel="stylesheet" type="text/css" href="/static/css/jquery.spy.css"/>
    </head>
    <body>    	
		<div id="all">
			<div id="header">
				<div class="title"><h1><a href="/" title="About"><span class="jquerySpy">JQuery</span> Spy </a></h1></div>
			</div>
			<div id="row">
				<div id="aside">
					<div id="nav">
						
						<ul>
							<li class="first"><a href="/" title="About">About</a></li>
							<li class="selected"><a href="/tutorials/">Tutorials</a>
<?php
function getRoot($strPath){
	$strPathFull = $_SERVER['SCRIPT_FILENAME'];
	$arrPathSmall = explode('wwwroot',$strPathFull);
	$strRoot = $arrPathSmall[0] .= 'wwwroot'; 
	return $strRoot . preg_replace('/\//','\\',$strPath);
}
include(getRoot('/includes/tutorial_nav.php')); ?>      

							</li>
							<li><a href="/reference/">Reference</a></li>
							<li><a href="/download/">Download</a></li>
							<li class="last"><a href="/contact/">Contact</a></li>
						</ul>
					</div>
				</div>
				<div id="main">
					<h2>Test ajax and test an element and its html on success</h2>
					<div class="mod">
						<p>Click to view <a href="/tutorials/8/example.htm" target="_blank">Demo</a></p>
<h3>Demo HTML:</h3>						
						<code>
&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;	   

	&lt;link rel="stylesheet" href="/static/css/qunit.css" /&gt;
	&lt;link rel="stylesheet" href="/static/css/qunit.custom.css" /&gt;

	&lt;script src="/static/js/lib/qunit.js"&gt;&lt;/script&gt;
	&lt;script src="/static/js/lib/sinon.js"&gt;&lt;/script&gt;
	&lt;script src="/static/js/lib/jquery.js"&gt;&lt;/script&gt;
	&lt;script src="/static/js/lib/jquery.spy.current.js"&gt;&lt;/script&gt;
	&lt;script&gt;
		test("Test ajax and test an element and its html on success", function () {
			var spy = $.spy({
				ajax:{
					success:{
						views:[{
							el:'#someSelector',
							html:'Some code here...'
						}]
					}
				}
			});
			$.ajax({
				url:'/actions/text.htm',
				success:function(){
					$('#qunit-fixture').html('&lt;div id="someSelector"&gt;Some code here...&;t;/div&gt;');
				}
			});
			spy.run();	
		});
	&lt;/script&gt;
&lt;/head&gt;
&lt;body&gt;
	&lt;div id="qunitPanel"&gt;
		&lt;h1 id="qunit-header"&gt;QUnit Test Suite&lt;/h1&gt;
		&lt;h2 id="qunit-banner"&gt;&lt;/h2&gt;
		&lt;div id="qunit-testrunner-toolbar"&gt;&lt;/div&gt;
		&lt;h2 id="qunit-userAgent"&gt;&lt;/h2&gt;
		&lt;ol id="qunit-tests"&gt;&lt;/ol&gt;
		&lt;div id="qunit-fixture"&gt;test markup&lt;/div&gt;
	&lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;

						</code>
					
					</div>
				</div><!-- end main -->
			</div><!-- end row -->
			
			<div id="footer">
				<p>Website by STCreative ltd.</p>
				<ul>
					<li class="first"><a href="/contact/">Contact</a></li>
				</ul>
			</div>
		</div><!-- end all -->
	 <script type="text/javascript" src="/static/js/global.js"></script>
</body>
</html>


