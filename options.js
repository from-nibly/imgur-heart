/*
The MIT License (MIT)
Copyright (c) <year> <copyright holders>
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

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
    obj[$(this).attr('id')] = value;
	chrome.storage.sync.set(obj);
  });

  $('#status').text("Saved").slideDown();
  setTimeout(function() {$('#status').slideUp(function() {$(this).text("");})}, 3000);
}

// Restore options from chrome.storage
function restore_options() {
  $('#options-list input[type="checkbox"]').each(function() {
    var obj = {};
    var check = $(this);
    obj[$(this).attr('id')] = 1;
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
    chrome.storage.sync.get(obj,
      function(item) {
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
