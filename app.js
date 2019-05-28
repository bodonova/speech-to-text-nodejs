/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const express = require('express');

const app = express();
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1');
const AuthorizationV1 = require('watson-developer-cloud/authorization/v1');
const IamTokenManagerV1 = require('watson-developer-cloud/iam-token-manager/v1');

// Bootstrap application settings
require('./config/express')(app);

// Create the token manager for STT
let sttTokenManager;
let sttInstanceType;
const sttServiceUrl = process.env.STT_URL || 'https://stream.watsonplatform.net/speech-to-text/api';

if (process.env.STT_IAM_APIKEY && process.env.STT_IAM_APIKEY !== '') {
  sttInstanceType = 'iam';
  sttTokenManager = new IamTokenManagerV1({
    iamApikey: process.env.STT_IAM_APIKEY || '<iam_apikey>',
    iamUrl: process.env.STT_IAM_URL || 'https://iam.bluemix.net/identity/token',
  });
  // console.log('sttInstanceType: '+sttInstanceType+' iamApikey: '+process.env.STT_IAM_APIKEY)
} else {
  sttInstanceType = 'cf';
  const sttService = new SpeechToTextV1({
    username: process.env.STT_USERNAME || '<username>',
    password: process.env.STT_PASSWORD || '<password>',
    url: sttServiceUrl,
  });
  // console.log('sttInstanceType: '+sttInstanceType+' sttServiceUrl: '+sttServiceUrl+' username: '+process.env.STT_USERNAME+' password: '+process.env.STT_PASSWORD)
  sttTokenManager = new AuthorizationV1(sttService.getCredentials());
}

// Get STT token for the client
app.get('/api/v1/stt_credentials', (req, res, next) => {
  sttTokenManager.getToken((err, token) => {
    if (err) {
      next(err);
    } else {
      let credentials;
      // console.log('STT Token: '+token)
      if (sttInstanceType === 'iam') {
        credentials = {
          accessToken: token,
          sttServiceUrl,
        };
      } else {
        credentials = {
          token,
          sttServiceUrl,
        };
      }
      res.json(credentials);
    }
  });
});

// Create the token manager for NLU
let nluTokenManager;
let nluInstanceType;
const nluServiceUrl = process.env.NLU_URL || 'https://gateway.watsonplatform.net/natural-language-understanding/api';

if (process.env.NLU_IAM_APIKEY && process.env.NLU_IAM_APIKEY !== '') {
  nluInstanceType = 'iam';
  nluTokenManager = new IamTokenManagerV1({
    iamApikey: process.env.NLU_IAM_APIKEY || '<iam_apikey>',
    iamUrl: process.env.NLU_IAM_URL || 'https://iam.bluemix.net/identity/token',
  });
  // console.log('nluInstanceType: '+nluInstanceType+' iamApikey: '+process.env.NLU_IAM_APIKEY)
} else {
  nluInstanceType = 'cf';
  const nluService = new NaturalLanguageUnderstandingV1({
    version: '2018-11-16',
    username: process.env.NLU_USERNAME || '<username>',
    password: process.env.NLU_PASSWORD || '<password>',
    url: nluServiceUrl,
  });
  // console.log('nluInstanceType: '+nluInstanceType+' nluServiceUrl: '+nluServiceUrl+' username: '+process.env.NLU_USERNAME+' password: '+process.env.NLU_PASSWORD)
  nluTokenManager = new AuthorizationV1(nluService.getCredentials());
}

// Get NLU token for the client
app.get('/api/v1/nlu_credentials', (req, res, next) => {
  nluTokenManager.getToken((err, token) => {
    if (err) {
      next(err);
    } else {
      let credentials;
      // console.log('NLU Token: '+token)
      if (nluInstanceType === 'iam') {
        credentials = {
          accessToken: token,
          nluServiceUrl,
        };
      } else {
        credentials = {
          token,
          nluServiceUrl,
        };
      }
      res.json(credentials);
    }
  });
});

app.get('/', (req, res) => res.render('index'));

module.exports = app;
