
import RSVP from 'rsvp';

RSVP.on('error', function(reason) {
  console.assert(false, reason);
});

import * as model from 'seisplotjs-model';
import * as miniseed from 'seisplotjs-miniseed';

export { RSVP, model, miniseed };

export const FORMAT_MINISEED = 'mseed';

export const IRIS_HOST = "service.iris.edu";

export class DataSelectQuery {
  constructor(host) {
    this._protocol = 'http';
    this._host = host;
    if (! host) {
      this._host = IRIS_HOST;
    }
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
          } else if (this.status === 204) { 
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

  formVersionURL() {
      let colon = ":";
      if (this.protocol().endsWith(colon)) {
        colon = "";
      }
      return this.protocol()+colon+"//"+this.host()+"/fdsnws/dataselect/1/version";
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
console.log("in fdsn-station formURL()");
    let colon = ":";
    if (this.protocol().endsWith(colon)) {
      colon = "";
    }
    let url = this.protocol()+colon+"//"+this.host()+"/fdsnws/dataselect/1/query?";
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

