function Card (number, suit) {
	this.number = number;
	this.suit = suit;
	this.HTML = "<img class='card' id='"+suit+"_"+number+"' src='pics/"+suit+"/"+number+".png'/>";
	var that = this;
	this.disableDragging = function() {
		var id = "#" + $(that.HTML).attr("id");
		$(id).draggable("disable");
	}
}