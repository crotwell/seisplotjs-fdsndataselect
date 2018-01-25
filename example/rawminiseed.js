
// this comes from the seisplotjs miniseed bundle
var ds = seisplotjs_fdsndataselect;
var miniseed = ds.miniseed;

var dsQuery = new ds.DataSelectQuery()
  .host('service.scedc.caltech.edu')
  .nodata(404)
  .networkCode('CI')
  .stationCode('BBS')
  .locationCode('--')
  .channelCode('BHZ')
  .startTime('2017-03-01T20:17:04Z')
  .endTime('2017-03-01T20:23:04Z');

var div = d3.select('div.miniseed');
var divP = div.append('p');
divP.text("URL: ");
var url = dsQuery.formURL();
divP.append("a")
    .attr("href", url)
    .text(url);

dsQuery.query().then(function(records) {
var table = d3.select("div.miniseed")
        .select("table");
      if ( table.empty()) {
        table = d3.select("div.miniseed")
          .append("table");
        var th = table.append("thead").append("tr");
        th.append("th").text("Seq");
        th.append("th").text("Net");
        th.append("th").text("Sta");
        th.append("th").text("Loc");
        th.append("th").text("Chan");
        th.append("th").text("Start");
        th.append("th").text("End");
        th.append("th").text("NumSamp");
        th.append("th").text("Sps");
        table.append("tbody");
      }
      var tableData = table.select("tbody")
        .selectAll("tr")
        .data(records, function(d) { return d.codes()+d.header.start;});
      tableData.exit().remove();
      var tr = tableData.enter().append('tr');
      tr.append("td")
        .text(function(d) {
          return d.header.seq;
        });
      tr.append("td")
        .text(function(d) {
          return d.header.netCode;
        });
      tr.append("td")
        .text(function(d) {
          return d.header.staCode;
        });
      tr.append("td")
        .text(function(d) {
          return d.header.locCode;
        });
      tr.append("td")
        .text(function(d) {
          return d.header.chanCode;
        });
      tr.append("td")
        .text(function(d) {
          return d.header.start.toISOString();
        });
      tr.append("td")
        .text(function(d) {
          return d.header.end.toISOString();
        });
      tr.append("td")
        .text(function(d) {
          return d.header.numSamples;
        });
      tr.append("td")
        .text(function(d) {
          return d.header.sampleRate;
        });
}).catch( function(error) {
  d3.select("div.miniseed").append('p').html("Error loading data." +error);
  console.assert(false, error);
});
