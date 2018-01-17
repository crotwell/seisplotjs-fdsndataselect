
QUnit.test("calcStartEndDates", function (assert) {
  var duration = 300;
  var clockOffset = 0;
  var timeWindow = calcStartEndDates(null, null, duration, clockOffset);
  assert.equal(timeWindow.end.valueOf(), timeWindow.start.valueOf()+duration*1000, "end=start+duration");
  assert.equal(duration, timeWindow.duration.asSeconds(), "duration");
});
