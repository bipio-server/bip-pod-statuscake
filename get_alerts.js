/**
 *
 * @author Michael Pearson <github@m.bip.io>
 * Copyright (c) 2010-2014 Michael Pearson https://github.com/mjpearson
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

function GetAlerts(podConfig) {
  this.name = 'get_alerts';
  this.description = 'On New Alert',
  this.description_long = 'Triggers when a new Alert appears for a given test',
  this.trigger = true;
  this.singleton = false;
  this.podConfig = podConfig;
}

GetAlerts.prototype = {};

GetAlerts.prototype.getSchema = function() {
  return {
    "config": {
      "properties" : {
        "TestID" : {
          "type" :  "integer",
          "description" : "Test ID",
          oneOf : [
          {
            '$ref' : '/renderers/get_tests/{TestID}'
          }
          ],
          label : {
            '$ref' : '/renderers/get_tests/{WebsiteName}'
          }
        }
      }
    },
    "exports": {
      "properties" : {
        "Triggered" : {
          "type" : "string",
          "description" : "Trigger Time"
        },
        "StatusCode" : {
          "type" : "integer",
          "description" : "Status Code"
        },
        "Unix" : {
          "type" : "integer",
          "description" : "Unix Timestamp"
        },
        "Status" : {
          "type" : "string",
          "description" : "Status String"
        },
        "TestID" : {
          "type" : "integer",
          "description" : "Test ID"
        }
      }
    }
  }
}

GetAlerts.prototype.setup = function(channel, accountInfo, next) {
  this.pod.trackingStart(channel, accountInfo, true, next);
}

GetAlerts.prototype.teardown = function(channel, accountInfo, next) {
  this.pod.trackingRemove(channel, accountInfo, next);
}

GetAlerts.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var pod = this.pod,
    log = this.$resource.log;

  pod.trackingGet(channel, function(err, since) {
    if (!err) {
      pod.trackingUpdate(channel, function(err, until) {
        if (err) {
          log(err, channel, 'error');
          next('Internal Error');

        } else {
          var params = {
            Since : Math.floor(since / 1000),
            TestID : channel.config.TestID
          };
          pod.scRequestParsed('Alerts', params, sysImports, function(err, resp) {
            if (err) {
              next(err);
            } else if (resp.length) {             
              for (var i = 0; i < resp.length; i++) {
                next(false, resp[i]);
              }
            }            
          });
        }
      });
    } else {
      next('Internal Error');
    }
  });
}

// -----------------------------------------------------------------------------
module.exports = GetAlerts;