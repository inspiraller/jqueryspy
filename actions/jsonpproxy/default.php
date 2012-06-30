<?php
//you can call this page direct with the following code:
//http://wlukmob/actions/jsonpproxy/?callback=jsonp&url=http://ns0197-03.int.westgroup.com:9002/maf/api/v1/authenticate.json&uid=9001101&pwd=mafap1
 
 //If error Notice: Undefined index: callback in C:\websites\wlukmob\www\actions\jsonpproxy\default.php on line 5
 //make sure you are calling this url with jsonp.
 
 
 
    $callback = $_GET['callback'];
		
	//add extra paramters
	$qs = $_SERVER['QUERY_STRING'];
	$qs = preg_replace('/(^|&)callback=[^=]*(&|$)/i', '${1}', $qs);
	$qs = preg_replace('/(^|&)url=[^=]*(&|$)/i', '${1}', $qs);
	
    $url = $_GET['url'] . '?' . $qs; 		

    if(!preg_match('/^[\w]+$/',$callback)||!preg_match('/^(http:\/\/|localhost|\/).+$/',$url)) exit;

	

    header('Content-type: text/javascript');
    header("Cache-Control: no-cache, must-revalidate");
 

	//combine root
	$docRoot = '../..';//note, jsonpproxy lives in /actions/jsonpproxy/ so we have to step back 2 directories to get to the root.	
	//remove ending question mark if no paramters supplied.
	$url = preg_replace('/\?$/','', $url);
	$page = file_get_contents($docRoot . $url);
    $source = preg_replace('/(\\n|\\r)/', '', $page);
 
    // OUTPUT JSONP:
    echo $callback;
    echo '({';
    echo '\'source\': ';
	
	//remove quotes around json object. Whats the point. The javascript would have to eval it anyway. It's still dangerous either way.
	
  //  echo '\'' . $source . '\'';
  
    echo  $source ;
	
    echo '});';		
 
?>