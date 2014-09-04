var _ = require('lodash');

var mixins = {
  normalize: function (a, b, d, offset) {
    // value / highest = newValue / limit
    return Math.ceil((d * a) / b) + (offset || 0);
  }
};

_.mixin(mixins);
