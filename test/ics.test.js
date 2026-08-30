const test = require('node:test');
const assert = require('node:assert/strict');
const { buildIcs } = require('../lib/ics');

test('creates an Apple-compatible one-hour timed event', () => {
  const ics = buildIcs({
    id: 'event-1',
    title: 'Revisión, cliente',
    date: '2026-08-30',
    time: '23:30',
    notes: 'Línea 1\nLínea 2',
  }, new Date('2026-08-30T12:34:56.000Z'));

  assert.match(ics, /DTSTAMP:20260830T123456Z\r\n/);
  assert.match(ics, /DTSTART:20260830T233000\r\n/);
  assert.match(ics, /DTEND:20260831T003000\r\n/);
  assert.match(ics, /SUMMARY:Revisión\\, cliente\r\n/);
  assert.match(ics, /DESCRIPTION:Línea 1\\nLínea 2\r\n/);
  assert.ok(ics.endsWith('\r\n'));
});

test('creates an inclusive single-day all-day event', () => {
  const ics = buildIcs({
    id: 'event-2',
    title: 'Entrega',
    date: '2026-12-31',
    time: '',
    notes: '',
  });

  assert.match(ics, /DTSTART;VALUE=DATE:20261231\r\n/);
  assert.match(ics, /DTEND;VALUE=DATE:20270101\r\n/);
});
