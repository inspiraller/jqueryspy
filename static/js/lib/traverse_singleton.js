//convert a singleton to a traversable object
var singleton  = {
	grand:{
		parent:{
			child1:[1,2,10,20],
			child2:'stephens'
		}
	}
}
(function(){
	var traversable = function(data){	
		return new TRAV(data);
	}
	var TRAV = function(data){
		this.data = data;	
	}
	TRAV.prototype = {
		parent:function(){
			
		}
	};
})();

var inst = traversable(singleton);