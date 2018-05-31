// @flow

import RSVP from 'rsvp';

RSVP.on('error', function(reason: string) {
  console.assert(false, reason);
});

// special due to flow
import {hasArgs, hasNoArgs, isStringArg, isNumArg, checkStringOrDate, stringify} from 'seisplotjs-model';

import * as miniseed from 'seisplotjs-miniseed';
const model = miniseed.model;

export { RSVP, model, miniseed };
const moment = model.moment;

export const FORMAT_MINISEED = 'mseed';

export const IRIS_HOST = "service.iris.edu";

export class DataSelectQuery {
  /** @private */
  _specVersion: number;
  /** @private */
  _protocol: string;
  /** @private */
  _host: string;
  /** @private */
  _nodata: number;
  /** @private */
  _port: number;
  /** @private */
  _networkCode: string;
  /** @private */
  _stationCode: string;
  /** @private */
  _locationCode: string;
  /** @private */
  _channelCode: string;
  /** @private */
  _startTime: moment;
  /** @private */
  _endTime: moment;
  /** @private */
  _quality: string;
  /** @private */
  _minimumLength: number;
  /** @private */
  _longestOnly: boolean;
  /** @private */
  _repository: string;
  /** @private */
  _format: string;
  constructor(host?: string) {
    this._specVersion = 1;
    this._protocol = 'http';
    if (document && document.location && "https:" == document.location.protocol) {
      this._protocol = 'https:'
    }
    if (host) {
      this._host = host;
    } else {
      this._host = IRIS_HOST;
    }
    this._port = 80;
  }
  specVersion(value?: number): number | DataSelectQuery {
    if (hasArgs(value)) {
      this._specVersion = value;
      return this;
    } else if (hasNoArgs(value)) {
      return this._specVersion;
    } else {
      throw new Error('value argument is optional or number, but was '+typeof value);
    }
  }
  protocol(value?: string) :string | DataSelectQuery {
    if (isStringArg(value)) {
      this._protocol = value;
      return this;
    } else if (hasNoArgs(value)) {
      return this._protocol;
    } else {
      throw new Error('value argument is optional or string, but was '+typeof value);
    }
  }
  host(value?: string) :string | DataSelectQuery {
    if (isStringArg(value)) {
      this._host = value;
      return this;
    } else if (hasNoArgs(value)) {
      return this._host;
    } else {
      throw new Error('value argument is optional or string, but was '+typeof value);
    }
  }
  nodata(value?: number): number | DataSelectQuery {
    if (hasNoArgs(value)) {
      return this._nodata;
    } else if (hasArgs(value)) {
      this._nodata = value;
      return this;
    } else {
      throw new Error('value argument is optional or number, but was '+typeof value);
    }
  }
  port(value?: number): number | DataSelectQuery {
    if (hasNoArgs(value)) {
      return this._port;
    } else if (hasArgs(value)) {
      this._port = value;
      return this;
    } else {
      throw new Error('value argument is optional or number, but was '+typeof value);
    }
  }
  networkCode(value?: string) :string | DataSelectQuery {
    if (isStringArg(value)) {
      this._networkCode = value;
      return this;
    } else if (hasNoArgs(value)) {
      return this._networkCode;
    } else {
      throw new Error('value argument is optional or string, but was '+value);
    }
  }
  stationCode(value?: string) :string | DataSelectQuery {
    if (isStringArg(value)) {
      this._stationCode = value;
      return this;
    } else if (hasNoArgs(value)) {
      return this._stationCode;
    } else {
      throw new Error('value argument is optional or string, but was '+value);
    }
  }
  locationCode(value?: string) :string | DataSelectQuery {
    if (isStringArg(value)) {
      this._locationCode = value;
      return this;
    } else if (hasNoArgs(value)) {
      return this._locationCode;
    } else {
      throw new Error('value argument is optional or string, but was '+value);
    }
  }
  channelCode(value?: string) :string | DataSelectQuery {
    if (isStringArg(value)) {
      this._channelCode = value;
      return this;
    } else if (hasNoArgs(value)) {
      return this._channelCode;
    } else {
      throw new Error('value argument is optional or string, but was '+value);
    }
  }
  startTime(value?: moment) :moment | DataSelectQuery {
    if (hasNoArgs(value)) {
      return this._startTime;
    } else if (hasArgs(value)) {
      this._startTime = checkStringOrDate(value);
      return this;
    } else {
      throw new Error('value argument is optional or moment or string, but was '+typeof value);
    }
  }
  endTime(value?: moment) :moment | DataSelectQuery {
    if (hasNoArgs(value)) {
      return this._endTime;
    } else if (hasArgs(value)) {
      this._endTime = checkStringOrDate(value);
      return this;
    } else {
      throw new Error('value argument is optional or moment or string, but was '+typeof value);
    }
  }
  quality(value?: string) :string | DataSelectQuery {
    if (isStringArg(value)) {
      this._quality = value;
      return this;
    } else if (hasNoArgs(value)) {
      return this._quality;
    } else {
      throw new Error('value argument is optional or string, but was '+value);
    }
  }
  minimumLength(value?: number): number | DataSelectQuery {
    if (hasNoArgs(value)) {
      return this._minimumLength;
    } else if (hasArgs(value)) {
      this._minimumLength = value;
      return this;
    } else {
      throw new Error('value argument is optional or number, but was '+typeof value);
    }
  }
  longestOnly(value?: boolean): boolean | DataSelectQuery {
    if (hasNoArgs(value)) {
      return this._longestOnly;
    } else if (hasArgs(value)) {
      this._longestOnly = value;
      return this;
    } else {
      throw new Error('value argument is optional or boolean, but was '+typeof value);
    }
  }
  repository(value?: string) :string | DataSelectQuery {
    if (isStringArg(value)) {
      this._repository = value;
      return this;
    } else if (hasNoArgs(value)) {
      return this._repository;
    } else {
      throw new Error('value argument is optional or string, but was '+value);
    }
  }
  format(value?: string) :string | DataSelectQuery {
    if (isStringArg(value)) {
      this._format = value;
      return this;
    } else if (hasNoArgs(value)) {
      return this._format;
    } else {
      throw new Error('value argument is optional or string, but was '+value);
    }
  }
  computeStartEnd(start ?:moment, end ?:moment, duration ?:number, clockOffset ?:number) {
    let se = new StartEndDuration(start, end, duration, clockOffset);
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
      if (this._protocol.endsWith(colon)) {
        colon = "";
      }
      return this._protocol+colon+"//"+this._host+(this._port==80?"":(":"+this._port))+"/fdsnws/dataselect/"+this._specVersion;
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

  makeParam(name :string, val :mixed) {
    return name+"="+encodeURIComponent(stringify(val))+"&";
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
  toIsoWoZ(date :moment) {
    let out = date.toISOString();
    return out.substring(0, out.length-1);
  }

}


export function calcClockOffset(serverTime :moment) {
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
export class StartEndDuration {
  start: moment;
  end: moment;
  duration: moment.duration;
  clockOffset: moment.duration;
  constructor(start ?:moment, end ?:moment, duration ?:number, clockOffset ?:number) {

    if (duration &&
      (typeof duration == "string" || duration instanceof String)) {
        this.duration = moment.duration(Number.parseFloat(duration), 'seconds');
    }
    if (duration &&
      (typeof duration == "number" || duration instanceof Number)) {
      this.duration = moment.duration(duration, 'seconds');
    }
    if (start && end) {
      this.start = model.checkStringOrDate(start);
      this.end = model.checkStringOrDate(end);
      this.duration = end.from(this.start);
    } else if (start && this.duration) {
      this.start = model.checkStringOrDate(start);
      this.end = moment.utc(this.start).add(this.duration);
    } else if (end && this.duration) {
      this.end = model.checkStringOrDate(end);
      this.start = moment.utc(this.end).subtract(this.duration);
    } else if (this.duration) {
      if (clockOffset === undefined) {
        this.clockOffset = moment.duration(0, 'seconds');
      } else if (clockOffset instanceof Number) {
        this.clockOffset = moment.duration(clockOffset, 'seconds');
      } else {
        this.clockOffset = clockOffset;
      }
      this.end = moment.utc().subtract(clockOffset);
      this.start = moment.utc(this.end).subtract(this.duration);
    } else {
      throw "need some combination of start, end and duration";
    }
  }
}

export function calcStartEndDates(start ?:moment, end ?:moment, duration ?:number, clockOffset ?:number): StartEndDuration {
  return new StartEndDuration(start, end, duration, clockOffset);
}

export function createDataSelectQuery(params: Object) :DataSelectQuery {
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
