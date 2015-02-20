// Saves options to chrome.storage
function save_options() {
	var color = $('#color').val();
	var likesColor = $('like').attr("checked");
	chrome.storage.sync.set({
		favoriteColor: color,
		likesColor: likesColor
	}, function() {
    // Update status to let user know options were saved.
    var status = $('#status');
	status.text('Options saved.');
    setTimeout(function() {
		status.text('');
	}, 750);
  });
}

// Restore options from chrome.storage
function restore_options() {
  chrome.storage.sync.get({
    favoriteColor: 'red',
    likesColor: true
  }, function(items) {
	  $('#color').val(items.favoriteColor);
	  $('#like').attr("checked", items.likesColor);
  });
}

$(document).ready(function() {
	restore_options();
	$('#save').click(save_options);
});
