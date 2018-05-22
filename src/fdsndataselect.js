
import RSVP from 'rsvp';

RSVP.on('error', function(reason) {
  console.assert(false, reason);
});

import * as miniseed from 'seisplotjs-miniseed';
const model = miniseed.model;

export { RSVP, model, miniseed };
const moment = model.moment;

export const FORMAT_MINISEED = 'mseed';

export const IRIS_HOST = "service.iris.edu";

export class DataSelectQuery {
  constructor(host) {
    this._specVersion = 1;
    this._protocol = 'http';
    if (document && document.location && "https:" == document.location.protocol) {
      this._protocol = 'https:'
    }
    this._host = host;
    if (! host) {
      this._host = IRIS_HOST;
    }
    this._port = 80;
  }
  specVersion(value) {
    return arguments.length ? (this._specVersion = value, this) : this._specVersion;
  }
  protocol(value) {
    return arguments.length ? (this._protocol = value, this) : this._protocol;
  }
  host(value) {
    return arguments.length ? (this._host = value, this) : this._host;
  }
  port(value) {
    return arguments.length ? (this._port = value, this) : this._port;
  }
  nodata(value) {
    return arguments.length ? (this._nodata = value, this) : this._nodata;
  }
  networkCode(value) {
    return arguments.length ? (this._networkCode = value, this) : this._networkCode;
  }
  stationCode(value) {
    return arguments.length ? (this._stationCode = value, this) : this._stationCode;
  }
  locationCode(value) {
    return arguments.length ? (this._locationCode = value, this) : this._locationCode;
  }
  channelCode(value) {
    return arguments.length ? (this._channelCode = value, this) : this._channelCode;
  }
  startTime(value) {
    return arguments.length ? (this._startTime = model.checkStringOrDate(value), this) : this._startTime;
  }
  endTime(value) {
    return arguments.length ? (this._endTime = model.checkStringOrDate(value), this) : this._endTime;
  }
  quality(value) {
    return arguments.length ? (this._quality = value, this) : this._quality;
  }
  minimumLength(value) {
    return arguments.length ? (this._minimumLength = value, this) : this._minimumLength;
  }
  longestOnly(value) {
    return arguments.length ? (this._longestOnly = value, this) : this._longestOnly;
  }
  repository(value) {
    return arguments.length ? (this._repository = value, this) : this._repository;
  }
  format(value) {
    return arguments.length ? (this._format = value, this) : this._format;
  }
  computeStartEnd(start, end, duration, clockOffset) {
    let se = calcStartEndDates(start, end, duration, clockOffset);
    this.startTime(se.start);
    return this.endTime(se.end);
  }

  query() {
    return this.queryRaw().then(function(rawBuffer) {
        let dataRecords = miniseed.parseDataRecords(rawBuffer);
        return dataRecords;
    });
  }

  queryRaw() {
    let mythis = this;
    let promise = new RSVP.Promise(function(resolve, reject) {
      let client = new XMLHttpRequest();
      let url = mythis.formURL();
console.log("fdsnDataSelect URL: "+url);
      client.open("GET", url);
      client.ontimeout = function(e) {
        this.statusText = "Timeout "+this.statusText;
        reject(this);
      };
      client.onreadystatechange = handler;
      client.responseType = "arraybuffer";
      client.setRequestHeader("Accept", "application/vnd.fdsn.mseed");
      client.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else if (this.status === 204 || (mythis.nodata() && this.status === mythis.nodata())) {
            // no data, so resolve success but with empty array
            resolve( new ArrayBuffer(0) );
          } else {
            reject(this);
          }
        }
      }
    });
    return promise;
  }

  formBaseURL() {
      let colon = ":";
      if (this.protocol().endsWith(colon)) {
        colon = "";
      }
      return this.protocol()+colon+"//"+this.host()+(this._port==80?"":(":"+this._port))+"/fdsnws/dataselect/"+this.specVersion();
  }

  formVersionURL() {
    return this.formBaseURL()+"/version";
  }

  queryVersion() {
    let mythis = this;
    let promise = new RSVP.Promise(function(resolve, reject) {
      let url = mythis.formVersionURL();
      let client = new XMLHttpRequest();
      client.open("GET", url);
      client.onreadystatechange = handler;
      client.responseType = "text";
      client.setRequestHeader("Accept", "text/plain");
      client.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(this);
          }
        }
      }
    });
    return promise;
  }

  makeParam(name, val) {
    return name+"="+encodeURIComponent(val)+"&";
  }

  formURL() {
    let url = this.formBaseURL()+"/query?";
    if (this._networkCode) { url = url+this.makeParam("net", this.networkCode());}
    if (this._stationCode) { url = url+this.makeParam("sta", this.stationCode());}
    if (this._locationCode) { url = url+this.makeParam("loc", this.locationCode());}
    if (this._channelCode) { url = url+this.makeParam("cha", this.channelCode());}
    if (this._startTime) { url = url+this.makeParam("starttime", this.toIsoWoZ(this.startTime()));}
    if (this._endTime) { url = url+this.makeParam("endtime", this.toIsoWoZ(this.endTime()));}
    if (this._quality) { url = url+this.makeParam("quality", this.quality());}
    if (this._minimumLength) { url = url+this.makeParam("minimumlength", this.minimumLength());}
    if (this._repository) { url = url+this.makeParam("repository", this.repository());}
    if (this._longestOnly) { url = url+this.makeParam("longestonly", this.longestOnly());}
    if (this._format) { url = url+this.makeParam("format", this.format());}
    if (this._nodata) { url = url+this.makeParam("nodata", this.nodata());}

    if (url.endsWith('&') || url.endsWith('?')) {
      url = url.substr(0, url.length-1); // zap last & or ?
    }
    return url;
  }

  // these are similar methods as in seisplotjs-fdsnevent
  // duplicate here to avoid dependency and diff NS, yes that is dumb...


  /** converts to ISO8601 but removes the trailing Z as FDSN web services
    do not allow that. */
  toIsoWoZ(date) {
    let out = date.toISOString();
    return out.substring(0, out.length-1);
  }

}


export function calcClockOffset(serverTime) {
  return moment.utc().getTime() - serverTime.getTime();
}

/**
Any two of start, end and duration can be specified, or just duration which
then assumes end is now.
start and end are Date objects, duration is in seconds.
clockOffset is the milliseconds that should be subtracted from the local time
 to get real world time, ie local - UTC
 or new Date().getTime() - serverDate.getTime()
 default is zero.
*/
export function calcStartEndDates(start, end, duration, clockOffset) {
  let startDate;
  let endDate;
  if (duration &&
    (typeof duration == "string" || duration instanceof String)) {
      duration = Number.parseFloat(duration);
  }
  if (duration &&
    (typeof duration == "number" || duration instanceof Number)) {
    duration = moment.duration(duration, 'seconds');
  }
  if (start && end) {
    startDate = model.checkStringOrDate(start);
    endDate = model.checkStringOrDate(end);
    duration = endDate.from(startDate);
  } else if (start && duration) {
    startDate = model.checkStringOrDate(start);
    endDate = moment.utc(startDate).add(duration);
  } else if (end && duration) {
    endDate = model.checkStringOrDate(end);
    startDate = moment.utc(endDate).subtract(duration);
  } else if (duration) {
    if (clockOffset === undefined) {
      clockOffset = moment.duration(0, 'seconds');
    } else if (clockOffset instanceof Number) {
      clockOffset = moment.duration(clockOffset, 'seconds');
    }
    endDate = moment.utc().subtract(clockOffset);
    startDate = moment.utc(endDate).subtract(duration);
  } else {
    throw "need some combination of start, end and duration";
  }
  return { "start": startDate, "end": endDate, "duration": duration, "clockOffset": clockOffset };
}

export function createDataSelectQuery(params) {
  if ( ! params || typeof params != 'object' ) {
    throw new Error("params null or not an object");
  }
  let out = new DataSelectQuery();
  if (params.net) { out.networkCode(params.net); }
  if (params.network) { out.networkCode(params.network); }
  if (params.networkCode) { out.networkCode(params.networkCode); }
  if (params.sta) { out.stationCode(params.sta); }
  if (params.station) { out.stationCode(params.station); }
  if (params.stationCode) { out.stationCode(params.stationCode); }
  if (params.loc) { out.locationCode(params.loc); }
  if (params.location) { out.locationCode(params.location); }
  if (params.locationCode) { out.locationCode(params.locationCode); }
  if (params.chan) { out.channelCode(params.chan); }
  if (params.channel) { out.channelCode(params.channel); }
  if (params.channelCode) { out.channelCode(params.channelCode); }
  if (params.start) { out.startTime(params.start); }
  if (params.starttime) { out.startTime(params.starttime); }
  if (params.end) { out.endTime(params.end); }
  if (params.endtime) { out.endTime(params.endtime); }
  if (params.quality) { out.quality(params.quality); }
  if (params.minimumlength) { out.minimumLength(params.minimumlength); }
  if (params.repository) { out.repository(params.repository); }
  if (params.longestonly) { out.longestOnly(params.longestonly); }
  if (params.format) { out.format(params.format); }
  if (params.nodata) { out.nodata(params.nodata); }
  if (params.host) { out.host(params.host); }
  if (params.port) { out.port(params.port); }
  if (params.specVersion) { out.specVersion(params.specVersion); }
  return out;
}
