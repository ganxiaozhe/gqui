// =================================================
//
// gQuery.UI.js v1.0.0
// (c) 2020, JU Chengren (Ganxiaozhe)
// Released under the MIT License.
// gquery.net/about/license
//
// =================================================
;(function(global, factory){
	if(!global.gQuery || !global.gQuery.fn.gquery){
		throw new Error("请先引入 gQuery v1.4.5 以上版本!");
	}

	global.gQuery.ui = global.$.ui = factory();
	console.log('%c gQueryUI v1 %c www.gquery.net/ui \n','color: #fff; background: #030307; padding:5px 0; margin-top: 1em;','background: #efefef; color: #333; padding:5px 0;');

	$.ui.parse();
}(window, function(){
	'use strict';
	let ui = {
		alert: function(opts){return $.ui.alert.fn.out(opts);},
		parse: function(){
			for(let fn in $.ui.parse.fn){
				$.ui.parse.fn[fn]();
			}
		}
	};

	/*
	 * 弹出框
	*/
	ui.alert.prototype = ui.alert.fn = {
		out: function(opts){
			if(typeof opts !== 'object') {return 'empty object';}
			let t = {};
			Array.isArray(opts.buttons) || (opts.buttons = []);
			if(opts.yes || opts.yes_btn){
				t.btn = {
					val: opts.yes_btn || '确定',
					func: opts.yes,
					class: 'info'
				};
				opts.buttons.push(t.btn);
			}
			if(opts.no || opts.no_btn){
				t.btn = {
					val: opts.no_btn || '取消',
					func: opts.no,
					class: 'cancel'
				};
				opts.buttons.push(t.btn);
			}

			this.id ? this.id++ : this.id=1;
			opts.buttons.length<1 && opts.buttons.push({val:'确定', class:'info'});
			t.btns = opts.buttons.reduce((pre, cur, idx)=>{
				return `<button type='button' class='btn ${cur.class}' data-btnId='${idx}'>${cur.val}</button>${pre}`;
			},'');

			let html = `<div class='gl-overlay gl-alert flex ct' gq-alert-${this.id}><div class='inner'><div class='header flex bt'>${opts.title}</div><div class='body'>${opts.message}</div><div class='footer nsel flex ct'>${t.btns}</div></div></div>`;
			$('body').append(html);

			$(`.gl-alert[gq-alert-${this.id}]`).fadeIn(500).show('flex')
			.on('click', '.footer .btn', function(){
				let bid = $(this).attr('data-btnId'), btn = opts.buttons[bid];
				typeof btn.func === 'function' && btn.func();

				$(this).parent().parent().parent().fadeOut(500,function(){
					$(this).remove();
				});
			});
		}
	};

	/*
	 * 解析
	*/
	ui.parse.prototype = ui.parse.fn = {
		code: function(lang, spl){
			let t = {tax:0};
			spl || (spl='\n');lang || (lang='Text');
			$('.code-autoParse:not([data-gpbind])').each(function(){
				t.tax++;
				let codes = this.innerHTML.toString();
				this.innerText = codes;
				if(typeof hljs==='object' && 'highlight' in hljs){
					hljs.highlightBlock(this);
				}
				codes = this.innerHTML.replace(/<br>/g,'\n').split(spl);

				t.lang = $(this).attr('data-lang') || lang;
				t.h = `<div class='of-wrapper'><div class='code-nav flex bt'>`+
					`<div class='lang'>${t.lang}</div>`+
					`<div class='opt opt-copy'>复制</div>`+`</div><table class='code-list'><tbody>`;

				t.h = codes.reduce((pre, cur, i)=>{
					t.ln = i+1;
					t.first = cur.substr(0,1);
					cur = cur.replace(/^\\#/,'#');
					if(t.first=='#'){
						cur = `<span class='remark'>${cur}</span>`;
					}
					return `${pre}<tr><td class='num nsel'>${t.ln}</td><td class='code'>${cur}</td></tr>`;
				}, t.h);

				t.h += "</tbody></table></div>";
				this.innerHTML = t.h;
			}).attr('data-gpbind','1');

			$('.code-autoParse .opt-copy:not([data-gpbind])').on('click',function(){
				let codes = $(this).parent().parent().find('.code-list .code');
				t.this = $(this);
				t.copy = "";
				for (let i = 0; i < codes.length; i++) {
					t.c = codes[i].innerText;
					t.first = t.c.substr(0,1);
					if(t.first=='#'){continue;}
					t.copy += (t.copy=="" ? t.c : "\n"+t.c);
				}
				$.copy(t.copy);

				t.this.text('复制成功');
				setTimeout(()=>{t.this.text('复制');},1000);
			}).attr('data-gpbind','1');

			return t.tax;
		}
	};

	// 分页
	ui.page = function(opts){
		if(!opts || !opts.target || !opts.current || !opts.total || !opts.query){throw new Error('parameters missing');}
		opts.current = parseInt(opts.current);
		opts.total = parseInt(opts.total);
		opts.target = ( typeof opts.target === 'object' ? opts.target : $(opts.target) );
		opts.turnType = ( typeof opts.query === 'function' ? 'func' : 'url' );

		this.qmax = 0,this.qmin = 0;
		this.parr = [];
		let t = {},i;
		this.push = function(page, idx){
			if(page<1 || page>opts.total){return this;}
			(!idx&&idx!=0) && (idx=this.parr.length-1);
			this.parr.splice(idx, 0, page);
			this.parr = $.array.unique(this.parr);
			return this;
		}

		// 判断当前页的前后三页是否为最大或最小页
		for (i = 0; i < 3; i++) {
			t.n_max = opts.current + i;
			t.n_max <= opts.total ? this.push(t.n_max) : this.qmax=1;
			t.n_max == opts.total-1 && (this.qmax=1);

			t.n_min = opts.current - i;
			t.n_min >= 0 ? this.push(t.n_min) : this.qmin=1;
			t.n_min == 2 && (this.qmin=1);
		}
		if(this.qmax==1){
			this.push(opts.total).push(--t.n_min);
			opts.current >= opts.total-1 && this.push(--t.n_min);
			opts.current == opts.total && this.push(--t.n_min);
		}
		if(this.qmin==1){
			this.push(1,0).push(++t.n_max);
			opts.current <= 2 && this.push(++t.n_max);
			opts.current == 1 && this.push(++t.n_max);
		}
		opts.total<6 && (this.qmax=this.qmin=1);

		this.parr = this.parr.sort(function(a,b){return a - b});
		t.qhtml = this.parr.reduce((pre, cur)=>{
			if(cur==opts.current){
				pre += "<span class='p active'>"+cur+"</span>";
			} else {
				if(opts.turnType=='func'){
					pre += "<span class='p p-query'>"+cur+"</span>";
				} else {
					pre += "<a href='"+opts.query+cur+"'>"+cur+"</a>";
				}
			}
			return pre;
		}, '');

		if(this.qmax==0){
			if(opts.turnType=='func'){
				t.qhtml += "<span class='p clear'>...</span><span class='p p-query'>"+opts.total+"</span>";
			} else {
				t.qhtml += "<span class='p clear'>...</span><a href='"+opts.query+opts.total+"'>"+opts.total+"</a>";
			}
		}
		if(this.qmin==0 && opts.current!=3){
			if(opts.turnType=='func'){
				t.qhtml = "<span class='p p-query'>1</span><span class='p clear'>...</span>"+t.qhtml;
			} else {
				t.qhtml = "<a href='"+opts.query+"1'>1</a><span class='p clear'>...</span>"+t.qhtml;
			}
		}

		opts.target.html(t.qhtml);

		if(opts.turnType=='func'){
			opts.target.find('.p-query').click(opts.query);
		}
	}

	return ui;
}));