// Saves options to chrome.storage
function save_options() {
	$('#options-list li input[type="checkbox"]').each(function() {
		var obj = {};
		var check = $(this);
		obj[$(this).attr('id')] = $(this).prop("checked");
		chrome.storage.sync.set( obj );
	});
}

// Restore options from chrome.storage
function restore_options() {
	$('#options-list li input[type="checkbox"]').each(function() {
		var obj = {};
		var check = $(this);
		obj[$(this).attr('id')] = 1;
		chrome.storage.sync.get( obj, 
			function(item) {
				$("#"+check.attr('id')).prop("checked", item[check.attr('id')]);
			}
		);
	});
}

// initiate and set event handlers
$(document).ready(function() {
	$('#options-list li').click(function () {$(this).find('input').click();});
	restore_options();
	$('#save').click(save_options);
});
