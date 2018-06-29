"use strict";

module.exports = function (err) {
  console.log(err.stack || err);
};