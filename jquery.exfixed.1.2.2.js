/*
 * 	exFixed 1.2.2 - jQuery plugin
 *	written by Cyokodog	
 *
 *	Copyright (c) 2009 Cyokodog (http://d.hatena.ne.jp/cyokodog/)
 *	Dual licensed under the MIT (MIT-LICENSE.txt)
 *	and GPL (GPL-LICENSE.txt) licenses.
 *
 *	Built for jQuery library
 *	http://jquery.com
 *
 */

(function($j){

	$j.ex = $j.ex || {};
	var ex = $j.extend({},$j.ex);

	/*
	 * 	ex.defineExPlugin 2.0
	 */
	ex.defineExPlugin = function( pluginName , constr , param){
		$j.fn[ pluginName ]=
			function( config , callback ){
				var o = this,arr = [];
				p = param ||{
					eachTarget : true
				};
				if(p.eachTarget)
					o.each(function( idx ){
						arr.push(new constr( o.eq(idx) , config ));
					});
				else
					arr.push(new constr( o , config ));
				var obj = $j(arr);
				for(var i in constr.prototype)( function(i){
					if(i.slice(0,1)!= '_'){
						obj[i] = function(){
							return obj[0][i].apply( obj[0] , arguments );
						};
					}
				})(i);
				obj.target = function(){ return o };
				o['get'+pluginName.substr(0,1).toUpperCase()+pluginName.substr(1)] = function(){
					return obj;
				};
				if(typeof callback == 'function')obj.each(callback);				
				return this;
			};
	};
	ex.scrollEvent = function( target , config ){
		var o = this;
		if( typeof config == 'function') config = {
			callback : config
		}
		var c = o.config = $j.extend({},ex.scrollEvent.defaults,config,{
			target : target
		});
		c.status = 0;
		c.scroll = o.getPos();
		c.target.scroll(function( evt ){
			if (o.isMove()) {
				c.status = (c.status == 0 ? 1 : (c.status == 1 ? 2 : c.status) );
				c.callback( evt , c );
			}
			if(c.tm) clearTimeout(c.tm);
			c.tm = setTimeout(function(){
				o.isMove();
				c.status = 0;
				c.callback( evt , c );
			},c.delay);
		});
	}
	$j.extend(ex.scrollEvent.prototype,{
		isMove : function(){
			var o = this, c = o.config;
			var pos = o.getPos();
			var scrollY = (pos.top != c.scroll.top);
			var scrollX = (pos.left != c.scroll.left);
			if(scrollY || scrollX){
				c.scrollY = scrollY;
				c.scrollX = scrollX;
				c.prevScroll = c.scroll;
				c.scroll = pos;
				return true;
			}
			return false;
		},
		getPos : function(){
			var o = this, c = o.config;
			return {
				top : c.target.scrollTop(),
				left : c.target.scrollLeft()
			}		
		}
	});
	ex.scrollEvent.defaults = {
		delay : 100
	}

	$j.ex.fixed = function(target, config){
		var o = this;
		var c = o.config = $j.extend({},$j.ex.fixed.defaults,config,{
			target : target,
			logicSize : {},
			rowSize : {},
			currentStyle : '',
			style : '',
			window : $j(window),
			staticFixed : false,		
			oldBrowser : $j.browser.msie && ($j.browser.version < 7.0 || !$j.boxModel)
		});

		if(c.baseNode) c.baseNode = $(c.baseNode);

		var size = o._cleanSize(c);

		//static ?
		o._eachSizeSet(function(idx , at1 , cm1){
			c.staticFixed = c.staticFixed || 
				(size[at1.pos1] == undefined && size[at1.pos2] == undefined);
		});

		if( c.oldBrowser ) o._padPos( size , o._cleanSize(c.target[0].currentStyle) );
		else if(c.staticFixed) return;

		c.container = $j.boxModel ? $j('html') : $j('body');
		c.container.height(); //for IE Bug

		c.target.css('position',c.oldBrowser ? 'absolute' : 'fixed');
		if(c.oldBrowser && !/hidden|scroll/i.test(c.target.css('overflow'))){
			c.target.css('overflow','hidden');
		}
		o._smoothPatch();

		o._fixed(size);
		c.window.resize( function(){
			if(c.oldBrowser || c.baseNode){
				o._fixed();
			}
		});

		if(!(c.fixedX && c.fixedY)){
			if (c.oldBrowser) {
				var tm;
				c.window.scroll(function(){
					if(tm) clearTimeout(tm);
					tm = setTimeout(function(){
						o._fixed();
					},0);
				});
			}
			else{
				new ex.scrollEvent(c.window,function( evt , pa ){
					if((pa.scrollX && !c.fixedX) || (pa.scrollY && !c.fixedY)){
						if(pa.status == 1){
							o._fixed(c.logicSize,{
								unfixed:true
							});
						}
						else
						if (pa.status == 0) {
							o._fixed();
						}
					}
				})
			}
		}
	}
	$j.ex.fixed.config = {
		smoothPatched : false
	};
	$j.ex.fixed.defaults = {
	//	top : ?,
	//	right : ?,
	//	bottom : ?,
	//	left : ?,
	//	width : ?,
	//	height : ?,
		baseNode : '',
		baseX : true,
		baseY : true,
		fixedX : true,
		fixedY : true
	};
	$j.extend($j.ex.fixed.prototype,{
		_attn :[
			{size:'height',pos1:'top',pos2:'bottom'},
			{size:'width',pos1:'left',pos2:'right'}
		],
		_camel :[
			{size:'Height',pos1:'Top',pos2:'Bottom'},
			{size:'Width',pos1:'Left',pos2:'Right'}
		],
		_moveFixedFront : function(){
			var o = this , c = o.config;
			var parents = c.target.parents();
			var containers = parents.filter(function(idx){
				var el = parents.eq(idx);
				return !(/HTML|BODY/i.test(el[0].tagName)) && parents.eq(idx).css('position')!='static';
			});
			if(containers.size())
				containers.eq(containers.size()-1).after(c.target)
			return o;
		},
		_smoothPatch : function(){
			var o = this , c = o.config;
			o._moveFixedFront();
			if( !c.oldBrowser ) return o;
			$j.ex.fixed.config.smoothPatched = true;
			var html = $j('html');
			if(html.css('background-image') == 'none'){
				html.css({'background-image':'url(null)'});
			}
			html.css({'background-attachment':'fixed'});
			return o;
		},
		_eachSize : function( f ){
			var o = this , c = o.config;
			for (var i = 0; i < o._attn.length; i++) {
				var attn = o._attn[i];
				for (var j in attn) {
					var name = attn[j];
					f({
						idx : i,
						name : name,
						camel : name.slice(0,1).toUpperCase() + name.slice(1)
					});
				}
			}
		},
		_eachSizeSet : function( f ){
			var o = this , c = o.config;
			for (var i = 0; i < o._attn.length; i++) {
				f( i , o._attn[i] , o._camel[i] , o._attn[1-i] , o._camel[1-i]);
			}
		},
		_parseSize : function( val , xFlg ){
			var o = this , c = o.config;
			if( val == 'auto' ) return undefined;
			if((val + '').indexOf('%') < 0) return parseInt(val) || 0;
			var cSize = c.container.attr(xFlg ? 'clientWidth' : 'clientHeight');
			return Math.round(cSize * parseInt(val) / 100);
		},
		_parseIntSize : function( val , xFlg ){
			var o = this , c = o.config;
			return parseInt( o._parseSize( val , xFlg ) ) || 0;
		},
		_cleanSize : function(size){
			var o = this , c = o.config;
			var ret = {};
			o._eachSize( function( pa ){
				if(/undefined|auto/i.test(size[pa.name])){
					try{
						delete size[pa.name];
					}
					catch(e){}
				}
				else{
					ret[pa.name] = size[pa.name];
				}
			});
			return ret;	
		},
		_padPos : function( size , pad ){
			var o = this , c = o.config;
			var pos;
			o._eachSizeSet(function(idx , at1 , cm1){
				if (size[at1.pos1] == undefined && size[at1.pos2] == undefined) {
					if( (pos = pad[at1.pos1]) != undefined ) size[at1.pos1] = pos;
					else if( (pos = pad[at1.pos2]) != undefined ) size[at1.pos2] = pos;
					else size[at1.pos1] = 0;
				}
				if(size[at1.size] == undefined){
					if((size[at1.size] = pad[at1.size]) == undefined){
						size[at1.size] = c.target[at1.size]();
					}
				}
			});
			return size;
		},
		_calcRowSize : function( size , opt ){
			var o = this , c = o.config;
			var opt = $j.extend({
				abs : false,
				base : c.baseNode,
				unfixed : false
			},opt);
			var ret = {};

			o._eachSize( function( pa ){
				var val = size[pa.name];
				if(!(/undefined/i.test( val ))){
					ret[pa.name] = o._parseIntSize(val,/width|left|right/i.test(pa.name));
					if (opt.abs && /top|left/i.test(pa.name)){
						ret[pa.name] += c.window['scroll'+pa.camel]();
					}
				}
			});

			if(opt.base){
				var basePos = c.baseNode.offset();
				o._eachSizeSet( function(idx , pa , cm ){
					basePos[pa.pos2] = c.container.attr('client'+cm.size)
						- (basePos[pa.pos1] + c.baseNode['outer'+cm.size]());
				});
				o._eachSize( function( pa ){
					if(!(/height|width/i.test(pa.name)) && ret[pa.name] == undefined
						&& ((!pa.idx && c.baseY) || (pa.idx && c.baseX)) ){
						var name = pa.name == 'top' ? 'bottom' : pa.name == 'bottom' ? 'top' : pa.name == 'left' ? 'right' : 'left';
						ret[name] += basePos[name];
					}
				});
			}

			var fg = opt.unfixed && !c.fixedX ? -1 : 1;
			if(fg == -1|| (!opt.unfixed && !c.fixedY)){
				if(ret.top != undefined)ret.top -= (c.window.scrollTop()*fg);
				if(ret.bottom != undefined)ret.bottom += (c.window.scrollTop()*fg);
			}
			var fg = !opt.unfixed && !c.fixedX ? -1 : 1;
			if(fg == -1|| (opt.unfixed && !c.fixedY) ){
				if(ret.left != undefined )ret.left += (c.window.scrollLeft()*fg);
				if(ret.right != undefined )ret.right -= (c.window.scrollLeft()*fg);
			}
			return ret;
		},
		_fixed : function( size , opt ){
			var o = this , c = o.config;
			var opt = $j.extend({
				unfixed : false
			},opt);
			if(size) c.logicSize = o._padPos(o._cleanSize(size),c.logicSize);
			if(!c.oldBrowser){
				c.target.css( 
					$.extend(
						c.baseNode || !(c.fixedX && c.fixedY) ? o._calcRowSize( c.logicSize , opt ) : c.logicSize,
						{position:opt.unfixed?'absolute':'fixed'}
					)
				);
			}
			else{
				var rowSize = o._calcRowSize( c.logicSize );
				var hide = false;
				if (c.target.is(':hidden')) {
					hide = true;
					c.target.show();
				}
				o._eachSizeSet( function( idx , pa , cm ){
					c.target.css( pa.size , rowSize[ pa.size ] );
					var pos1 = rowSize[ pa.pos1 ];
					if( pos1 == undefined ){ //right,bottom based
						pos1 = c.container.attr( 'client' + cm.size ) - rowSize[ pa.pos2 ] - c.target[ 'outer' + cm.size ]();
					}
					var over = (pos1 + c.target['outer'+cm.size]()) - c.container.attr('client'+cm.size);
					if (over > 0) {
						over = c.target[pa.size]() - over;
						if (over > 0) 
							c.target[pa.size](over);
						else hide = true;
					}
					if(!hide){
						c.target[0].style.setExpression( pa.pos1 ,
							pos1 +
							(	(!idx && !c.fixedY) || (idx && !c.fixedX) ? 
								c.window['scroll'+cm.pos1]() : 
								'+eval(document.body.scroll'+cm.pos1+'||document.documentElement.scroll'+cm.pos1+')'
							)
						);
					}
				});
				if(hide) c.target.hide();
			}
		},
		target : function(){
			return this.config.target;
		},
		fixedOpen : function( f ){
			var o = this , c = o.config;
			if(c.staticFixed) return;
		
			if (c.oldBrowser) {
				c.target[0].style.removeExpression('top');
				c.target[0].style.removeExpression('left');
			}
			if( f ) setTimeout(function(){ // for window.scrollTop()
				if (c.oldBrowser) {
					c.target.css({top:'auto',left:'auto'});
					c.target.css(o._calcRowSize(c.logicSize , {
						abs : true
					}));
				}
				f();
			},100);
			return o;
		},
		fixedClose : function( size ){
			var o = this , c = o.config;
			if(c.staticFixed) return;
			o._fixed( size );
			return o;
		},
		fixedSize : function( size ){
			var o = this , c = o.config;
			return o._calcRowSize(o._padPos(size,c.logicSize),{
				abs : c.oldBrowser
			});
		},
		resize : function( size ){
			var o = this , c = o.config;
			o.fixedOpen(function(){
				o.fixedClose( size );
			})	
			return o;
		}
	});
	ex.defineExPlugin('exFixed',$j.ex.fixed);

})(jQuery);

