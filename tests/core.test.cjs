const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { readCSV, parseAttendees, DEMO_CSV, LIMITS } = require('../core.js');
const header = 'name,organization,role\n';

test('demo contains 12 fictional attendees and agrees with the sample file', () => {
  const result = parseAttendees(DEMO_CSV);
  assert.equal(result.error, null);
  assert.equal(result.attendees.length, 12);
  assert.equal(result.attendees[0].name, 'Avery Morgan');
  assert.deepEqual(result, parseAttendees(fs.readFileSync(path.join(__dirname, '../sample-attendees.csv'), 'utf8')));
});
test('UTF-8 BOM, CRLF, blank lines and surrounding whitespace', () => {
  assert.deepEqual(parseAttendees('\uFEFF name , organization , role \r\n\r\n Jane Doe , Example , Speaker \r\n,,\r\n').attendees,
    [{ name: 'Jane Doe', organization: 'Example', role: 'Speaker' }]);
});
test('quoted commas and escaped double quotes', () => {
  assert.deepEqual(parseAttendees(header + '"Lee, Jordan","A ""Better"" Studio",Speaker').attendees,
    [{ name: 'Lee, Jordan', organization: 'A "Better" Studio', role: 'Speaker' }]);
});
test('multiline quoted values are normalized for badges', () => {
  assert.equal(parseAttendees(header + '"Jane\r\nDoe",Example,Speaker').attendees[0].name, 'Jane Doe');
});
test('reordered, case-insensitive headers and British organisation spelling', () => {
  assert.deepEqual(parseAttendees('Role,NAME,Organisation\nSpeaker,Jane,Example').attendees,
    [{ name: 'Jane', organization: 'Example', role: 'Speaker' }]);
});
test('additional named columns are ignored', () => {
  assert.equal(parseAttendees('name,email,organization,role\nJane,jane@example.test,Example,Speaker').attendees[0].name, 'Jane');
});
test('missing required headers explain the problem', () => {
  assert.match(parseAttendees('name,organization\nJane,Example').error, /Missing CSV header: role/);
});
test('duplicate and alias-colliding headers are rejected', () => {
  assert.match(parseAttendees('name,name,organization,role\nA,B,C,D').error, /duplicate/);
  assert.match(parseAttendees('name,organization,organisation,role\nA,B,C,D').error, /duplicate/);
});
test('unclosed quotes are rejected with line numbers', () => {
  assert.match(parseAttendees(header + '"Jane,Example,Speaker').error, /Line 2.*closing quote/);
});
test('stray quotes and text after closing quotes are rejected', () => {
  assert.match(parseAttendees(header + 'Ja"ne,Example,Speaker').error, /entire value/);
  assert.match(parseAttendees(header + '"Jane"x,Example,Speaker').error, /after a closing quote/);
});
test('whitespace after a closing quote is accepted', () => {
  assert.equal(parseAttendees(header + '"Jane"  ,Example,Speaker').attendees[0].name, 'Jane');
});
test('extra and missing cells are rejected rather than shifted', () => {
  assert.match(parseAttendees(header + 'Jane,Example,Inc,Speaker').error, /expected 3 columns, found 4/);
  assert.match(parseAttendees(header + 'Jane,Example').error, /expected 3 columns, found 2/);
});
test('blank input, blank records and header-only lists have no attendees', () => {
  for (const value of ['', '\n\r\n', header, header + ',,\n']) {
    assert.deepEqual(parseAttendees(value), { attendees: [], error: null });
  }
});
test('a populated record without a name fails the whole import', () => {
  const result = parseAttendees(header + 'Jane,Example,Speaker\n,Another,Attendee');
  assert.match(result.error, /Line 3.*needs a name/);
  assert.deepEqual(result.attendees, []);
});
test('organization can be empty and missing role defaults to Attendee', () => {
  assert.deepEqual(parseAttendees(header + 'Jane,,').attendees, [{ name: 'Jane', organization: '', role: 'Attendee' }]);
});
test('duplicate names represent distinct badges', () => {
  assert.equal(parseAttendees(header + 'Jane,One,Speaker\nJane,Two,Attendee').attendees.length, 2);
});
test('non-ASCII names and emoji are preserved', () => {
  const result = parseAttendees(header + 'Zoë García,Élan,Speaker\n李明,未来,嘉宾\nأمينة حسن,مثال,متحدث\nAda 🚀,Orbit,Guest');
  assert.equal(result.error, null);
  assert.equal(result.attendees[1].name, '李明');
  assert.equal(result.attendees[3].name, 'Ada 🚀');
});
test('HTML-like values remain ordinary data', () => {
  const result = parseAttendees(header + '<img src=x onerror=alert(1)>,Example,Speaker');
  assert.equal(result.attendees[0].name, '<img src=x onerror=alert(1)>');
});
test('field limits accept the boundary and reject one character over', () => {
  for (const field of ['name', 'organization', 'role']) {
    const person = { name: 'Jane', organization: 'Example', role: 'Speaker' };
    person[field] = 'A'.repeat(LIMITS[field]);
    assert.equal(parseAttendees(header + Object.values(person).join(',')).error, null);
    person[field] += 'A';
    assert.match(parseAttendees(header + Object.values(person).join(',')).error, /exceeds/);
  }
});
test('input and attendee limits prevent unbounded work', () => {
  assert.match(parseAttendees('A'.repeat(LIMITS.input + 1)).error, /too large/);
  assert.equal(parseAttendees(header + 'Jane,Example,Guest\n'.repeat(1000)).attendees.length, 1000);
  assert.match(parseAttendees(header + 'Jane,Example,Guest\n'.repeat(1001)).error, /1,000/);
});
test('control characters are rejected', () => {
  assert.match(parseAttendees(header + 'Ja\u0000ne,Example,Speaker').error, /control character/);
});
test('error lines account for quoted newlines', () => {
  assert.match(parseAttendees(header + '"Jane\nDoe",Example,Speaker\n,Example,Guest').error, /Line 4/);
});
test('reader rejects non-text input', () => { assert.throws(() => readCSV(null), /must be text/); });
