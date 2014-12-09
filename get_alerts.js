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
    self;

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
      TestID : channel.config.TestID
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