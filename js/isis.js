//     restfulobjects-js
//     (c) 2011 Johan Andries
//     This software may be freely distributed under the MIT license.

$(function() {
	
	Isis = {};
	
	_.extend(Isis, Backbone.Events);
	
	Isis.views = {};
	Isis.registerView = function(view) {
		this.views[view.cid] = view;
	}
	Isis.deregisterView = function(view) {
		delete this.views[view.cid];
	}
	Isis.refreshViews = function() {
		$.each(Isis.views, function(cid, view) {
			view.refresh();
		});
	}
	
	Isis.jsonGet = function(url) {
		var result;
		$.ajax({
			async: false,
			url: url,
			dataType: 'json',
			success: function(resp, status, xhr) {
				result = resp;
			},
			error: function(jqXHJR, textStatus, error) {
				throw textStatus+':'+error;
			}
		});
		return result;
	}
	
	Isis.getLink = function(array, relType) {
		var result = _.select(array, function(value) {
			return value.rel === relType;
		});
		if(result) {
			return result[0];
		} else {
			return null;
		}
	};
	
	Isis.getLinks = function(array, relType) {
		return _.select(array, function(value) {
			return value.rel === relType;
		});
	}
		
});