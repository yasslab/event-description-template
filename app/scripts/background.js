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

function createContextMenus() {
  chrome.contextMenus.removeAll();

  var parentMenu = chrome.contextMenus.create({title: 'テンプレートを貼る', contexts: ['editable']});
  var templates = store.load();
  for (var i = 0; i < templates.length; i++) {
    chrome.contextMenus.create({parentId: parentMenu, id: templates[i].name, title: templates[i].name, contexts: ['editable']});
  }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.command) {
    case 'store.save':
      store.save(request.templates);
      sendResponse(request.templates);
      createContextMenus();
      break;
    case 'store.load':
      sendResponse(store.load());
      break;
    default:
      console.log('unknown command: ' + request.command);
      break;
  }
});

function findTemplate(templates, name) {
  for (var i = 0; i < templates.length; i++ ) {
    if (name === templates[i].name) {
      return templates[i];
    }
  }
}

function onClickHandler(info, tab) {
  var template = findTemplate(store.load(), info.menuItemId);
  if (!template) {
    return;
  }

  var templateStr = '<!-- template: ' + template.name + ' -->\n' + template.content + '\n<!-- template: ' + template.name + ' -->\n';
  chrome.tabs.sendMessage(tab.id, {command: 'paste', template: templateStr});
}

chrome.contextMenus.onClicked.addListener(onClickHandler);
