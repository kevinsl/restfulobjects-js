//     restfulobjects-js
//     (c) 2011 Johan Andries
//     This software may be freely distributed under the MIT license.

$(function() {

	Isis.ActionInvocationRequestView = Backbone.View.extend({
		
		initialize: function() {
			_.bindAll(this,'close');
			_.bindAll(this,'newSubmit');
			_.bindAll(this, 'tryPaste');
	    },
	    
	    events: {
	    	"click .ok"             : "newSubmit",
	    	"click .cancel"         : "close",
	    	"click a.paste"			: "tryPaste"
		},
	    
	    render: function() {
	    	this.renderArguments();
	    	$(this.el).dialog({
	    		width: 600,
	    		title: this.model.name,
	    		close: this.close
	    	});
	    	return this;
	    },
	    
	    renderArguments: function() {
	    	var that = this;
	    	var fieldset = $('<form />').append('<fieldset/>');
	    	$(that.el).append(fieldset);
	    	Isis.Forms.buildHtml(fieldset, this.model.description.parameters);
	    	var actions = $('<div class="actions" />');
	    	fieldset.append(actions);
	    	actions.append($('<button class="btn primary ok">OK</button> <button class="btn cancel">Cancel</button>'));
	    },
	    
	    newSubmit: function(e) {
	    	e.preventDefault();
	    	this.model.invoke(Isis.Forms.buildJsonBody(this.$('form'), this.model.description.parameters));
	    	this.close();
	    },
	    
	    close: function(e) {
	    	if(e) {
	    		e.preventDefault();
	    	}
	    	$(this.el).dialog('destroy').remove();
	    },
	    
	    tryPaste: function(e) {
	    	e.preventDefault();
	    	if (Isis.Clipboard) {
		    	var div = $(e.target).parent();
		    	var hidden = div.find('input[type="hidden"]');
		    	var parameterType = this.model.description.parameters[hidden.attr('name')].type;
		    	//if(parameterType === Isis.Clipboard.type) {
		    		hidden.attr('value', Isis.Clipboard.href);
		    		div.find('input[type="text"]').attr('value', Isis.Clipboard.title);
		    	/*} else {
		    		alert('Type on clipboard is '+Isis.Clipboard.type+', but this field expects type '+parameterType);
		    	}*/
	    	} else {
	    		alert('Clipboard is empty');
	    	}
	    }
	});
	
	Isis.ListView = Backbone.View.extend({
		
		initialize: function() {
			Isis.registerView(this);
			_.bindAll(this,'close');
			_.bindAll(this,'showObject');
	    },
	    
	    events: {
	    	"click a.detail"            : "showObject"
		},
		
		showObject: function(e) {
		  	var oid = e.target.id;
		  	var object = _.select(this.model.elements, function(value) {
		  		return value.oid === oid;
		  	})[0];
		   	Isis.trigger('showDomainObjectRequested', object);
		},
	    
		refresh: function() {
			$(this.el).empty();
			this.renderList();
		},
		
	    render: function() {
	    	this.renderList();
	    	$(this.el).dialog({
	    		width: 600,
	    		close: this.close,
	    		zIndex: 1000
	    	});
	    	return this;
	    },
	    
	    renderList: function() {
	    	var that = this;
	    	$.each(that.model.elements, function() {
	    		$(that.el).append('<p><a href="#" class="detail" id="'+this.oid+'">'+this.title+'</a></p>');
	    	});
	    	$(that.el).find('a.detail').draggable({
    			appendTo: "body",
    			helper: "clone",
    			zIndex: 2000
    		});
	    },
	    
	    close: function() {
	    	Isis.deregisterView(this);
	    	$(this.el).dialog('destroy').remove();
	    }
	});
	
	Isis.DomainObjectView = Backbone.View.extend({
		
		initialize: function() {
			Isis.registerView(this);
			_.bindAll(this,'close');
	    },
	    
	    events: {
		      "click a.action"      : "prepareAction",
		      "click .ok"           : "newSubmit",
		      "click .cancel"       : "cancel",
		      "click a.detail"      : "showObject"
		},
	    
		showObject: function(e) {
		  	var oid = e.target.id;
		   	Isis.trigger('showDomainObjectRequested', Isis.Session.getObjectByOid(oid));
		},
		
		newSubmit: function(e) {
	    	e.preventDefault();
	    	var jsonMap = Isis.Forms.buildJsonBody(this.$('form'), this.model.description.properties);
	    	console.log('new property values:');
	    	console.log(jsonMap);
	    	$.each(this.model.properties, function() {
	    		if(!this.disabledReason) {
	    			this.update(jsonMap[this.name]);
	    			//this.value = jsonMap[this.name];
	    		}
	    	});
	    	Isis.Session.createOrUpdate(Isis.jsonGet(this.model.href));
	    	Isis.refreshViews();
	    	$(this.el).prepend('<div class="alert-message success"><p>Update succesful.</p></div>');
	    },
		
	    cancel: function(e) {
	    	if(e) {
	    		e.preventDefault();
	    	}
	    	this.refresh();
	    	$(this.el).prepend('<div class="alert-message success"><p>Original object properties restored.</p></div>');
	    },
		
		prepareAction: function(e) {
	    	var actionName = e.target.id;
	    	Isis.trigger('serviceActionRequested', this.model.actionByName(actionName));
	    },
		
	    refresh: function() {
	    	$(this.el).empty();
	    	this.renderProperties();
	    	this.renderCollections();
	    	this.renderActions();
		},
		
	    render: function() {
	    	this.renderProperties();
	    	this.renderCollections();
	    	this.renderActions();
	    	$(this.el).dialog({
	    		width: 600,
	    		title: 'Domain Object: '+this.model.title,
	    		close: this.close,
	    		zIndex: 1000
	    	});
	    	return this;
	    },
	    
	    renderProperties: function() {
	    	var fieldset = $('<form />').append($('fieldset'));
	    	$(this.el).append(fieldset);
	    	Isis.Forms.buildHtml(fieldset, this.model.description.properties, this.model.properties);
	    	var actions = $('<div class="actions" />');
	    	fieldset.append(actions);
	    	actions.append($('<button class="btn primary ok">OK</button> <button class="btn cancel">Cancel</button>'));
	    },
	    
	    renderCollections: function(fieldset) {
	    	var that = this;
	    	$.each(this.model.collections, function() {
	    		$(that.el).append('<h5>'+this.name+'</h5>');
	    		var ul = $('<ul />');
	    		$(that.el).append(ul);
	    		$.each(this.summaries, function() {
	    			var oid = this.href.substring(1+this.href.lastIndexOf('/'));
	    			ul.append('<li><a href="#" id="'+oid+'" class="detail">'+this.title+'</a></li>');
	    		});
	    	});
	    	$(that.el).find('a.detail').draggable({
    			appendTo: "body",
    			helper: "clone",
    			zIndex: 2000
    		});
	    },
	    
	    renderActions: function() {
	    	var div = $('<div style="word-wrap: break-word;" />');
	    	$.each(this.model.actions, function() {
	    		if(this.invocationUrl) {
	    			div.append('<span><a href="#" class="action" id="'+this.name+'">'+this.name+'</a></span>&nbsp;');
		    	} else {
		    		div.append('<span>'+this.name+'</span>&nbsp;');
		    	}
	    	});
	    	$(this.el).append(div);
	    },
	    
	    close: function(e) {
	    	Isis.deregisterView(this);
	    	$(this.el).dialog('destroy').remove();
	    }
	});
	
	Isis.ServiceView = Backbone.View.extend({

	    tagName:  "div",

	    events: {
	      "click a"              : "prepareAction",
	    },

	    initialize: function() {
	    	
	    },

	    prepareAction: function(e) {
	    	var actionName = e.target.id;
	    	Isis.trigger('serviceActionRequested', this.model.actionByName(actionName));
	    },
	    
	    render: function() {
	    	var model = this.model;
	    	var ul = $('<ul />');
	    	$.each(model.actions, function() {
				ul.append('<li><a href="#" id="'+this.name+'">'+this.name+'</a></li>');
			});
	    	$(this.el).append('<h5>'+model.title+'</h5>');
	    	$(this.el).append(ul);
	    	return this;
	    }

	  });
		
});