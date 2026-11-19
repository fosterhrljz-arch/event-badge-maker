const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../model.js');
const Z = require('../zip.js');
const C = require('../core.js');

test('ten original templates have five layouts in each orientation', () => {
  assert.equal(M.templates.length, 10);
  assert.equal(new Set(M.templates.map(t => t.id)).size, 10);
  assert.equal(M.templates.filter(t => t.orientation === 'portrait').length, 5);
  assert.equal(M.templates.filter(t => t.orientation === 'landscape').length, 5);
  for (const d of M.templates) {
    assert.equal(d.width * d.height, 540000);
    for (const e of d.elements) {
      assert.ok(e.x >= 0 && e.y >= 0 && e.x + e.w <= d.width && e.y + e.h <= d.height, `${d.id}/${e.id}`);
    }
  }
});
test('project instances and template defaults are independent', () => {
  const a = M.newProject(C.DEMO_CSV), b = M.newProject(C.DEMO_CSV);
  a.designs.editorial.elements[0].x = 999;
  assert.equal(b.designs.editorial.elements[0].x, 46);
  assert.equal(M.templates[0].elements[0].x, 46);
});
test('saved project round-trips through strict validation', () => {
  const p = M.newProject(C.DEMO_CSV);
  assert.deepEqual(M.validateProject(JSON.parse(JSON.stringify(p))), p);
});
test('text resolves attendee, event, company and custom bindings', () => {
  const p = M.newProject(''), person = {name:'Avery Morgan', organization:'Studio', role:'Speaker'};
  for (const key of Object.keys(M.BINDINGS)) {
    const e = M.text('test',key,0,0,100,100,20,'Arial','#000000',{text:'Access all sessions'});
    assert.equal(M.resolveText(e,person,p), key === 'custom' ? e.text : (p[key] ?? person[key]));
    e.uppercase = true;
    assert.equal(M.resolveText(e,person,p), (key === 'custom' ? e.text : (p[key] ?? person[key])).toUpperCase());
  }
});
test('element geometry stays inside the badge', () => {
  assert.deepEqual(M.bounds({x:-30,y:900,w:900,h:2},{width:600,height:900}), {x:0,y:878,w:600,h:22});
});
test('filenames are unique by row and safe for ZIP paths', () => {
  const p = {name:'../../Ávery : Morgan <script>'};
  assert.equal(M.filename(p,0),'001-avery-morgan-script.png');
  assert.notEqual(M.filename(p,0),M.filename(p,1));
  assert.equal(M.filename({name:'★'},0),'001-attendee.png');
});
for (const [name, change] of Object.entries({
  version: p => p.version = 1,
  'unknown template': p => p.activeTemplate = 'fake',
  'remote asset': p => p.assets.push({id:'a',name:'Logo',data:'https://example.com/logo.png'}),
  'SVG asset': p => p.assets.push({id:'a',name:'Logo',data:'data:image/svg+xml;base64,PHN2Zz4='}),
  'missing image asset': p => p.designs.editorial.elements.push(M.imageElement({id:'missing',name:'Missing'},p.designs.editorial)),
  'duplicate IDs': p => p.designs.editorial.elements.push({...p.designs.editorial.elements[0]}),
  'nonfinite position': p => p.designs.editorial.elements[0].x = Infinity,
  'unapproved font': p => p.designs.editorial.elements[0].font = 'url(fake)',
  'invalid color': p => p.designs.editorial.bg = 'red',
  'oversized type': p => p.designs.editorial.elements[0].size = 201,
  'oversized text': p => p.designs.editorial.elements[0].text = 'x'.repeat(1001),
  'changed canvas dimensions': p => p.designs.editorial.width = 20,
  'missing template': p => delete p.designs.index,
  'too many elements': p => p.designs.editorial.elements = Array.from({length:61},(_,i)=>({...p.designs.editorial.elements[0],id:`item${i}`}))
})) test(`project validation rejects ${name}`, () => {
  const p = M.newProject(''); change(p); assert.throws(() => M.validateProject(p));
});
test('project validation strips unknown fields and clamps geometry', () => {
  const p=M.newProject(''); p.externalUrl='https://example.com';p.designs.editorial.elements[0].x=9000;
  const q=M.validateProject(p);
  assert.equal(q.externalUrl,undefined);assert.equal(q.designs.editorial.elements[0].x,260);
});
test('CRC32 matches the standard test vector', () => {
  assert.equal(Z.crc32(new TextEncoder().encode('123456789')),0xcbf43926);
});
test('ZIP rejects paths and creates correct directory counts and offsets', async () => {
  assert.throws(() => Z.create([{name:'../a.png',bytes:new Uint8Array()}]));
  const data=Buffer.from(await Z.create([{name:'001.png',bytes:Buffer.from('123456789')}]).arrayBuffer());
  assert.equal(data.readUInt32LE(0),0x04034b50);
  assert.equal(data.readUInt32LE(14),0xcbf43926);
  assert.equal(data.readUInt16LE(data.length-12),1);
  assert.equal(data.readUInt32LE(data.length-6),46);
  assert.equal(data.readUInt32LE(46),0x02014b50);
});
