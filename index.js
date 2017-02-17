/**
 *
 * Copyright (c) 2017 InterDigital, Inc. All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var Pod = require('bip-pod'),
https = require('https'),
qs = require('querystring'),
StatusCake = new Pod();

StatusCake.getParameters = function(path, params) {
  return '/API/'
  + path
  + '?'
  + qs.stringify(params);
}

StatusCake.scRequest = function(path, params, sysImports, next, method) {
  var opts = {
    host: 'www.statuscake.com',
    port: 443,
    path: this.getParameters(path, params),
    method: method || 'GET',
    headers : {
      'API' : sysImports.auth.issuer_token.password,
      'Username' : sysImports.auth.issuer_token.username
    }
  }, paramStr;

  https.request(opts, next).end();
}

StatusCake.scRequestParsed = function(path, params, sysImports, next, method) {
  this.scRequest(path, params, sysImports, function(res) {
    res.setEncoding('utf8');
    var data = "";
    res.on('data', function(d) {
      data += d;
    });
    res.on("end", function() {

      if(res.statusCode !== 200) {
        next(data);
      } else {
        try {
          next(false, JSON.parse(data));
        } catch (e) {
          next(e.message);
        }
      }
    });
  }, method);
}

StatusCake.rpc = function(action, method, sysImports, options, channel, req, res) {
  var pod = this.pod;

  if (method == 'get_tests') {
    this.scRequest('Tests', {}, sysImports, function(pRes) {
      pRes.pipe(res);
    });
  } else {
    this.__proto__.rpc.apply(this, arguments);
  }
}

// -----------------------------------------------------------------------------
module.exports = StatusCake;
