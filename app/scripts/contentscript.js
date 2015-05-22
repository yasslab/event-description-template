/* global JsDiff */

'use strict';

var store = {
  load: function (callback) {
    chrome.runtime.sendMessage({command: 'store.load'}, callback);
  },
  save: function (templates, callback) {
    chrome.runtime.sendMessage({command: 'store.save', templates: templates}, callback);
  }
};

function findTemplate(templates, name) {
  for (var i = 0; i < templates.length; i++ ) {
    if (name === templates[i].name) {
      return templates[i];
    }
  }
}

function replaceConfirm(content1, content2) {
  return window.confirm('置き換えますか?\n\n' + JsDiff.createPatch('イベント内容', content1, content2));
  // return window.confirm('----------------\n' + content1 + '\n----------------\n' + content2 + '\n----------------\n置き換えますか?');
}

function updateDescription(templates, description) {
  return description.replace(/^<!-- template: (.*) -->$\n([\s\S]+?)\n^<!-- template: (.*) -->$/gm, function (original, name, content, name2) {
    if (name !== name2) {
      throw new Error('template:' + name + ' と template: ' + name2 + ' が一致しません。');
    }

    var template = findTemplate(templates, name);

    if (typeof template === 'undefined') {
      window.alert('template: ' + name + ' が見つかりません。');
      return original;
    }

    if (content === template.content) {
      return original;
    }

    if (replaceConfirm(content, template.content)) {
      return '<!-- template: ' + name + ' -->\n\n' + template.content + '\n\n<!-- template: ' + name2 + ' -->';
    } else {
      return original;
    }
  });
}

var eventDescriptionJa = document.getElementById('event_description_ja');

var button = document.createElement('button');
button.innerText = 'イベント内容を更新';
button.addEventListener('click', function (event) {
  event.preventDefault();

  store.load(function (templates) {
    var newDescription;
    try {
      newDescription = updateDescription(templates, eventDescriptionJa.value);
    } catch(e) {
      window.alert(e.message);
      return;
    }

    if (newDescription === eventDescriptionJa.value) {
      window.alert('イベント内容は最新です');
      return;
    }

    eventDescriptionJa.value = newDescription;
    window.alert('イベント内容を更新しました。');
  });
});

eventDescriptionJa.parentNode.insertBefore(button, eventDescriptionJa.nextSibling);

function insertTextAtCursor(text) {
  var el = document.activeElement;
  var e = document.createEvent('TextEvent');
  e.initTextEvent('textInput', true, true, null, text);
  el.focus();
  el.dispatchEvent(e);
}

// cf. https://github.com/srsudar/biotool/blob/master/app/scripts/contentscript.js
chrome.runtime.onMessage.addListener(function(request) {
  switch (request.command) {
    case 'paste':
      insertTextAtCursor(request.template);
      break;
    default:
      console.log('unknown command: ' + request.command);
      break;
  }
});
