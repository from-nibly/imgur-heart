// Saves options to chrome.storage
function save_options() {
  $('#options-list input[type="checkbox"]').each(function() {
    var obj = {};
    var check = $(this);
    obj[$(this).attr('id')] = $(this).prop("checked");
    chrome.storage.sync.set(obj);
  });
  $('#options-list input[type="text"]').each(function() {
    var obj = {};
    var value = $(this).val();
    console.log('saving', value);
    obj[$(this).attr('id')] = value;
    chrome.storage.sync.set(obj);
  });
}

// Restore options from chrome.storage
function restore_options() {
  $('#options-list input[type="checkbox"]').each(function() {
    var obj = {};
    var check = $(this);
    obj[$(this).attr('id')] = 1;
    console.log('restoring', obj);
    chrome.storage.sync.get(obj,
      function(item) {
        $("#" + check.attr('id')).prop("checked", item[check.attr('id')]);
      }
    );
  });
  $('#options-list input[type="text"]').each(function() {
    var obj = {};
    var text = $(this);
    obj[$(this).attr('id')] = $(this).text();
    console.log('restoring', obj);
    chrome.storage.sync.get(obj,
      function(item) {
        console.log('restoring finally', item[text.attr('id')]);
        $("#" + text.attr('id')).prop("value", item[text.attr('id')]);
      }
    );
  });
}

// initiate and set event handlers
$(document).ready(function() {
  restore_options();
  $('#save').click(save_options);
});