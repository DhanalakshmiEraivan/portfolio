/* QuadraFroyn secure form delivery: all submissions go to the site API. */
(function () {
  'use strict';
  window.QuadraForms = {
    submit: async function (type, fields) {
      var response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ type: type, fields: fields })
      });
      var result = await response.json().catch(function () { return {}; });
      if (!response.ok || !result.ok) throw new Error(result.message || 'Unable to send your message. Please try again.');
      return result;
    },
    values: function (form) {
      var data = new FormData(form), fields = {};
      data.forEach(function (value, key) {
        if (typeof value === 'string') fields[key] = value.trim();
      });
      return fields;
    }
  };
})();
