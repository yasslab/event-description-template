/* global Vue */

'use strict';

var KEY = 'event description template';

var store = {
  load: function () {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  },
  save: function (templates) {
    chrome.runtime.sendMessage({command: 'store.save', templates: templates}, function () {});
  }
};

var app = new Vue({
  el: '#event-description-templates',
  data: {
    templates: store.load(),
    newTemplateName: '',
    newTemplateContent: ''
  },
  ready: function () {
    this.$watch('templates', function (templates) {
      store.save(templates);
    }, true);
  },
  filters: {
    templateComment: function (content) {
      return '\n\n<!-- template: ' + this.name + ' -->\n\n' + content + '\n\n<!-- template: ' + this.name + ' -->\n\n';
    }
  },
  methods: {
    copy: function (template, event) {
      event.preventDefault();

      var copy = template.$el.querySelector('.template-comment');
      copy.focus();
      copy.select();
      document.execCommand('copy');
    },
    addTemplate: function (event) {
      event.preventDefault();

      if (!this.newTemplateName || !this.newTemplateContent) {
        window.alert('空欄があります');
        return;
      }

      this.templates.push({name: this.newTemplateName, content: this.newTemplateContent});
      this.newTemplateName = '';
      this.newTemplateContent = '';
    },
    removeTemplate: function (template, event) {
      event.preventDefault();

      if (window.confirm('削除してもいいですか?')) {
        this.templates.$remove(template.$data);
      }
    }
  }
});
