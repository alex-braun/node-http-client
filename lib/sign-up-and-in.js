'use strict';

const http = require('http');
const url = require('url');

const formData = JSON.stringify({
  credentials: {
    email: process.argv[2],
    password: process.argv[3],
  },
});

const onError = (error) => {
  if (typeof error === 'object' &&
      error.response) {
    console.error(error.response.statusCode, error.response.statusMessage);
    console.error(error.data);
  } else {
    console.error(error.stack);
  }
};

const onSignIn = (response) => {
  console.log(response);
  console.log('Signed in');
};

const onSignUp = (response) => {
  console.log(response);
  console.log('Signed up');
};

const baseOptions = {
  hostname: 'localhost',
  port: 3000,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': formData.length,
  },
};

const signUpOrIn = (credentials, path, onFulilled, onError) => {
  const options = Object.assign({ path }, baseOptions);
  const request = http.request(options, (response) => {
    let data = '';
    response.setEncoding('utf8');
    response.on('error', onError);
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', _ => {
      if (response.statusCode >= 200 &&
          response.statusCode < 300) {
        onFulilled(data);
      } else {
        onError({ response, data });
      }
    });
  });
  request.on('error', onError);
  request.write(credentials);
  request.end();
};

const signIn = (credentials, onFulilled, onRejected) =>
  signUpOrIn(credentials, '/sign-in', onFulilled, onRejected);

const signUp = (credentials, onFulilled, onRejected) =>
  signUpOrIn(credentials, '/sign-up', onFulilled, onRejected);

const onSignUpSuccess = function (response) {
  onSignUp(response);
  signIn(formData, onSignIn, onError);
};

signUp(formData, onSignUpSuccess, onError);
