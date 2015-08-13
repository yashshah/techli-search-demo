var appbase_app = function() {
	var $this = this;
	return {
		initialize: initialize
	};

	function initialize(options) {

		//Initialize Variables Start
		$this.default_options = {
			title: 'Blazing fast search on your Documentation',
			input_placeholder: 'search here',
			logo: 'images/Appbase.png',
			abbr: 'appbase_',
			selector: '.appbase_external_search'
		};

		//Variable js		
		var options = $.extend($this.default_options, options);
		$this.variables = new variables(options.credentials, options.app_name, options.index_document_type, 'client');
		$this.url = $this.variables.createURL();
		$this.appbase_total = 0;
		$this.appbase_increment = $this.variables.SIZE;
		$this.size = $this.appbase_increment;
		$this.appbase_xhr_flag = true;
		$this.search_payload = $this.variables.SEARCH_PAYLOAD;
		$.ajaxSetup({
			crossDomain: true,
			xhrFields: {
				withCredentials: true
			}
		});
		function scroll_callback(full_data, method) {
			var hits = full_data.hits.hits;
			if(hits.length){
				if(method == 'fuzzy')
				{
      				$this.appbase_total = hits.length;
					$(".appbase_total_info").html($this.variables.showing_text(hits.length, hits.length, $('.appbase_input').eq(1).val(), full_data.took));
	            }
	            else{
	            	$this.appbase_increment += hits.length;
		            $(".appbase_total_info").html($this.variables.showing_text($this.appbase_increment, $this.appbase_total, $('.appbase_input').eq(1).val(), full_data.took));
	            }
	            for (var i = 0; i < hits.length; i++) {
	              var data = hits[i];
	              var small_link = $('<span>').addClass('small_link').html(data.highlight.title);
	              var small_description = $('<p>').addClass('small_description').html(data.highlight.body.join('...') + '...');
	              var single_record = $('<a>').attr({
	                'class': 'record_link'
	              }).append(small_link).append(small_description);

	              //var single_record = '<div><a cla href="'+ data.fields.link +'">' + data.highlight.title + '</a><p> ' + data.highlight.body.join('...') + '...</p></div>';
	              var tt_record = $('<div>').addClass('tt-suggestion tt-selectable').html(single_record);
	              $('.tt-menu .tt-dataset.tt-dataset-my-dataset').append(tt_record);
	            }
            	$this.appbase_xhr_flag = true;
			}
		}
		//Initialize Variables End

		//Bloodhound Start
		$this.engine = $this.variables.createEngine($this, function(length){
			$this.appbase_total = length;
			if(length)
				$this.appbase_xhr_flag = true;
			else
		    	$this.appbase_xhr_flag = false;
		}, scroll_callback);
		//Bloodhound End

		//Fire CreateHtml
		createHtml(options);

		//CreateHtml Start
		function createHtml(obj) {
			var abbr = obj.abbr;
			var title = $('<h1>').addClass(abbr + 'title').html(obj.title);
			var input_box = $('<input>').addClass(abbr + 'input').attr({
				'type': 'text',
				'placeholder': obj.input_placeholder
			});
			var app_logo = $('<img>').addClass(abbr + 'logo').attr({
				'src': obj.logo
			});
			var search_box = $('<div>').addClass(abbr + 'search_box').append(input_box).append(app_logo);
			var search_box_container = $('<div>').addClass(abbr + 'search_box').append(search_box);
			var modal_content = $('<div>').addClass(abbr + 'modal_content').append(search_box_container);
			var overlay = $('<div>').addClass(abbr + 'overlay');
			var modal = $('<div>').addClass(abbr + 'modal').append(modal_content).append(overlay);
			$('body').append(modal);

			//Bind events with html
			html_events(obj, modal, overlay);
		};

		function html_size(obj, modal) {
			function appbase_resize() {
				var win_height = $(window).height();
				var modal_height = win_height - 150;
				var tt_height = modal_height - $('.' + obj.abbr + 'input').height() - 50;
				$('.tt-menu').height(tt_height);
				$(modal).find('.' + obj.abbr + 'modal_content').height(modal_height);
			}
			$(window).resize(function() {
				appbase_resize();
			});
			appbase_resize();
		}

		function html_events(obj, modal, overlay) {
			$(modal).find('.' + obj.abbr + 'input').typeahead({
				minLength: 2,
				highlight: true,
				limit: 100,
				change: function() {
					alert('changed');
				}
			}, {
				name: 'my-dataset',
				limit: 100,
				source: $this.engine.ttAdapter(),
				templates: {
					suggestion: function(data) {
						console.log(data);
						if(data)
						{
							var small_link = $('<span>').addClass('small_link').html(data.highlight.title);
							var small_description = $('<p>').addClass('small_description').html(data.highlight.body.join('...') + '...');
							var single_record = $('<a>').attr({
								'class': 'record_link',
								'href': data.fields.link
							}).append(small_link).append(small_description);
							return single_record;
						}
						else
							return;
						setTimeout(function(){
						 $(".tt-dropdown-menu .tt-suggestion").unbind('click');
						},500);
					}
				}
			});

			$(modal).find('.' + obj.abbr + 'input').on('keyup',function(){
				if($(this).val().length == 0)
					$('.appbase_total_info').text('No Results found');
			});

			$(modal).find('.' + obj.abbr + 'input').bind('typeahead:select', function(ev, suggestion) {
				ev.preventDefault();
				console.log('Selection: ' + suggestion);
			});

			var total_info = $('<span>').addClass(obj.abbr + 'total_info').html('No Results found');
			$('.tt-menu').prepend(total_info);

			html_size(obj, modal);

			$(obj.selector).on('keyup', function() {
				var input_val = $(this).val();
				$(modal).find('.' + obj.abbr + 'input').val(input_val);
				$(modal).fadeIn(300);
				$(overlay).show();
				$(modal).find('.' + obj.abbr + 'input').focus();
				$(this).val('');
				$('body').css('overflow','hidden');
			});
			$(document).keyup(function(e) {
				if (e.keyCode == 27) {
					$(modal).fadeOut(300);
					$(overlay).fadeOut(300);
					$('body').css('overflow','auto');
				}
			});
			$(overlay).on('click', function() {
				$(modal).fadeOut(500);
				$(overlay).fadeOut(500);
				$('body').css('overflow','auto');
			});

			$('.tt-menu').on('scroll', function() {
				if ($(this).scrollTop() + $(this).innerHeight() >= this.scrollHeight) {
					if ($this.appbase_total != 0 && $this.appbase_total > $this.appbase_increment && $this.appbase_xhr_flag) {
						$this.variables.scroll_xhr($this,'client', scroll_callback);
					}
				}
			});

			

		}
		//CreateHtml End



	}
}

var Loader = function() {}
Loader.prototype = {
	require: function(scripts, callback) {
		this.loadCount = 0;
		this.totalRequired = scripts.length;
		this.callback = callback;

		for (var i = 0; i < scripts.length; i++) {
			var split_name = scripts[i].split('.');
			if (split_name[split_name.length - 1] == 'js')
				this.writeScript(scripts[i]);
			if (split_name[split_name.length - 1] == 'css')
				this.writeStylesheet(scripts[i]);
		}
	},
	loaded: function(evt) {
		this.loadCount++;

		if (this.loadCount == this.totalRequired && typeof this.callback == 'function') this.callback.call();
	},
	writeScript: function(src) {
		var self = this;
		var s = document.createElement('script');
		s.type = "text/javascript";
		s.async = true;
		s.src = src;
		s.addEventListener('load', function(e) {
			self.loaded(e);
		}, false);
		var head = document.getElementsByTagName('head')[0];
		head.appendChild(s);
	},
	writeStylesheet: function(src) {
		var self = this;
		var s = document.createElement('link');
		s.type = "text/css";
		s.rel = "stylesheet";
		s.href = src;
		s.addEventListener('load', function(e) {
			self.loaded(e);
		}, false);
		var head = document.getElementsByTagName('head')[0];
		head.appendChild(s);
	}
}

var jquery_js = new Loader();
jquery_js.require([
		"css/client.css",
		"https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"
	],
	function() {
		var typeahead_js = new Loader();
		typeahead_js.require([
				"http://cdnjs.cloudflare.com/ajax/libs/typeahead.js/0.11.1/typeahead.bundle.min.js",
				"js/variable.js"
			],
			function() {
				var appbase = new appbase_app();
				appbase.initialize({
					title: 'Blazing fast search1 on your Documentation',
					input_placeholder: 'search here',
					logo: 'images/Appbase.png',
					selector: '.appbase_external_search',
					credentials:appbase_variables.credentials,
					app_name:appbase_variables.app_name,
					index_document_type:appbase_variables.index_document_type
				});
			});
	});