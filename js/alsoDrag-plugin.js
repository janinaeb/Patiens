// Stolen from user 'mouquette' on jquerys forum:  https://forum.jquery.com/topic/dragging-a-group-of-items-alsodrag-like-alsoresize
// Modified: What elements that are being 'alsoDragged' when element is dragged on line 35-36. Originally is variable 'exp' in each-function on line 36 instead of 'next' and line 35 is deleted.
$.ui.plugin.add("draggable", "alsoDrag", {
	start: function() {
		var that = $(this).data("ui-draggable"),
			o = that.options,
			_store = function (exp) {
				$(exp).each(function() {
					var el = $(this);
					el.data("ui-draggable-alsoDrag", {
						top: parseInt(el.css("top"), 10),
						left: parseInt(el.css("left"), 10)
					});
				});
			};

		if (typeof(o.alsoDrag) === "object" && !o.alsoDrag.parentNode) {
			if (o.alsoDrag.length) { o.alsoDrag = o.alsoDrag[0]; _store(o.alsoDrag); }
			else { $.each(o.alsoDrag, function (exp) { _store(exp); }); }
		} else{
			_store(o.alsoDrag);
		}
	},
	drag: function () {
		var that = $(this).data("ui-draggable"),
			o = that.options,
			os = that.originalSize,
			op = that.originalPosition,
			delta = {
				top: (that.position.top - op.top) || 0, 
				left: (that.position.left - op.left) || 0
			},

			_alsoDrag = function (exp, c) {
				var next = $(that.element).nextAll();
				$(next).each(function() {
					var el = $(this), start = $(this).data("ui-draggable-alsoDrag"), style = {},
						css = ["top", "left"];

					$.each(css, function (i, prop) {
						var sum = (start[prop]||0) + (delta[prop]||0);
						style[prop] = sum || null;
					});

					el.css(style);
				});
			};

		if (typeof(o.alsoDrag) === "object" && !o.alsoDrag.nodeType) {
			$.each(o.alsoDrag, function (exp, c) { _alsoDrag(exp, c); });
		} else{
			_alsoDrag(o.alsoDrag);
		}
	},
	stop: function() {
		$(this).removeData("draggable-alsoDrag");
	}
});
