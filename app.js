const express = require('express');
const AWS = require('aws-sdk');
const fileUpload = require('express-fileupload');

const app = express();

// Connect to S3
const s3 = new AWS.S3({
  endpoint: ``, // e.g. https://eu2.contabostorage.com/bucketname
  accessKeyId: '', // storage bucket key
  secretAccessKey: '',
  s3BucketEndpoint: true
});

// Middleware to handle incoming files
app.use(
  fileUpload({
    createParentPath: true
  })
);

// Show the form
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/form.html');
});

// Handle files
app.post('/upload', function (request, response) {
  const file = request?.files?.['fileToUpload'] || null;

  // Return if the request doesn't contain the file
  if (!file) return response.sendStatus(400);

  // Destructure the content of the file object
  const { name, mimetype, size, data } = file;
  const fileContent = Buffer.from(data, ' ');

  /* Add security checks (e.g. max size) here */

  s3.putObject(
    {
      Body: fileContent,
      Bucket: 'soft',
      Key: `${name}`
    },
    function (err, data) {
      console.log(err, data);
      if (err) {
        response.sendStatus(500);
      } else {
        response.sendStatus(200);
      }
    }
  );
});

// Show all files
app.get('/list', function (request, response) {
  // Get all objects inside the bucket
  s3.listObjects(
    {
      Bucket: 'soft'
    },
    function (err, data) {
      if (err) {
        response.sendStatus(500);
      } else {
        // Return the list ("Contents") as JSON
        response.json(data.Contents);
      }
    }
  );
});

app.listen(4000, function () {
  console.log('🚀 App is running on http://localhost:4000');
});
