var token = '1';
$(function() {
    // Check for credentials
    // if user is logged in start the app
    if (token === '') {
	$("#login-form").modal({
	    backdrop: 'static'
	    , keyboard: false
	});
    } else {
	App.start(token);
    }
});

// Objects
var App = {
    start: function() {
	App.init();
    }
    , init: function() {
	Global.registerHandlebarHelpers();
	Template.showPlaces();
	if (Template.init()) {
	    // Do the rest of code
	    $.each(Map.positions, function(i, pos) {
		var $tmpl = $(pos.id + "-template");
		var $pos = $(pos.id);
		if ($tmpl.length) {
		    Data.get(null, null, $tmpl, $pos, null);
		}
	    });
	}
    }
};
var Template = {
    init: function() {
	var response = false;
	if (!$("#templates").children().length) {
	    $.ajax({
		url: Map.templates
		, async: false
		, success: function(d) {
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
    , showPlaces: function() {
	$.each(Map.places, function(i, place) {
	    if ($('#' + place).length) {
		$('#' + place).removeClass('hide');
	    }
	});
    }
    , compile: function(data, template, position) {
	var source   = template.html();
	var template = Handlebars.compile(source);
	var html     = template(data);
	position.html(html);
	Template.afterCompile(html);
    }
    , afterCompile: function(html) {
	if (html.indexOf("\"nano") !== -1)
	    $(".nano").nanoScroller({flash:true,preventPageScrolling:true,tabIndex:0});
    }
};
var Data = {
    get: function(service, data, template, position, message) {
	var data = []; /////////
	Template.compile(data, template, position);
    }
    , post: function(service, data, template, position, message) {
	return false;
    }
    , put: function(service, data, template, position, message) {
	return false;
    }
};
var Location = {
    goBack: function() {
        Location.redirect(true);
    }
    , redirect: function(url) {
	if (typeof url !== "undefined") {
            window.location.href = url;
        } else {
            return false;
        }
        return true;
    }
    , refresh: function() {
        location.reload();
    }
};
var Global = {
    isInt: function(n) {
        return typeof parseInt(n) === "number" && isFinite(parseInt(n)) && parseInt(n) % 1 === 0;
    }
    , getVal: function($obj, attr, deflt) {
        if ($obj.length) {
            var val = $obj.attr(attr);
            if (typeof val === "undefined") {
                val = deflt;
            }
            return val;
        }
        return false;
    }
    , ucfirst: function(string) {
        if (typeof string !== "undefined") {
            return string.charAt(0).toUpperCase() + string.slice(1);
        } else {
            return string;
        }
    }
    , cleanText: function(str) {
        return str.replace(/[^a-zA-Z\u0600-\u06FF\s]/gi, '');
    }
    , registerHandlebarHelpers: function() {
        Handlebars.registerHelper('times', function(n, block) { // Loop a block starting at 0
            var accum = '';
            for (var i = 0; i < n; ++i)
                accum += block.fn(i);
            return accum;
        });
        Handlebars.registerHelper('date', function(offset, options) {
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
        Handlebars.registerHelper('date2', function(offset, options) {
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
        Handlebars.registerHelper('htimes', function(n, block) { // Loop a block starting at 1 [human-readable times]
            var accum = '';
            for (var i = 1; i < (n + 1); ++i)
                accum += block.fn(i);
            return accum;
        });
        Handlebars.registerHelper('for', function(from, to, incr, block) { // For loop {{#for i to steps}} -> {{#for 0 10 2}}
            var accum = '';
            for (var i = from; i < to; i += incr)
                accum += block.fn(i);
            return accum;
        });
        Handlebars.registerHelper('ifCond', function(v1, v2, options) {
            if (v1 === v2) {
                return options.fn(this);
            }
            return options.inverse(this);
        });
        Handlebars.registerHelper('ifActive', function(val, options) {
            var currentID = (typeof Location.parts[2] === "undefined") ? 0 : Location.parts[2];
            if (parseInt(val) === parseInt(currentID)) {
                return "grey-cascade";
            }
            return "btn-default";
        });
        Handlebars.registerHelper('cycle', function(value, block) {
            var values = value.split(' ');
            return values[block.data.index % (values.length + 1)];
        });
        window.Handlebars.registerHelper('select', function(value, options) {
            var $el = $('<select />').html(options.fn(this));
            $el.find('[value=' + value + ']').attr({'selected': 'selected'});
            return $el.html();
        });
    }
};
var Map = {
    templates: 'data/templates.html'
    , places: ['header', 'mainbody', 'footer']
    , positions: {
	user: {id: "#user", template: "user"}
	, search: {id: "#search", template: "search"}
	, results: {id: "#results", template: "results"}
	, conversation: {id: "#conversation", template: "conversation"}
    }
};

$(document).on('click', "#login-anchor", function(e) {
    // request for token
    var s = true;
    if (s) {
	$("#login-form").find(".alert").addClass('hide');
	$("#login-form").modal('hide');
	token = s;
	App.start(s);
    } else {
	$("#login-form").find(".alert").removeClass('hide');
    }
    e.preventDefault();
});