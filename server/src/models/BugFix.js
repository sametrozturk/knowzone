const { Schema, model } = require('mongoose');
const basePostObject = require('./BasePost');
const { maxLengthMessage, transformToJSON } = require('../utils');

const MAX_LEN_ERROR = 4000;
const MAX_LEN_SOLUTION = 4000;

const bugFixObject = {
  ...basePostObject,
  ...{
    error: {
      type: String,
      required: true,
      maxLength: [MAX_LEN_ERROR, maxLengthMessage(MAX_LEN_ERROR)],
    },
    solution: {
      type: String,
      required: true,
      maxLength: [MAX_LEN_SOLUTION, maxLengthMessage(MAX_LEN_SOLUTION)],
    },
  },
};

const bugFixSchema = new Schema(
  bugFixObject,
  { timestamps: true },
);

transformToJSON(bugFixSchema);

const BugFix = model('BugFix', bugFixSchema);

module.exports = BugFix;
