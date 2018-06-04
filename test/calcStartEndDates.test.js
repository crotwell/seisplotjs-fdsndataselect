import * as fdsndataselect from '../src/fdsndataselect';

test("simple station", () => {
  const duration = 300;
  const clockOffset = 0;
  let timeWindow = fdsndataselect.calcStartEndDates(null, null, duration, clockOffset);
  expect(timeWindow.end.valueOf()).toEqual(timeWindow.start.valueOf()+duration*1000);
  expect(duration).toEqual(timeWindow.duration.asSeconds());
});
