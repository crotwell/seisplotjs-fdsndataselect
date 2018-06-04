import * as fdsndataselect from '../src/fdsndataselect';

test("simple station", () => {
  var duration = 300;
  var clockOffset = 0;
  var timeWindow = fdsndataselect.calcStartEndDates(null, null, duration, clockOffset);
  expect(timeWindow.end.valueOf()).toEqual(timeWindow.start.valueOf()+duration*1000);
  expect(duration).toEqual(timeWindow.duration.asSeconds());
});
