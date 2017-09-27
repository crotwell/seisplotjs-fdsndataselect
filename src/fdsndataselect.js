
import RSVP from 'rsvp';

RSVP.on('error', function(reason) {
  console.assert(false, reason);
});

import * as miniseed from 'seisplotjs-miniseed';
let model = miniseed.model;

export { RSVP, model, miniseed };

export const FORMAT_MINISEED = 'mseed';

export const IRIS_HOST = "service.iris.edu";

export class DataSelectQuery {
  constructor(host) {
    this._specVersion = 1;
    this._protocol = 'http';
    this._host = host;
    if (! host) {
      this._host = IRIS_HOST;
    }
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
    return arguments.length ? (this._startTime = value, this) : this._startTime;
  }
  endTime(value) {
    return arguments.length ? (this._endTime = value, this) : this._endTime;
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
} else if (this.status === 204 || this.status === 404) {
console.log("Oops, nodata check not working "+this.status);
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
      return this.protocol()+colon+"//"+this.host()+"/fdsnws/dataselect/"+this.specVersion();
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
          console.log("handle version: "+mythis.host()+" "+this.status);
          if (this.status === 200) { resolve(this.response); }
          else {
            console.log("Reject version: "+mythis.host()+" "+this.status);reject(this); }
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

  toDateUTC(str) {
    if (! str.endsWith('Z')) {
      str = str + 'Z';
    }
    return new Date(Date.parse(str));
  }

  /** converts to ISO8601 but removes the trailing Z as FDSN web services 
    do not allow that. */
  toIsoWoZ(date) {
    let out = date.toISOString();
    return out.substring(0, out.length-1);
  }

}


export function calcClockOffset(serverTime) {
  return new Date().getTime() - serverTime.getTime();
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
  if (clockOffset === undefined) {
    clockOffset = 0;
  }
  if (start && end) {
    startDate = new Date(start);
    endDate = new Date(end);
  } else if (start && duration) {
    startDate = new Date(start);
    endDate = new Date(startDate.getTime()+parseFloat(duration)*1000);
  } else if (end && duration) {
    endDate = new Date(end);
    startDate = new Date(endDate.getTime()-parseFloat(duration)*1000);
  } else if (duration) {
    endDate = new Date(new Date().getTime()-clockOffset);
    startDate = new Date(endDate.getTime()-parseFloat(duration)*1000);
  } else {
    throw "need some combination of start, end and duration";
  }
  return { "start": startDate, "end": endDate };
}


