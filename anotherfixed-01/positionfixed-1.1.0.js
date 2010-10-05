(function($j){
	$j.positionFixed = function(el){
		$j(el).each(function(){
			new fixed(this)
		})
		return el;					
	}
	$j.fn.positionFixed = function(){
		return $j.positionFixed(this)
	}
	var fixed = $j.positionFixed.impl = function(el){
		this.target = $j(el).css('position','fixed')
		if(!this.ie6)return;
		this.bindEvent();
	}
	$j.extend(fixed.prototype,{
		ie6 : $.browser.msie && $.browser.version < 7.0,
		bindEvent : function(){
			var target=this.target;
			target
			.css('position','absolute')
			.basePos = {
				top: parseInt(target.css('top')) || 0,
				left: parseInt(target.css('left')) || 0
			}
			target.parents().each(function(){
				var o = $j(this);
				if (o.css('position') == 'relative') 
					o.after(target)
			})
			$j(window).scroll(this.scrollEvent());
		},
		scrollEvent : function(){
			var target=this.target;
			return function(){
				target.css({
					top: $j(document).scrollTop() + target.basePos.top,
					left: $j(document).scrollLeft() + target.basePos.left
				})
			}
		}
	})
})(jQuery)




