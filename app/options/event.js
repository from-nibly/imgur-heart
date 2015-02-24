/*
The MIT License (MIT)
Copyright (c) <year> <copyright holders>
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


function startup(details) {
  $.getJSON("http://anton-portfolio.info:8080/", function(data) {
	console.log("Imgur<3 booting");
	console.log("Data from server: ");
	console.log(data);
	localStorage['famous'] = JSON.stringify(data);
  });
}

// Fires on extension boot
chrome.runtime.onStartup.addListener(startup());
// Fires on updates and installation
chrome.runtime.onInstalled.addListener(startup());

// listens for messages from contentScripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.method == "getFamous")
		sendResponse({status: localStorage['famous']});
	else
		sendResponse({});
});

// Opens options page when toolbar icon is clicked
chrome.browserAction.onClicked.addListener(function(tab) {
	
  console.log("Clicked toolbar icon");
  var optionsUrl = chrome.extension.getURL('options/options.html');
  chrome.tabs.query({
    url: optionsUrl
  }, function(tabs) {
    if (tabs.length) {
      chrome.tabs.update(tabs[0].id, {
        active: true
      });
    } else {
      chrome.tabs.create({
        url: optionsUrl
      });
    }
  });
});
