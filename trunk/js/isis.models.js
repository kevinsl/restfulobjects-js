//     restfulobjects-js
//     (c) 2011 Johan Andries
//     This software may be freely distributed under the MIT license.

$(function() {

	Isis.PropertyDescr = function(raw) {
		this.name = raw.id;
		this.friendlyName = raw.extensions.friendlyName;
		if(raw.memberType === 'property') {
			this.completeType = Isis.getLink(raw.links, 'returntype').href;
			this.type = this.completeType.substring(1+this.completeType.lastIndexOf('/'));
		} else {
			alert(this.friendlyName+' is een ongekend membertype ('+raw.memberType+')');
		}
	}
	
	Isis.CollectionDescr = function(raw) {
		this.name = raw.id;
		this.friendlyName = raw.extensions.friendlyName;
	}
	
	Isis.ActionParamDescr = function(raw) {
		this.friendlyName = raw.extensions.friendlyName;
		this.name = raw.name;
		this.optional = raw.optional;
		this.completeType = Isis.getLink(raw.links, 'returntype').href;
		this.type = this.completeType.substring(1+this.completeType.lastIndexOf('/'));
	}
	
	Isis.ActionDescr = function(raw) {
		this.id = raw.id;
		this.friendlyName = raw.extensions.friendlyName;
		this.completeReturnType = Isis.getLink(raw.links, 'returntype').href;
		this.returnType = this.completeReturnType.substring(1+this.completeReturnType.lastIndexOf('/'));
		this.parameters = {};
		var that = this;
		$.each(raw.parameters, function() {
			var param = new Isis.ActionParamDescr(Isis.jsonGet(this.href));
			that.parameters[param.name] = param;
		});
	}
	
	Isis.DomainObjectDescr = function(raw) {
		this.friendlyName = raw.extensions.friendlyName;
		this.completeType = Isis.getLink(raw.links, 'self').href;
		this.type = this.completeType.substring(1+this.completeType.lastIndexOf('/'));
		this.actions = {};
		this.properties = {};
		var that = this;
		$.each(raw.members, function() {
			if(this.rel === 'property') {
				
				if(this.type === 'application/json;profile="urn:org.restfulobjects/propertydescription"') {
					var property = new Isis.PropertyDescr(Isis.jsonGet(this.href));
					that.properties[property.name] = property;
				} else if(this.type === 'application/json;profile="urn:org.restfulobjects/collectiondescription"') {
					//property = new Isis.CollectionDescr(Isis.jsonGet(this.href));
					// TODO Should these go in a different map?
				}
				
			} else if(this.rel === 'action') {
				// TODO this if is a workaround for an Isis defect (?)
				if(!(this.href.match('/id$')=='/id')) {
					var actionRaw = new Isis.ActionDescr(Isis.jsonGet(this.href));
					that.actions[actionRaw.id] = actionRaw;
				}
			} else {
				//alert("Unsupported member type: "+this.rel);
			}
		});
	}
	
	Isis.Model = (function(){
		var model = {};
		model.byUrl = function(url) {
			if(!this[url]) {
				this[url] = new Isis.DomainObjectDescr(Isis.jsonGet(url)); 
			}
			return this[url];
		}
		return model;
	})();
	
	Isis.Argument = function(name) {
		this.name = name;
	}
		
	Isis.DomainObjectList = function(hrefArray) {
		this.elements = [];
		var that = this;
		$.each(hrefArray, function() {
			var href = this.href;
			that.elements.push(Isis.Session.createOrUpdate(Isis.jsonGet(href)));
		});
	}
	
	Isis.Action = function(objectDescription, raw) {
		this.arguments = [];
		this.name = raw.id;
		this.description = objectDescription.actions[this.name];
		var that = this;
		var rawInvocation = Isis.getLink(raw.links,'invoke');
		if (rawInvocation) {
			this.invocationUrl = rawInvocation.href;
			this.method = rawInvocation.method;
			$.each(rawInvocation.arguments, function(key, value) {
				var argument = new Isis.Argument(key);
				that.arguments.push(argument);
			});
		} else {
			// action is disabled
		}
	}
	Isis.Action.prototype.invoke = function(argumentsObject) {
		
		$.ajax({
			url: this.invocationUrl,
			dataType: 'text',
			contentType: "application/json; charset=utf-8",
			data: JSON.stringify(argumentsObject),
			type: this.method,
			processData: false,
			success: function(resp, status, xhr) {
				if (resp) {
					Isis.trigger('actionResponseArrived', JSON.parse(resp));
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				alert('fout bij action invocatie: '+errorThrown);
			},
			async: false
		});
	};
	
	Isis.Property = function(objectDescription, raw) {
		this.name = raw.id;
		this.description = objectDescription.properties[this.name];
		this.value = raw.value;
		if (this.value && (typeof this.value) === 'object') {
			this.value = Isis.Session.createOrUpdate(Isis.jsonGet(this.value.href)).oid;
		}
		this.disabledReason = raw.disabledReason;
		this.href = Isis.getLink(raw.links,'self').href;
	}
	Isis.Property.prototype.update = function(value) {
		if(value !== null) {
			var that = this;
			$.ajax({
				url: this.href,
				dataType: 'text',
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify({"value":value}),
				type: 'PUT',
				processData: false,
				success: function(resp, status, xhr) {
					console.log('updated property '+that.name+ ' to value ' + value);
				},
				error: function(jqXHR, textStatus, errorThrown) {
					alert('fout bij property update ('+that.name+'): '+errorThrown);
				},
				async: false
			});
		}
	}
	
	Isis.ObjectSummary = function(raw) {
		this.href = raw.href;
		this.title = raw.title;
	}
	
	Isis.Collection = function(raw) {
		this.name = raw.id;
		this.summaries = [];
		var that = this;
		$.each(raw.value, function() {
			var obj = Isis.Session.createOrUpdate(Isis.jsonGet(this.href));
			that.summaries.push(new Isis.ObjectSummary(obj));
		});
	}
	
	Isis.DomainObject = function(raw) {
		this.initFromRaw(raw);
	}
	Isis.DomainObject.prototype.initFromRaw = function(raw) {
		this.raw = raw;
		this.href = Isis.getLink(raw.links,'self').href;
		this.description = Isis.Model.byUrl(Isis.getLink(raw.links,'describedby').href);
		this.title = raw.title;
		this.oid = raw.oid;
		var actions = [];
		var properties = [];
		var collections = [];
		var that = this;
		$.each(raw.members, function() {
			if (this.memberType === 'action') {
				if(this.links) {
					actions.push(new Isis.Action(that.description, Isis.jsonGet(Isis.getLink(this.links,'details').href)));
				} else {
					console.log(this.id+' is an action without links...');
				}
			} else if(this.memberType === 'property') {
				properties.push(new Isis.Property(that.description, Isis.jsonGet(Isis.getLink(this.links,'details').href)));
			} else if(this.memberType === 'collection') {
				collections.push(new Isis.Collection(Isis.jsonGet(Isis.getLink(this.links,'details').href)));
			} else {
				alert('Unknown object memberType: ' + this.memberType);
			}
		});
		this.actions = actions;
		this.properties = properties;
		this.collections = collections;
	};
	Isis.DomainObject.prototype.actionByName = function(name) {
		return _.select(this.actions, function(action) { return action.name === name})[0];
	};
	
	Isis.Session = (function() {
		var objectMap = {};
		
		return {
			createOrUpdate: function(raw) {
				var oid = raw.oid;
				if(objectMap[oid]) {
					objectMap[oid].initFromRaw(raw);
				} else {
					objectMap[oid] = new Isis.DomainObject(raw);
				}
				return objectMap[oid];
			},
			
			getObjectByOid: function(oid) {
				if(objectMap[oid]) {
					return objectMap[oid];
				} else {
					alert('Object with oid '+oid+' not present in session');
				}
			},
			
			getLinkByOid: function(oid) {
				var obj = objectMap[oid];
				if (obj) {
					return {'href': obj.href, 'title': obj.title};
				} else {
					alert('Object with oid '+oid+' not present in session');
				}
			}
		};
	})();
		
});