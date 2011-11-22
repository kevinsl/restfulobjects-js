//     restfulobjects-js
//     (c) 2011 Johan Andries
//     This software may be freely distributed under the MIT license.

$(function() {
	
	Isis.JsonClient = function(url, success, error) {
		$.ajax({
			url: url+'/services',
			dataType: 'json',
			success: function(resp, status, xhr) {
				$.each(resp.values, function() {
					$.ajax({
						url: this['href'],
						dataType: 'json',
						success: function(resp, status, xhr) {
							success(new Isis.DomainObject(Isis.jsonGet(url+'/objects/'+resp.oid)));
						},
						error: function(jqXHJR, textStatus, error) {
							alert('service niveau: '+textStatus+" "+error+jqXHJR.responseXML+" "+jqXHJR.responseText);
						}
					});
					
				});
			},
			error: error		
			
		});
	};
	
	Isis.bind('serviceActionRequested', function(action) {
		if(action.arguments.length > 0) {
			var el = $('<div />');
			$('.content').append(el);
			new Isis.ActionInvocationRequestView({el: el, model: action}).render();
		} else {
			action.invoke({});
		}
	});
	
	Isis.bind('actionResponseArrived', function(resp) {
		console.log('ontvangen:');
		console.log(resp);
		var type = resp.resulttype;
		if (type === 'list') {
			var el = $('<div />');
			$('.content').append(el);
			var list = new Isis.DomainObjectList(resp.result.values);
			var view = new Isis.ListView({el: el, model: list});
			view.render();
		} else if (type === 'domainobject') {
			Isis.trigger('showDomainObjectRequested', Isis.Session.createOrUpdate(resp.result));
		} else {
			//alert('empty action respone');
		}
		if (resp.extensions && resp.extensions.changed) {
			$.each(resp.extensions.changed, function() {
				Isis.Session.createOrUpdate(Isis.jsonGet(this.href));
			});
		}
		// TODO what about disposed objects?
		Isis.refreshViews();
	});
	
	Isis.bind('showDomainObjectRequested', function(domainObject) {
		var el = $('<div />');
		$('.content').append(el);
		var view = new Isis.DomainObjectView({el: el, model: domainObject});
		view.render();
	});

	/*Isis.bind('domainObjectCopied', function(domainObject) {
		Isis.Clipboard = {
			"href": Isis.getLink(domainObject.raw.links, 'self').href,
			"title": domainObject.title,
			"type": domainObject.description.type	
		};
	});*/
	
	Isis.init = function(url) {
		Isis.baseUrl = url;
		Isis.JsonClient(url,
			function(service) {
				var view = new Isis.ServiceView({model: service});
				$('.well').append(view.render().el);
			},
			function() {
				alert('error getting home page');
			}
		);
	}	
});