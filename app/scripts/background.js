'use strict';

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

var KEY = 'event description template';
var store = {
  load: function () {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  },
  save: function (templates) {
    localStorage.setItem(KEY, JSON.stringify(templates));
  }
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.command) {
    case 'store.save':
      store.save(request.templates);
      sendResponse(request.templates);
      break;
    case 'store.load':
      sendResponse(store.load());
      break;
    default:
      console.log('unknown command: ' + request.command);
      break;
  }
});

console.log('\'Allo \'Allo! Event Page');
