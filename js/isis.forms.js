//     restfulobjects-js
//     (c) 2011 Johan Andries
//     This software may be freely distributed under the MIT license.


$(function() {

	Isis.Forms = {
						
		buildHtml: function(form, params, values) { 
			var valueMap = {}; 
			if(values) {
				$.each(values, function() {
					valueMap[this.name] = {'value': this.value, 'disabledReason': this.disabledReason};
				});
			}
			var that = this;
			$.each(params, function() {
				var el = that.createLine(form, this.friendlyName, this.name);
				that[that.inputType(this.type)].buildHtml(el, this.name, valueMap[this.name]);
			});
		},
		
		buildJsonBody: function(form, params) {
			var formArray = form.serializeArray();
			var that = this;
			var jsonArgument = {};
			$.each(formArray, function() {
	    		jsonArgument[this['name']] = that[that.inputType(params[this['name']].type)].buildJsonValue(this['value']);
	    	});
			$.each(params, function(name, param){
				if(that.inputType(param.type) === 'checkbox') {
					if(!jsonArgument[param.name]) {
						jsonArgument[param.name] = false;
					} else {
						jsonArgument[param.name] = true;
					}
				}
			});
			return jsonArgument;
		},
	
		mapping: {
			'java.lang.String': 'text',
			'double': 'text',
			'int': 'text',
			'boolean': 'checkbox',
			'java.lang.Integer': 'text',
			'org.apache.isis.applib.value.Date': 'date',
			'org.apache.isis.applib.value.Money': 'text' // TODO: maybe this type implies more validations
		},
		
		inputType: function(domainType) {
			return this.mapping[domainType] || 'object';
		},
		
		checkbox: {
			buildHtml: function(el, name, value) {
				var input = $('<input type="checkbox" value="azerty" />');
				input.attr('name', name);
				if(value) {
					if (value.value) {
						input.attr('checked', 'checked');
					}
					if(value.disabledReason) {
						input.attr('disabled', true);
					}
				}
				el.append(input);
			},
			buildJsonValue: function(value) {
				return value;
			}
		},
		
		object: {
			constructDroppable: function(hiddenInput, valueWrapper) {
				var div = $('<div class="objectdroppable" />');
				if(!valueWrapper || !(valueWrapper.disabledReason)) {
					div.droppable({
						activeClass: "ui-state-default",
						hoverClass: "ui-state-hover",
						drop: function( event, ui ) {
							var oid = ui.draggable.attr('id');
							hiddenInput.attr('value', oid);
							var link = Isis.Session.getLinkByOid(oid);
							div.html('<p><a href="#" id="'+oid+'" class="detail">'+link.title+'</a></p>');
						}
					});
				} else if (valueWrapper && valueWrapper.disabledReason) {
					// TODO indicate fact that this is disabled
				}
				return div;
			},
			
			buildHtml: function(el, name, valueWrapper) {
				var hiddenInput = $('<input type="hidden" />');
				hiddenInput.attr('name', name);
				el.append(hiddenInput);
				var div = this.constructDroppable(hiddenInput, valueWrapper);
				el.append(div);
				if(valueWrapper && valueWrapper.value) {
					var oid = valueWrapper.value;
					hiddenInput.attr('value', oid);
					div.html('<p><a href="#" id="'+oid+'" class="detail">'+Isis.Session.getLinkByOid(oid).title+'</a></p>'); 
				} else {
					div.html('<p>Drop an object here...</p>');
				}
			},
			
			buildJsonValue: function(value) {
				if (value === "") {
					return null;
				} else {
					return {
					    "rel": "object", 
					    "href": Isis.Session.getLinkByOid(value).href,  
					    "method": "GET" 
					};
				}
			}
		},
		
		date: {
			buildHtml: function(el, name, value) {
				var input = $('<input type="text" class="span2" />');
				input.attr('name', name);
				if(value) {
					input.attr('value', value.value);
					if(value.disabledReason) {
						input.attr('disabled', true);
					}
				}
				el.append(input);
				input.datepicker({ dateFormat: 'yymmdd' });
			},
			buildJsonValue: function(value) {
				return value;
			}
		},
		
		text: {
			buildHtml: function(el, name, value) {
				var input = $('<input type="text" class="xlarge" />');
				input.attr('name', name);
				if(value) {
					input.attr('value', value.value);
					if(value.disabledReason) {
						input.attr('disabled', true);
					}
				}
				el.append(input);
			},
			buildJsonValue: function(value) {
				if (value === "") {
					return null;
				} else {
					return value;
				}
			}
		},
			
		createLine: function(form, friendlyName, name) {
			var line = $('<div class="clearfix" />');
    		form.append(line);
    		var label = $('<label />');
    		label.attr('for', name);
    		label.html(friendlyName);
    		line.append(label);
    		var inputdiv = $('<div class="input"/>');
    		line.append(inputdiv);
    		return inputdiv;
		}
			
	};
	
});
