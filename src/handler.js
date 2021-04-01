'use strict';
const AWS = require('aws-sdk');
const sqsClient = new AWS.SQS();
const moment = require('moment');

const getQueueUrl = async (queueName) => {
  const getMailerQueueUrl = await sqsClient.getQueueUrl({ QueueName: queueName }).promise();
  return getMailerQueueUrl.QueueUrl;
}

const momentToUnix = (momentObject) => {
  return Math.floor(parseInt(momentObject.format('x')) * 1000)
}

module.exports.enqueueTask = async (event) => {
  console.log("ENQUEUEING TASK", event.body);

  let taskEnqueued = await new Promise(async (resolve, reject) => {
    try {
      const sendMessageParams = {
        MessageBody: event.body,
        QueueUrl: await getQueueUrl(process.env.SCHEDULER_QUEUE_NAME)
      };

      const sendMessageResponse = await sqsClient.sendMessage(sendMessageParams).promise();
      console.log("ENQUEUE SEND MESSAGE RESPONSE", sendMessageResponse);

      resolve(true);
    } catch (enqueueingErr) {
      console.log("ENQUEUE ERROR", enqueueingErr);
      reject(false);
    }
  });

  if (taskEnqueued == true) {
    console.log("TASK ENQUEUED");
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Task was enqueued successfully!'
      })
    };
  } else if (taskEnqueued == false) {
    console.log("FAILED TO ENQUEUE TASK");
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Could not queue task :('
      })
    };
  } else {
    console.log("FATALLY FAILED TO ENQUEUE TASK");
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'I did not catch the error!'
      })
    };
  }
};

module.exports.checkTaskSchedule = async (event) => {
  console.log("CHECK TASK SCHEDULE", event);

  for (let i = 0; i < event.Records.length; i++) {
    const record = event.Records[i];
    const taskData = JSON.parse(record.body);
    const runAt = taskData.run_at <= 0 ? momentToUnix(moment()) : taskData.run_at;
    const timeLeft = (runAt - momentToUnix(moment()))
    console.log("TIME LEFT", timeLeft);

    if (timeLeft <= 0) {
      console.log("DISPATCHING TASK", event);
      let taskDispatched = await new Promise(async (resolve, reject) => {
        try {
          const sendMessageParams = {
            MessageBody: record.body,
            QueueUrl: await getQueueUrl(process.env.TASK_QUEUE_NAME)
          };

          const sendMessageResponse = await sqsClient.sendMessage(sendMessageParams).promise();
          console.log("DISPATCH SEND MESSAGE RESPONSE", sendMessageResponse);

          resolve(true);
        } catch (dispatchingErr) {
          console.log("DISPATCH TASK ERROR", dispatchingErr);
          reject(false);
        }
      });

      if (taskDispatched == true) {
        console.log("TASK DISPATCHED");
      } else if (taskDispatched == false) {
        console.log("TASK DISPATCH FAILED");
      } else {
        console.log("UNCAUGHT DISPATCH ERROR");
      }
    } else if (timeLeft > 0) {
      console.log("RESCHEDULING TASK", event);
      const processingDelay = timeLeft > 900 ? 900 : timeLeft;
      let taskRescheduled = await new Promise(async (resolve, reject) => {
        try {
          const sendMessageParams = {
            MessageBody: record.body,
            QueueUrl: await getQueueUrl(process.env.SCHEDULER_QUEUE_NAME),
            DelaySeconds: processingDelay
          };

          const sendMessageResponse = await sqsClient.sendMessage(sendMessageParams).promise();
          console.log("RESCHEDULE SEND MESSAGE RESPONSE", sendMessageResponse);

          resolve(true);
        } catch (reschedulingErr) {
          console.log("RESCHEDULE ERROR", reschedulingErr);
          reject(false);
        }
      });

      if (taskRescheduled == true) {
        console.log("TASK RESCHEDULED");
      } else if (taskRescheduled == false) {
        console.log("TASK RESCHEDULE FAILED");
      } else {
        console.log("UNCAUGHT RESCHEDULE ERROR");
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };
};

module.exports.runTask = async (event) => {
  console.log("RUNNING TASK", event);
};
