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

function GetAlerts() {}

GetAlerts.prototype = {};

GetAlerts.prototype.setup = function(channel, accountInfo, next) {
  this.pod.trackingStart(channel, accountInfo, true, next);
}

GetAlerts.prototype.teardown = function(channel, accountInfo, next) {
  this.pod.trackingRemove(channel, accountInfo, next);
}

GetAlerts.prototype.trigger = function(imports, channel, sysImports, contentParts, next) {
  var pod = this.pod,
    self = this;

  pod.trackingGet(channel, function(err, since) {
    if (err) {
      next(err);
    } else {
      pod.trackingUpdate(channel, function(err, until) {
        if (!imports.since) {
          imports.Since = Math.floor(since / 1000);
        }
        self.invoke(imports, channel, sysImports, contentParts, next);
      });
    }
  });
}

GetAlerts.prototype.invoke = function(imports, channel, sysImports, contentParts, next) {
  var pod = this.pod,
    params = {
      TestID : imports.TestID
    };

  if (imports.since) {
    params.Since = imports.since;
  }

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

// -----------------------------------------------------------------------------
module.exports = GetAlerts;