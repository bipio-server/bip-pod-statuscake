/**
 *
 * @author Michael Pearson <michael@cloudspark.com.au>
 * Copyright (c) 2010-2014 CloudSpark pty ltd http://www.cloudspark.com.au
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var Pod = require('bip-pod'),
https = require('https'),
qs = require('querystring'),
StatusCake = new Pod({
  name : 'statuscake',
  description : 'StatusCake',
  description_long : '<a href="https://www.statuscake.com?aff=15112">StatusCake</a> : Website Uptime Monitoring and Alerts - Free Unlimited Downtime Monitorin',
  authType : 'issuer_token',
  authMap : {
    username : 'Username',
    password : 'API Key'
  },
  'renderers' : {
    'get_tests' : {
      description : 'Get Tests',
      contentType : DEFS.CONTENTTYPE_JSON
    }
  }
});

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
console.log(data);          
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

// Include any actions
StatusCake.add(require('./get_alerts.js'));

// -----------------------------------------------------------------------------
module.exports = StatusCake;