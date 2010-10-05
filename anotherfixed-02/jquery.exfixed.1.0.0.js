(function($j){
	$j.ex=$j.ex||{};
	$j.ex.fixed = function(target,cfg){
		var cfg=cfg||{};
		if(!$j.browser.msie || ($j.browser.version > 6.0 && $j.boxModel)){
			target.css('position','fixed');
			target.css(cfg);
			return;
		}
		this.cfg={target:target.css('position','absolute')};
		this
		.adjustBackground()
		.adjustPosition(0,cfg)
		.adjustPosition(1,cfg);
	};
	$j.extend($j.ex.fixed.prototype,{
		parseSize:function(val,xFlg){
			var o=this,c=o.cfg;
			if(val=='auto')return val;
			if((val+'').indexOf('%')<0)return parseInt(val)||0;
			var cSize=c.container.attr(xFlg?'clientWidth':'clientHeight');
			return Math.round(cSize*parseInt(val)/100);
		},
		parseIntSize:function(val,xFlg){
			return parseInt(this.parseSize(val,xFlg))||0;
		},
		adjustBackground:function(){
			var o=this,c=o.cfg;
			c.container=$j.boxModel?$j('html'):$j('body');
			if(c.container[0].exFixedAjustBackground)return o;
			c.container[0].exFixedAjustBackground=1;
			var img=c.container.css('background-image');
			if(img=='none'){
				c.container.css({'background-image':'url(null)'})
			}
			else
			if($j.boxModel){
				c.container.css({'background-image':'url(null)'})
				$j('body').css({'background-image':img})
			}
			c.container.css({
				'background-attachment':'fixed'
			});
			return o;
		},
		adjustPosition:function(xFlg,cfg){
			var o=this,c=o.cfg;
			var at = [
				{size:'height',pos1:'top',pos2:'bottom'},
				{size:'width',pos1:'left',pos2:'right'}
			][xFlg]
			var cs=c.target.attr('currentStyle');
			c[at.size]=cs[at.size];
			c[at.pos1]=cs[at.pos1];
			c[at.pos2]=cs[at.pos2];
			for(var i in at){
				var name=at[i];
				if(cfg[name]!=undefined)c[name]=cfg[name];
				at[i.slice(0,1).toUpperCase()+i.slice(1)]
					= name.slice(0,1).toUpperCase()+name.slice(1);
			}
			if(c[at.pos1]!='auto') c[at.pos2]='auto';
			else c[at.pos1]='auto';

			var css={};
			css[at.size]=o.parseSize(c[at.size],xFlg)
			css[at.pos1]=o.parseSize(c[at.pos1],xFlg)
			css[at.pos2]=o.parseSize(c[at.pos2],xFlg)
			c.target.css(css);

			var pos=c.target.position()[at.pos1];
			c.target[0]['exFixed'+at.Pos1]=pos<0?0:pos;
			c.target[0].style.setExpression(at.pos1,
				'this.exFixed'+at.Pos1+' \
				+(document.body.scroll'+at.Pos1+'||document.documentElement.scroll'+at.Pos1+') + "px"'
			);

			var resizeTimer;
			$j(window).resize(function(){
				if(resizeTimer)clearTimeout(resizeTimer);
				resizeTimer = setTimeout(function(){
					c.target.css(at.size,o.parseSize(c[at.size],xFlg))
					if(c[at.pos2]=='auto'){
						c.target[0]['exFixed'+at.Pos1]=o.parseSize(c[at.pos1],xFlg);
					}
					else{
						c.target[0]['exFixed'+at.Pos1]=
						c.container.attr('client'+at.Size)
						-o.parseIntSize(c[at.size],xFlg)
						-o.parseIntSize(c[at.pos2],xFlg)
						-o.parseIntSize(c.target.css('border-'+at.pos1+'-width'),xFlg)
						-o.parseIntSize(c.target.css('border-'+at.pos2+'-width'),xFlg)
						-o.parseIntSize(c.target.css('padding-'+at.pos1),xFlg)
						-o.parseIntSize(c.target.css('padding-'+at.pos2),xFlg)
						-o.parseIntSize(c.target.css('margin-'+at.pos1),xFlg)
						-o.parseIntSize(c.target.css('margin-'+at.pos2),xFlg)
					}
				},0);
			})
			return o;
		}
	});
	$j.fn.exFixed = function(cfg){
		var o=this;
		return o.each(function(idx){
			new $j.ex.fixed(o.eq(idx),cfg);
		});
	}
})(jQuery);

