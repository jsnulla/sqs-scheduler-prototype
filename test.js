'use strict';
const axios = require('axios');
const moment = require('moment');

// run in 1 day
axios.post('https://g06ggjlgs5.execute-api.ap-southeast-1.amazonaws.com/enqueueTask', {
  "queue": "rc_long_tasks",
  "taskName": "delete_account_async",
  "data": {
    "client_id": 22985
  },
  "queued_at": moment().format(),
  "run_at_formatted": moment().add(1, 'days').format(),
  "run_at": Math.floor(parseInt(moment().add(1, 'days').format('x')) / 1000)
  })
  .then(function (response) {
    console.log(response);
  })

// run in 1 minute
axios.post('https://g06ggjlgs5.execute-api.ap-southeast-1.amazonaws.com/enqueueTask', {
  "queue": "rc_long_tasks",
  "taskName": "delete_account_async",
  "data": {
    "client_id": 22985
  },
  "queued_at": moment().format(),
  "run_at_formatted": moment().add(1, 'minute').format(),
  "run_at": Math.floor(parseInt(moment().add(1, 'minute').format('x')) / 1000)
  })
  .then(function (response) {
    console.log(response);
  })

// run now
axios.post('https://g06ggjlgs5.execute-api.ap-southeast-1.amazonaws.com/enqueueTask', {
  "queue": "rc_long_tasks",
  "taskName": "delete_account_async",
  "data": {
    "client_id": 22985
  },
  "queued_at": moment().format(),
  "run_at_formatted": moment().format(),
  "run_at": Math.floor(parseInt(moment().format('x')) / 1000)
  })
  .then(function (response) {
    console.log(response);
  })
