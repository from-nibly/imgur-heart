/*
The MIT License (MIT)
Copyright (c) <year> <copyright holders>
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
console.log('imgur heart is loading');

var options = {};
// default settings
options['text-color'] = '#ddddd1';
options['tag-links'] = true;
options['green-heart'] = true;
options['upvote-bar'] = true;
options['upvote-bar-text'] = true;
options['op-edit'] = false;
options['op-text'] = "OP";
options['op-color'] = "#85BF25";

var api = new API("22dd312bdfad566");
var apiKey = "22dd312bdfad566";
var imageID;
var imageType;

// load user settings
chrome.storage.sync.get(options, function(data) {
  var keys = Object.keys(data);
  keys.forEach(function(elm, index) {
    console.log('retrieved', elm, data[elm]);
    options[elm] = (data[elm] === "" || data[elm] === undefined ? options[elm] : data[elm]);
  });


  // Apply changes
  if (options['tag-links'] == true) {
    console.log("tag-links is on");
  }
  if (options['green-heart'] == true) {
    $('head').append('<link rel="stylesheet" href="' + chrome.extension.getURL('css/greenheart.css') + '" />');
  }

  for (var x in options) {
    console.log(x, ":", options[x]);
  }
});

$(document).ready(function() {

  var tagsGenerated = false;
  var points;
  if (options['upvote-bar']) {
    $(".stats-link").after('<div class="progress" style="display:inline-block; width:20%; height:10px; vertical-align:middle; margin-left:15px;"><div class="progress-bar progress-bar-success" role="progressbar"></div><div class="progress-bar progress-bar-danger" role="progressbar"></div></div>');
    points = $(".progress");
  } else {
    console.log('hiding upvote-bar');
    points = $('.stats-link');
  }

  var button = $(".favorite-image");
  points.after('<div class="tag-holder"></div>');
  console.log('checking points', points);

});

function generateTags() {

  //right here we can get tags

  //so we just grab the instance of api.  (we need to keep the same instance for the cache to work)


  //we can call this as many times as we want and it will just get the cache if it exists.
  //no more unexplained extra api calls. :)
  //also less messy code in our business logic.

  api.getTags(imageID, imageType, function(result) {
	result.data.tags.sort(function(a,b) {return (b.ups-b.downs)-(a.ups-a.downs);});
	console.log('results from getting tags', result);
    var holder = $(".tag-holder");
    console.log('checking holder', holder);
    holder.empty();
    for (i = 0; i < result.data.tags.length; i++) {
	  if(i == 2)
		break;
      console.log(result.data.tags[i].name);
      tagName = result.data.tags[i].name;
      tagsGenerated = true;
      holder.append('<br><a class="tag-link" href="/t/' + tagName + '">' + tagName + '</a>');
    }
  });
}

function getImageProperties() {

  imageID = $('#mainUpArrow').attr('data');

  if ($("body").html().indexOf("album-image") > -1) {
    imageType = "album";
  } else {
    imageType = "image";
  }


}

function update() {
  changeBodyText();
}

function changeBodyText(color) {
  $('body').css('color', color);
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
  changeBodyText(changes['text-color'].newValue);
});
chrome.storage.sync.get('text-color', function(obj) {
  changeBodyText(obj['text-color']);
});

var ups;
var downs;

function updateVoteBar() {
  window.setTimeout(function() {
    var apiUrl = 'https://api.imgur.com/3/gallery/' + imageType + '/' + imageID + '/votes';

    $.ajax({
      type: "GET",
      url: apiUrl,
      dataType: 'json',
      async: true,
      headers: {
        "Authorization": " Client-ID " + apiKey
      },
      success: function(result) {
        ups = result.data.ups;
        downs = result.data.downs;
        percentUp = ((ups) / (ups + downs)) * 100;
        percentDown = ((downs) / (ups + downs)) * 100;

        $(".progress-bar-success").css("width", percentUp + "%");

        if (options['upvote-bar-text']) {
          $(".progress-bar-success").html(ups + "/" + downs);
        }

        $(".progress-bar-danger").css("width", percentDown + "%");
      }
    });
  }, 50);
}
$("#image").bind("DOMSubtreeModified", function() {
  tagsGenerated = false;
  getImageProperties();
  updateVoteBar();
  generateTags();

});

$(document).ready(function() {
  tagsGenerated = false;
  getImageProperties();
  updateVoteBar();
  generateTags();
  setTimeout(function() {
    $(".author").attr("data-toggle", "tooltip");
    $(".author").attr("data-placement", "left");
    var userID;
    $(".author").hover(
      function() {
        //Mouse in
        userID = $(this).find("a").html();
        getUserData(userID, this);

      },
      function() {
        //Mouse out
        $(this).tooltip("hide");

      });
    //$(".author").find("a").removeAttr("href");
    //$(".author").find("a").on("click", function(){
    //  openUserModal(userID);
    //});
  }, 2500);

});

$("#captions").bind("DOMSubtreeModified", function() {
  if (options['op-edit'] == true) {
    $("#captions span.green").each(function(index) {
      if (this.innerHTML === "OP") {
        this.innerHTML = options['op-text'];
        this.setAttribute('style', 'color: ' + options['op-color'] + ' !important;');
      }
    });
  }
});

function API(key) {

  var cache = [];

  function getCachedObject(imgageId) {
    for (var x in cache) {
      if (cache[x].imageId === imgageId) {
        return cache[x];
      }
    }
    //if the value is not found make a new one
    var newValue = {};
    newValue.imageId = imgageId;
    cache.push(newValue);
    //if our cache is too big remove one of the values.
    if (cache.length > 30) {
      cache.shift();
    }
    return newValue;
  }

  this.getTags = function(imageId, type, callback) {
    return getThing(imageId, type, 'tags', callback)
  }

  this.getVotes = function(imageId, type, callback) {
    return getThing(imageId, type, 'votes', callback)
  }

  function getThing(imageId, type, thing, callback) {
    var cached = getCachedObject(imageId);
    if (cached[thing]) {
      callback(cached[thing]);
      console.log('getting from cache');
      return;
    }
    var apiUrl = 'https://api.imgur.com/3/gallery/' + type + '/' + imageId + '/' + thing;
    $.ajax({
      type: "GET",
      url: apiUrl,
      dataType: 'json',
      async: true,
      headers: {
        "Authorization": " Client-ID " + key
      }
    }).done(function(result) {
      console.log('got from api');
      cached[thing] = result;
      callback(cached[thing]);
    }).fail(function(message) {
      console.log('failed to get data', message);
    });
  }

  this.clear = function() {
    cache = {};
  }

};

//Function to bring up user info on hover
function getUserData(userID, authorElement) {

  var apiUrl = 'https://api.imgur.com/3/account/' + userID;
  $.ajax({
    type: "GET",
    url: apiUrl,
    dataType: 'json',
    async: true,
    headers: {
      "Authorization": " Client-ID " + apiKey
    }
  }).done(function(result) {
    rep = result.data.reputation;
    $(authorElement).prop("title", "Rep: " + rep);
    $(authorElement).tooltip();
    $(authorElement).tooltip("show");

  }).fail(function(message) {
    console.log('failed to get data', message);
  });

}

function openUserModal(userID){



}
