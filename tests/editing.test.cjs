const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js'), M = require('../model.js');
const image = {id:'asset-1',name:'Example.png',data:'data:image/png;base64,YQ=='};
test('all ten original template definitions are unchanged from version 2', () => {
  const old=require('./fixtures/v2-project.json');
  for(const t of M.templates)assert.deepEqual(t,old.designs[t.id]);
});

test('bound name edits update one row and preserve its binding and identity', () => {
  const p=M.newProject(C.DEMO_CSV), e=p.designs.editorial.elements.find(e=>e.bind==='name'), ids=[...p.attendeeIds];
  M.editText(p,e,0,'Avery Updated');
  const people=C.parseAttendees(p.csv).attendees;
  assert.equal(people[0].name,'Avery Updated');assert.equal(people[1].name,'Jordan Lee');assert.equal(e.bind,'name');assert.deepEqual(p.attendeeIds,ids);
});
test('independent edits preserve extra columns, reordered headers and quoted cells', () => {
  let csv='role,ticket,name,organisation\nSpeaker,"one, two","Lee, Jordan",Example\nGuest,007,Other,Company';
  csv=C.editAttendee(csv,0,'name','Jordan "J" Lee');
  assert.equal(C.readCSV(csv)[1].values[1],'one, two');assert.equal(C.readCSV(csv)[2].values[1],'007');
  assert.equal(C.parseAttendees(csv).attendees[0].name,'Jordan "J" Lee');
});
test('invalid bound edits leave the project unchanged', () => {
  const p=M.newProject(C.DEMO_CSV),e=p.designs.editorial.elements.find(e=>e.bind==='name'),before=M.clone(p);
  for(const value of ['', 'x'.repeat(121), 'Bad\u0000Name']) { assert.throws(()=>M.editText(p,e,0,value));assert.deepEqual(p,before); }
});
test('organization and role edits do not affect other attendees', () => {
  const p=M.newProject(C.DEMO_CSV);
  for(const field of ['organization','role'])M.editText(p,p.designs.editorial.elements.find(e=>e.bind===field),0,'Changed');
  const people=C.parseAttendees(p.csv).attendees;assert.equal(people[0].organization,'Changed');assert.equal(people[1].organization,'Fieldwork');assert.equal(people[1].role,'Attendee');
});
test('custom text stays template-local while event/company data stays shared', () => {
  const p=M.newProject(C.DEMO_CSV),e=M.text('test','custom',0,0,100,100,20);
  M.editText(p,e,0,'Custom');assert.equal(e.text,'Custom');
  M.editText(p,p.designs.editorial.elements.find(e=>e.bind==='event'),0,'New event');assert.equal(p.event,'New event');
});
test('adding a library asset creates zero placements', () => {
  const p=M.newProject(C.DEMO_CSV),before=M.clone(p.designs);p.assets.push(image);assert.deepEqual(p.designs,before);assert.equal(M.placements(p,image.id).length,0);
});
test('image placement is limited to the chosen template', () => {
  const p=M.newProject(C.DEMO_CSV);p.assets.push(image);p.designs.editorial.elements.push(M.imageElement(image,p.designs.editorial));
  assert.equal(M.placements(p,image.id).length,1);assert.equal(M.placements(p,image.id,'signal').length,0);assert.deepEqual(M.validateProject(p),p);
});
test('badge-specific images follow attendee identity instead of the selected row', () => {
  const p=M.newProject(C.DEMO_CSV),e=M.imageElement(image,p.designs.editorial,'badge',p.attendeeIds[0]);
  assert.ok(M.visible(e,{id:p.attendeeIds[0]}));assert.ok(!M.visible(e,{id:p.attendeeIds[1]}));
});
test('remove all placements includes backgrounds and badge-scoped images but keeps assets', () => {
  const p=M.newProject(C.DEMO_CSV);p.assets.push(image);
  p.designs.editorial.elements.push(M.imageElement(image,p.designs.editorial));
  p.designs.signal.elements.push(M.imageElement(image,p.designs.signal,'badge',p.attendeeIds[1],true));
  M.removePlacements(p,image.id);assert.equal(M.placements(p,image.id).length,0);assert.equal(p.assets.length,1);
});
test('remove current-design placements leaves other templates intact', () => {
  const p=M.newProject(C.DEMO_CSV);p.assets.push(image);
  for(const id of ['editorial','signal'])p.designs[id].elements.push(M.imageElement(image,p.designs[id]));
  M.removePlacements(p,image.id,'editorial');assert.equal(M.placements(p,image.id).length,1);assert.equal(M.placements(p,image.id,'signal').length,1);
});
test('reordering unchanged CSV records preserves badge-scoped asset identities', () => {
  const p=M.newProject(C.DEMO_CSV),first=p.attendeeIds[0];p.assets.push(image);p.designs.editorial.elements.push(M.imageElement(image,p.designs.editorial,'badge',first));
  const lines=C.DEMO_CSV.split('\n');[lines[1],lines[2]]=[lines[2],lines[1]];M.replaceCSV(p,lines.join('\n'));
  assert.equal(p.attendeeIds[1],first);assert.equal(M.placements(p,image.id).length,1);
});
test('removed attendees leave no orphan badge-scoped placements', () => {
  const p=M.newProject(C.DEMO_CSV);p.assets.push(image);p.designs.editorial.elements.push(M.imageElement(image,p.designs.editorial,'badge',p.attendeeIds[0]));
  M.replaceCSV(p,'name,organization,role\nNew Person,Other,Guest');assert.equal(M.placements(p,image.id).length,0);assert.equal(p.assets.length,1);
});
test('version 2 projects migrate global logos and backgrounds into reusable assets', () => {
  const old=M.clone(require('./fixtures/v2-project.json'));old.logo=image.data;old.designs.editorial.backgroundImage=image.data;
  const p=M.validateProject(old);assert.equal(p.version,3);assert.equal(p.assets.length,1);assert.equal(M.placements(p,p.assets[0].id).length,11);assert.equal(p.attendeeIds.length,12);
});
test('version 3 round-trips template and badge-specific image settings', () => {
  const p=M.newProject(C.DEMO_CSV);p.assets.push(image);p.attendee=4;p.designs.index.elements.push({...M.imageElement(image,p.designs.index,'badge',p.attendeeIds[4]),fit:'cover',opacity:.5});assert.deepEqual(M.validateProject(JSON.parse(JSON.stringify(p))),p);
});
test('validation rejects orphan identities and duplicate or remote assets', () => {
  const p=M.newProject(C.DEMO_CSV);p.assets.push(image);p.designs.editorial.elements.push(M.imageElement(image,p.designs.editorial,'badge','missing'));assert.throws(()=>M.validateProject(p));
  p.designs.editorial.elements.pop();p.assets.push(image);assert.throws(()=>M.validateProject(p));
});
