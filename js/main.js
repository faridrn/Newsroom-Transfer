var token = '';
$(function () {
    // Check for credentials
    // if user is logged in then start the app
    if (token === '') {
	var cookieToken = Cookie.get();
	if (cookieToken === '') {
	    console.log('User needs to login!');
	    $("#login-form").modal({
		backdrop: 'static'
		, keyboard: false
	    });
	} else {
	    token = cookieToken;
	    App.start(token);
	}
    } else {
	App.start(token);
    }
});

// Objects
var App = {
    start: function () {
	App.init();
	Global.periodicals();
    }
    , init: function () {
	Global.registerHandlebarHelpers();
	Template.showPlaces();
	if (Template.init()) {
	    // Do the rest of code
	    $.each(Map.positions, function (i, pos) {
		var $tmpl = $(pos.id + "-template");
		var $pos = $(pos.id);
		if ($tmpl.length) {
//		    console.log(pos.autoLoad);
		    if (pos.autoLoad === true)
			Data.get(pos.template, null, $tmpl, $pos, null);
//		    else
			//Data.get(null, null, $tmpl, $pos, null);
		}
	    });
	}
    }
    , close: function() {
	Cookie.delete();
	Location.refresh();
    }
};
var Template = {
    init: function () {
	var response = false;
	if (!$("#templates").children().length) {
	    $.ajax({
		url: Map.templates
		, async: false
		, success: function (d) {
		    $("#templates").append(d);
		    response = true;
		}
	    });
	} else {
	    console.log('template exists!');
	    response = true;
	}
	return response;
    }
    , showPlaces: function () {
	$.each(Map.places, function (i, place) {
	    if ($(place).length) {
		$(place).removeClass('hide');
	    }
	});
    }
    , compile: function (data, template, position, srvc) {
	var source = template.html();
	var template = Handlebars.compile(source);
	var html = template(data);
	position.html(html);
	Template.afterCompile(html, srvc);
    }
    , afterCompile: function (html, srvc) {
	if (Map.positions[srvc].eventListener === true)
	    Bindings[Map.positions[srvc].template].init();
	if (html.indexOf("\"nano") !== -1)
	    $(".nano").nanoScroller({flash: true, preventPageScrolling: true, tabIndex: 0});
    }
};
var Data = {
    get: function (srvc, data, template, position, message) {
	if (typeof srvc !== "undefined" && srvc !== "" && srvc) {
	    var source = Map.positions[srvc].service;
	    if (data !== null)
		source += '/' + data;
	    $.ajax({
		url: Map.serviceBase + source
		, headers: {"Authorization": token}
		, success: function(d) {
		    var data = JSON.parse(d);
		    Template.compile(data, template, position, srvc);
		}
	    });
	} else {
	    data = [];
	    Template.compile(data, template, position, srvc);
	}
    }
    , post: function (srvc, data, template, position, message) {
	if (typeof srvc !== "undefined" && srvc !== "" && srvc) {
	    var source = Map.positions[srvc].service;
	    if (data !== null) {
		$.ajax({
		    url: Map.serviceBase + Map.positions[srvc].service
		    , headers: {"Authorization": token}
		    , type: 'post'
		    , data: data
		    , success: function(d) {
			console.log(d);
		    }
		});
	    }
	}
    }
    , put: function (service, data, template, position, message) {
	return false;
    }
};
var Location = {
    goBack: function () {
	Location.redirect(true);
    }
    , redirect: function (url) {
	if (typeof url !== "undefined") {
	    window.location.href = url;
	} else {
	    return false;
	}
	return true;
    }
    , refresh: function () {
	location.reload();
    }
};
var Global = {
    isInt: function (n) {
	return typeof parseInt(n) === "number" && isFinite(parseInt(n)) && parseInt(n) % 1 === 0;
    }
    , getVal: function ($obj, attr, deflt) {
	if ($obj.length) {
	    var val = $obj.attr(attr);
	    if (typeof val === "undefined") {
		val = deflt;
	    }
	    return val;
	}
	return false;
    }
    , ucfirst: function (string) {
	if (typeof string !== "undefined") {
	    return string.charAt(0).toUpperCase() + string.slice(1);
	} else {
	    return string;
	}
    }
    , cleanText: function (str) {
	return str.replace(/[^a-zA-Z\u0600-\u06FF\s]/gi, '');
    }
    , registerHandlebarHelpers: function () {
	Handlebars.registerHelper('times', function (n, block) { // Loop a block starting at 0
	    var accum = '';
	    for (var i = 0; i < n; ++i)
		accum += block.fn(i);
	    return accum;
	});
	Handlebars.registerHelper('date', function (offset, options) {
	    var output = '';
	    if (typeof offset === 'undefined' || offset === '')
		offset = 0;
	    var date = new Date();
	    date.setDate(date.getDate() + offset);
	    var dd = date.getDate();
	    var mm = date.getMonth() + 1; //January is 0!
	    var yyyy = date.getFullYear();
	    if (dd < 10)
		dd = '0' + dd;
	    if (mm < 10)
		mm = '0' + mm;
	    output = mm + '/' + dd + '/' + yyyy;
	    return output;
	});
	Handlebars.registerHelper('date2', function (offset, options) {
	    var output = '';
	    if (typeof offset === 'undefined' || offset === '')
		offset = 0;
	    var date = new Date();
	    date.setDate(date.getDate() + offset);
	    var dd = date.getDate();
	    var mm = date.getMonth() + 1; //January is 0!
	    var yyyy = date.getFullYear();
	    if (dd < 10)
		dd = '0' + dd;
	    if (mm < 10)
		mm = '0' + mm;
	    output = yyyy + '-' + mm + '-' + dd;
	    return output;
	});
	Handlebars.registerHelper('htimes', function (n, block) { // Loop a block starting at 1 [human-readable times]
	    var accum = '';
	    for (var i = 1; i < (n + 1); ++i)
		accum += block.fn(i);
	    return accum;
	});
	Handlebars.registerHelper('for', function (from, to, incr, block) { // For loop {{#for i to steps}} -> {{#for 0 10 2}}
	    var accum = '';
	    for (var i = from; i < to; i += incr)
		accum += block.fn(i);
	    return accum;
	});
	Handlebars.registerHelper('ifCond', function (v1, v2, options) {
	    if (v1 === v2) {
		return options.fn(this);
	    }
	    return options.inverse(this);
	});
	Handlebars.registerHelper('ifActive', function (val, options) {
	    var currentID = (typeof Location.parts[2] === "undefined") ? 0 : Location.parts[2];
	    if (parseInt(val) === parseInt(currentID)) {
		return "grey-cascade";
	    }
	    return "btn-default";
	});
	Handlebars.registerHelper('cycle', function (value, block) {
	    var values = value.split(' ');
	    return values[block.data.index % (values.length + 1)];
	});
	window.Handlebars.registerHelper('select', function (value, options) {
	    var $el = $('<select />').html(options.fn(this));
	    $el.find('[value=' + value + ']').attr({'selected': 'selected'});
	    return $el.html();
	});
    }
    , periodicals: function() {
	// Cookie extend
	window.setInterval(function() {
	    Cookie.extend(Cookie.title, token);
	}, 10000);
    }
};
var Map = {
    templates: 'data/templates.html'
//    , serviceBase: 'http://192.168.101.46/Assignment.svc/'
    , serviceBase: 'http://192.168.101.154:91/Assignment.svc/'
    , places: [".wrapper"]
    , services: {
	
    }
    , login: { service: "login" }
    , positions: {
	userparams: {id: "#userparams", template: 'userparams', service: 'UserParams', autoLoad: true, eventListener: false}
	, results: {id: "#results", template: "results", service: 'AssignmentItemGetAll', autoLoad: true, eventListener: true}
	, conversation: {id: "#conversation", template: "conversation", service: 'AssignmentItemDetGetAll', autoLoad: false, eventListener: true}
	, assignment: {id: "", template: "", service: 'AssignmentItemDetCreate', autoLoad: false, eventListener: false}
    }
};
var Bindings = {
    results: {
	init: function() {
	    Bindings.results.click();
	}
	, click: function() {
	    $(document).on('click', "#results .content li", function(e) {
		var id = $(this).attr('data-id');
		Data.get('conversation', id, $("#conversation-template"), $("#conversation"), '', $(this).text());
		e.preventDefault();
	    });
	}
    }
    , conversation: {
	init: function() {
	    Bindings.conversation.scrollBottom();
	    Bindings.conversation.add();
	}
	, add: function() {
	    $(document).on('click', "#conversation .item-form a.do-send", function(e) {
		var content = $(this).parent().find("textarea").val();
		var id = $(this).parent().find("input[type=hidden]").val();
		Data.post('assignment', {Title: content, AssignmentItemId: id}, null, null, null);
		e.preventDefault();
	    });
	}
	, scrollBottom: function() {
	    $("#conversation .nano").nanoScroller({ scroll: 'bottom' });
	}
    }
    , userParams: {
	init: function() {
	    Bindings.results.fillParams();
	}
	, fillParams: function() {
	    
	}
    }
};
var Cookie = {
    lifetime: 600 // exp in seconds
    , title: 'newsroom='
    , init: function () {
	var Cookie = this;
    }
    , check: function (cname) {
	if (typeof cname === 'undefined')
	    var cname = Cookie.title;
	return Cookie.get(Cookie.title);
    }
    , parse: function (data) {
	if (typeof data !== 'undefined') {
	    return data;
	}
	return false;
    }
    , delete: function (cname) {
	if (typeof cname === 'undefined')
	    var cname = Cookie.title;
	var expires = 'Thu, 01 Jan 1970 00:00:01 GMT';
	document.cookie = cname + '' + '; ' + expires + '; path=/';
    }
    , extend: function (cname, data) {
	console.log('extending user session');
	Cookie.set(cname, data);
    }
    , set: function (cname, data) {
	if (typeof cname === 'undefined')
	    var cname = Cookie.title;
	// validating paramters
	var cname = Cookie.title;
	var d = new Date();
	d.setTime(d.getTime() + (Cookie.lifetime * 1000));
	var expires = 'expires=' + d.toGMTString();
	document.cookie = cname + data + '; ' + expires + '; path=/';
	return data;
    }
    , get: function (cname) {
	if (typeof cname === 'undefined')
	    var cname = Cookie.title;
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
	    var c = ca[i].trim();
	    if (c.indexOf(cname) === 0)
		return Cookie.parse(c.substring(cname.length, c.length));
	}
	return "";
    }
};

// Login and logout
$(document).on('click', "#login-anchor", function (e) {
    // request for token
    var s = false;
    $.ajax({
	url: Map.serviceBase + Map.login.service
	, data: $("#login-form form:first").serialize()
	, type: 'post'
	, success: function (d) {
	    if (d !== "") {
		token = d;
		$("#login-form").find(".alert").addClass('hide');
		$("#login-form").modal('hide');
		Cookie.set(Cookie.title, d);
		App.start(s);
	    } else {
		$("#login-form").find(".alert").slideDown(function () {
		    $("#login-form").find(".alert").removeClass('hide');
		});
	    }
	}
    });
    e.preventDefault();
    return false;
}).on('click', ".logout", function (e) {
    App.close();
}).on('focusin', "#login-form form:first", function () {
    $("#login-form").find(".alert").slideUp(function () {
	$("#login-form").find(".alert").addClass('hide');
    });
});