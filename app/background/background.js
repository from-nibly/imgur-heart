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

var api = new API("de391aff98092db");

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
    $(".stats-link").after('<div class="progress" style="display:inline-block; width:20%; height:25%; vertical-align:middle; margin-left:15px;"><div class="progress-bar progress-bar-success" role="progressbar"></div><div class="progress-bar progress-bar-danger" role="progressbar"></div></div>');
    points = $(".progress");
  } else {
    console.log('hiding upvote-bar');
    points = $('.stats-link');
  }

  var button = $(".favorite-image");
  points.after('<div class="tag-holder"></div>');

});

function generateTags() {
  if (!tagsGenerated) {
    if (window.location.href.indexOf("https") > -1) {
      var imageID = window.location.href.replace("https://imgur.com/gallery/", "");
    } else {
      var imageID = window.location.href.replace("http://imgur.com/gallery/", "");
    }

    var apiUrl;

    if ($("body").html().indexOf("album-image") > -1) {
      apiUrl = 'https://api.imgur.com/3/gallery/album/' + imageID + '/tags'
    } else {
      apiUrl = 'https://api.imgur.com/3/gallery/image/' + imageID + '/tags'
    }

    $.ajax({
      type: "GET",
      url: apiUrl,
      dataType: 'json',
      async: true,
      headers: {
        "Authorization": " Client-ID " + "de391aff98092db"
      },
      success: function(result) {
        var holder = $(".tag-holder");
        holder.empty();
        for (i = 0; i < result.data.tags.length; i++) {
          console.log(result.data.tags[i].name);
          tagName = result.data.tags[i].name;
          tagsGenerated = true;
          holder.append('<br><a class="tag-link" href="/t/' + tagName + '">' + tagName + '</a>');
        }
      }
    });
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
    if (window.location.href.indexOf("https") > -1) {
      var imageID = window.location.href.replace("https://imgur.com/gallery/", "");
    } else {
      var imageID = window.location.href.replace("http://imgur.com/gallery/", "");
    }
    var apiUrl;

    if ($("body").html().indexOf("album-image") > -1) {
      apiUrl = 'https://api.imgur.com/3/gallery/album/' + imageID + '/votes'
    } else {
      apiUrl = 'https://api.imgur.com/3/gallery/image/' + imageID + '/votes'
    }

    $.ajax({
      type: "GET",
      url: apiUrl,
      dataType: 'json',
      async: true,
      headers: {
        "Authorization": " Client-ID " + "de391aff98092db"
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
  updateVoteBar();
  generateTags();
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

  this.getTags(imageId, type, callback) {
    return getThing(imageId, type, 'tags', callback)
  }

  this.getVotes(imageId, type, callback) {
    return getThing(imageId, type, 'votes', callback)
  }

  function getThing(imageId, type, thing, callback) {
    var cached = getCachedObject(imgageId);
    if (cached[thing]) {
      callback(cached[thing]);
      return;
    }
    var apiUrl = 'https://api.imgur.com/3/gallery/' + type + '/' + imageID + '/' + thing;
    $.ajax({
      type: "GET",
      url: apiUrl,
      dataType: 'json',
      async: true,
      headers: {
        "Authorization": " Client-ID " + key
      },
      success: function(result) {
        cached[thing] = result;
        callback(cached[thing]);
      }
    });
  }

  this.clear() {
    cache = {};
  }

};