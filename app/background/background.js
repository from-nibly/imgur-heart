/*
The MIT License (MIT)
Copyright (c) <year> <copyright holders>
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
console.log('Loading Imgur<3');

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
options['staff-highlight'] = true;
options['famous-imgurians'] = true;

var api = new API("980724d0ab40dda");
var apiKey = "980724d0ab40dda";
var imageID;
var imageType;
var gettingTags;
var gettingRep;
var gettingVotes;
var staffFamousData;


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

// read server data
chrome.runtime.sendMessage({method: "getFamous"}, function(response) {
  staffFamousData = JSON.parse(response.status);
  if(options['staff-highlight'] || options['famous-imgurians']) {
    var caps = $("#captions").find(".comment");
    $("#captions").load($(this).bind("DOMNodeInserted", function(event) {checkFamous(event)}));
    for(var i = 0; i < caps.length; i++) {
      var commentSingle = {"target": caps[i]};
      checkFamous(commentSingle);
    }
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
  if(gettingTags != true){
    gettingTags = true;
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
      gettingTags = false;
    });
  }
}

function getImageProperties() {
  imageID = document.URL.substr(document.URL.lastIndexOf('/')+1);
  if ($("body").html().indexOf("album-image") > -1) {
    imageType = "album";
  } else {
    imageType = "image";
  }
}

// is called when a comment is inserted into the dom
function checkFamous(event) {
  var comment = $(event.target);
  if(!comment.hasClass("comment"))
    return false;
  comment = comment.find("> .caption > .usertext > .author");
  var username = comment.children().first().attr('href');
  if(!username)
    return;
  username = username.substr(username.lastIndexOf('/')+1);
  if(options['famous-imgurians']) {
	for(var i = 0; i < staffFamousData['famousImgurians'].length; i++) {
	  if(staffFamousData['famousImgurians'][i].username == username) {
		if(comment.children(':nth-child(2)').text() == "OP")
		  var appendie = comment.children(':nth-child(2)');
		else
		  var appendie = comment.children().first();
		appendie.after(" <span class='green'>Known for</span> "+staffFamousData['famousImgurians'][i].famousFor + " :");
		break;
      }
	}
  }
  if(options['staff-highlight']) {
	for(var i = 0; i < staffFamousData['staffMembers'].length; i++) {
	  if(staffFamousData['staffMembers'][i] == username) {
		if(comment.children(':nth-child(2)').text() == "OP")
		  var appendie = comment.children(':nth-child(2)');
		else
		  var appendie = comment.children().first();
		appendie.after(" <span class='green'>Staff</span>");
		break;
      }
	}
  }

}

function update() {
  changeBodyText();
}

function changeBodyText(color) {
  $('body').css('color', color);
}

var ups;
var downs;

function updateVoteBar() {
  if(gettingVotes != true){
    gettingVotes = true;
  window.setTimeout(function() {
	  api.getVotes(imageID, imageType, function(result) {
      ups = result.data.ups;
      downs = result.data.downs;
      percentUp = ((ups) / (ups + downs)) * 100;
      percentDown = ((downs) / (ups + downs)) * 100;

      $(".progress-bar-success").css("width", percentUp + "%");

      if (options['upvote-bar-text']) {
        $(".progress-bar-success").html(ups + "/" + downs);
      }

      $(".progress-bar-danger").css("width", percentDown + "%");
        gettingVotes = false;
	  });
    }, 50);
  }
}
$("#image").bind("DOMSubtreeModified", function() {
  tagsGenerated = false;
  getImageProperties(); //No API Calls
  console.log("UPDATE " + imageID);
  updateVoteBar();
  generateTags();
  prepUserData();

});



$(document).ready(function() {
  tagsGenerated = false;
  getImageProperties(); //No API Calls
  updateVoteBar(); //1 API Call
  generateTags();
  prepUserData();

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

  var imageCache = [];

  var userCache = [];

  function getCachedObject(imgageId) {
    for (var x in imageCache) {
      if (imageCache[x].imageId == imgageId) {
        return imageCache[x];
      }
    }
    //if the value is not found make a new one
    var newValue = {};
    newValue.imageId = imgageId;
    imageCache.push(newValue);
    //if our cache is too big remove one of the values.
    if (imageCache.length > 30) {
      imageCache.shift();
    }
    return newValue;
  }

  function getCachedUser(userID) {
    for (var x in userCache) {
      if (userCache[x].userID == userID) {
        return userCache[x];
      }
    }
    //if the value is not found make a new one
    var newValue = {};
    newValue.userID = userID;
    userCache.push(newValue);

    //if our cache is too big remove one of the values.
    if (userCache.length > 30) {
      userCache.shift();
    }
    return newValue;
  }

  this.getTags = function(imageId, type, callback) {
    return getThing(imageId, type, 'tags', callback)
  }

  this.getVotes = function(imageId, type, callback) {
    return getThing(imageId, type, 'votes', callback)
  }

  this.getRep = function(userID, callback){
    return getUserData(userID, 'reputation', callback);
  }

  function getUserData(userID, thing, callback){
    var cached = getCachedUser(userID);
    if (cached[thing]) {
      callback(cached[thing]);
      console.log('getting from cache');
      return;
    }
    var apiUrl = 'https://api.imgur.com/3/account/' + userID;
    $.ajax({
      type: "GET",
      url: apiUrl,
      dataType: 'json',
      async: true,
      headers: {
        "Authorization": " Client-ID " + key
      }
    }).done(function(result) {
      console.log('got user data from api');
      cached[thing] = result;
      callback(cached[thing]);
    }).fail(function(message) {
      console.log('failed to get user data', message);
    });


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
      console.log('got '+thing+' data from api');
      cached[thing] = result;
      callback(cached[thing]);
    }).fail(function(message) {
      console.log('failed to get image data', message);
    });
  }

  this.clear = function() {
    imageCache = {};
    userCache = {};
  }

};

//Function to bring up user info on hover
function getUserData(userID, authorElement) {

  api.getRep(userID, function(result){
    rep = result.data.reputation;
    $(authorElement).attr("data-toggle", "tooltip");
    $(authorElement).attr("data-placement", "left");
    $(authorElement).prop("title", "Rep: " + rep);
    $(authorElement).tooltip();
    $(authorElement).tooltip("show");
  });

}

function prepUserData(event){
  var comment = $(event.target);
  if(!comment.hasClass("comment"))
    return false;
    comment = comment.find("> .caption > .usertext > .author");
    var userID;
    comment.off();
    comment.on({
      mouseenter: function() {
        //Mouse in
        gettingRep = true;
        userID = $(this).find("a").html();
        getUserData(userID, this);

      },

      mouseleave: function() {
        //Mouse out
        setTimeout(function(){
          $(this).tooltip("hide");
        }, 100);


      }});
    //$(".author").find("a").removeAttr("href");
    //$(".author").find("a").on("click", function(){
    //  openUserModal(userID);
    //});
}

function openUserModal(userID){



}
