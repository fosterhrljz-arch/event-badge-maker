(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BadgeModel = api;
}(globalThis, function () {
  'use strict';
  const FONTS = Object.freeze({ Arial: 'Arial, Helvetica, sans-serif', Georgia: 'Georgia, serif', 'Trebuchet MS': '"Trebuchet MS", sans-serif', Verdana: 'Verdana, sans-serif', 'Courier New': '"Courier New", monospace' });
  const BINDINGS = Object.freeze({ company: 'Company name / logo', event: 'Event name', name: 'Attendee name', organization: 'Organization', role: 'Role', custom: 'Custom text' });
  const clone = value => JSON.parse(JSON.stringify(value));
  const text = (id, bind, x, y, w, h, size, font = 'Arial', color = '#191c22', extra = {}) => ({ id, type: bind === 'company' ? 'brand' : 'text', label: BINDINGS[bind] || id, bind, text: '', x, y, w, h, size, font, color, weight: '400', italic: false, align: 'left', uppercase: false, tracking: 0, lineHeight: 1.08, autoFit: true, ...extra });
  const custom = (id, value, x, y, w, h, size, font, color, extra = {}) => text(id, 'custom', x, y, w, h, size, font, color, { text: value, label: value, ...extra });
  const bold = { weight: '700' };
  const caps = { uppercase: true, tracking: 3 };
  const templates = [
    { id: 'editorial', name: 'Editorial', orientation: 'portrait', description: 'Warm paper. Confident serif type.', bg: '#f6f0e3', accent: '#cf4e13', elements: [
      text('brand','company',46,44,340,54,27,'Arial','#211e19',{...bold,...caps}),
      text('event','event',46,190,508,84,21,'Courier New','#211e19',{uppercase:true,tracking:2}),
      text('name','name',46,340,508,230,92,'Georgia','#211e19'),
      text('org','organization',46,622,508,90,32,'Georgia','#211e19'),
      text('role','role',46,790,508,65,29,'Arial','#cf4e13',{...bold,...caps})
    ]},
    { id: 'signal', name: 'Signal', orientation: 'portrait', description: 'Night blue. Oversized orbital lines.', bg: '#081331', accent: '#194cf5', elements: [
      text('brand','company',46,42,400,52,28,'Arial','#ffffff',bold),
      text('name','name',46,430,508,210,86,'Arial','#ffffff',bold),
      text('role','role',46,688,508,70,30,'Courier New','#abf5ae',{...bold,...caps}),
      text('event','event',46,786,508,50,20,'Courier New','#ffffff',{uppercase:true,tracking:1}),
      text('org','organization',46,840,508,40,20,'Arial','#d8e1f7')
    ]},
    { id: 'modular', name: 'Modular', orientation: 'portrait', description: 'An asymmetric system of type and blocks.', bg: '#e2ffa6', accent: '#b48af4', elements: [
      text('brand','company',112,42,440,50,28,'Arial','#12190e',bold),
      text('name','name',112,140,440,230,78,'Arial','#12190e',bold),
      custom('org-label','ORGANIZATION',112,410,300,28,17,'Courier New','#12190e',{tracking:1.5}),
      text('org','organization',112,448,300,100,29,'Courier New','#12190e'),
      custom('event-label','EVENT',112,585,300,28,17,'Courier New','#12190e',{tracking:1.5}),
      text('event','event',112,625,300,130,29,'Courier New','#12190e'),
      text('role','role',112,810,300,64,29,'Arial','#12190e',{...bold,uppercase:true,tracking:2})
    ]},
    { id: 'contour', name: 'Contour', orientation: 'portrait', description: 'Quiet typography. Organic linework.', bg: '#f1e8d5', accent: '#343e1d', elements: [
      text('brand','company',46,42,508,50,27,'Arial','#343e1d',{...bold,tracking:2}),
      text('event','event',46,106,508,75,26,'Georgia','#343e1d',{italic:true}),
      text('name','name',46,235,508,230,84,'Georgia','#343e1d'),
      text('org','organization',46,490,508,90,32,'Georgia','#343e1d'),
      text('role','role',46,800,508,65,29,'Arial','#343e1d',{...bold,...caps})
    ]},
    { id: 'spectrum', name: 'Spectrum', orientation: 'portrait', description: 'Color in motion against a deep dark field.', bg: '#091323', accent: '#72e8ec', elements: [
      text('brand','company',46,42,390,50,27,'Arial','#ffffff',{...bold,tracking:2}),
      custom('year','2026',456,45,100,40,24,'Courier New','#ffffff',{align:'right'}),
      text('name','name',46,535,508,185,78,'Arial','#ffffff',bold),
      text('event','event',46,748,508,40,19,'Arial','#ffffff',{uppercase:true}),
      text('org','organization',46,797,508,35,20,'Arial','#cbd5e5'),
      text('role','role',46,844,508,42,26,'Arial','#91eaf1',{...bold,...caps})
    ]},
    { id: 'executive', name: 'Executive', orientation: 'landscape', description: 'A precise, spacious corporate identity.', bg: '#ffffff', accent: '#143e8f', elements: [
      text('event','event',120,48,390,94,29,'Arial','#111d3c'),
      text('brand','company',585,47,265,55,28,'Arial','#111d3c',{...bold,tracking:3,align:'right'}),
      text('name','name',120,152,700,275,118,'Arial','#091433',bold),
      text('org','organization',120,492,440,74,29,'Arial','#111d3c'),
      text('role','role',610,489,240,55,24,'Arial','#ffffff',{...bold,uppercase:true,tracking:2,align:'center'})
    ]},
    { id: 'split', name: 'Split', orientation: 'landscape', description: 'Two distinct zones. One clear introduction.', bg: '#dbe7c8', accent: '#10472e', elements: [
      text('brand','company',40,42,245,60,27,'Arial','#f5f1dc',{...bold,tracking:2}),
      text('event','event',40,185,245,250,49,'Arial','#f5f1dc',bold),
      custom('year','2026',40,510,230,45,29,'Courier New','#f5f1dc',{tracking:3}),
      text('name','name',370,108,480,230,82,'Arial','#10241a',bold),
      text('org','organization',370,355,480,85,30,'Arial','#10241a'),
      text('role','role',370,490,480,60,31,'Arial','#10241a',{...bold,...caps})
    ]},
    { id: 'studio', name: 'Studio', orientation: 'landscape', description: 'Editorial warmth with a bold serif voice.', bg: '#faf4e7', accent: '#ff8a0a', elements: [
      text('brand','company',40,30,380,55,30,'Georgia','#171714',{...bold,tracking:3}),
      text('event','event',510,32,350,95,29,'Georgia','#171714',{italic:true,align:'right'}),
      text('name','name',110,150,740,300,138,'Georgia','#171714',{align:'center'}),
      text('org','organization',240,510,375,60,30,'Georgia','#171714'),
      text('role','role',650,510,210,55,25,'Georgia','#171714',{...bold,uppercase:true,tracking:2,align:'right'})
    ]},
    { id: 'vector', name: 'Vector', orientation: 'landscape', description: 'Directional energy. Electric contrast.', bg: '#1648e8', accent: '#a6f4b3', elements: [
      text('brand','company',44,40,600,60,32,'Arial','#ffffff',{...bold,italic:true,tracking:3}),
      text('name','name',44,150,740,270,122,'Arial','#ffffff',bold),
      text('role','role',44,432,620,70,37,'Arial','#a6f4b3',{...bold,italic:true,...caps}),
      text('org','organization',44,530,740,30,23,'Arial','#ffffff'),
      text('event','event',44,570,740,25,18,'Arial','#e6edff')
    ]},
    { id: 'index', name: 'Index', orientation: 'landscape', description: 'A technical grid with exacting hierarchy.', bg: '#e9edf0', accent: '#ff8a12', elements: [
      text('brand','company',40,25,650,45,31,'Courier New','#111719',{...bold,tracking:3}),
      text('event','event',40,101,585,34,21,'Courier New','#111719',{uppercase:true}),
      custom('year-top','2026',700,101,150,34,21,'Courier New','#111719',{align:'right'}),
      text('name','name',40,170,820,300,132,'Arial','#111719',bold),
      custom('org-label','ORGANIZATION',40,496,330,25,17,'Courier New','#111719'),
      custom('role-label','ROLE',430,496,230,25,17,'Courier New','#111719'),
      custom('date-label','YEAR',735,496,125,25,17,'Courier New','#111719'),
      text('org','organization',40,531,330,48,24,'Courier New','#111719'),
      text('role','role',430,531,230,48,24,'Courier New','#111719',{uppercase:true}),
      custom('year','2026',735,531,125,48,24,'Courier New','#111719')
    ]}
  ];
  templates.forEach(t => { t.width=t.orientation==='portrait'?600:900; t.height=t.orientation==='portrait'?900:600; t.artwork=true; t.backgroundImage=null; t.backgroundOpacity=1; t.backgroundFit='cover'; });

  const C = typeof module === 'object' && module.exports ? require('./core.js') : globalThis.BadgeCore;
  const newId = () => 'id-' + (globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2));
  function newProject(csv) {
    return {version:3,company:'HORIZON',event:'Ideas in Motion 2026',csv,activeTemplate:'editorial',designs:Object.fromEntries(templates.map(t=>[t.id,clone(t)])),assets:[],attendeeIds:C.parseAttendees(csv).attendees.map(()=>newId()),attendee:0,scale:3};
  }
  function rawText(el, person, project) { return String(el.bind==='custom'?el.text:el.bind==='company'?project.company:el.bind==='event'?project.event:person?.[el.bind]||''); }
  function resolveText(el, person, project) { const raw=rawText(el,person,project);return el.uppercase?raw.toLocaleUpperCase('en-US'):raw; }
  function editText(project, el, index, value) {
    if(el.type==='image')throw new Error('Select a text element.');
    if(['name','organization','role'].includes(el.bind))project.csv=C.editAttendee(project.csv,index,el.bind,value);
    else if(el.bind==='custom'){if(value.length>1000)throw new Error('Use no more than 1,000 characters.');el.text=value;}
    else {const limit=el.bind==='company'?100:200;if(value.length>limit)throw new Error(`Use no more than ${limit} characters.`);project[el.bind]=value;}
  }
  function bounds(el, doc) { el.w=Math.max(30,Math.min(doc.width,Number(el.w)||30)); el.h=Math.max(22,Math.min(doc.height,Number(el.h)||22)); el.x=Math.max(0,Math.min(doc.width-el.w,Number(el.x)||0)); el.y=Math.max(0,Math.min(doc.height-el.h,Number(el.y)||0)); return el; }
  function filename(person,index) { const name=person.name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70).toLowerCase()||'attendee'; return `${String(index+1).padStart(3,'0')}-${name}.png`; }
  const imageData = v => typeof v==='string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length<=16000000;
  const visible = (el,person) => el.type!=='image'||el.scope!=='badge'||el.attendeeId===person?.id;
  function imageElement(asset,doc,scope='template',attendeeId=null,background=false) {
    return {id:newId(),type:'image',label:asset.name,assetId:asset.id,x:background?0:40,y:background?0:40,w:background?doc.width:Math.min(300,doc.width-80),h:background?doc.height:160,scope,attendeeId:scope==='badge'?attendeeId:null,kind:background?'background':'image',fit:background?'cover':'contain',opacity:1};
  }
  function placements(project,id,templateId=null) { return Object.values(project.designs).filter(d=>!templateId||d.id===templateId).flatMap(d=>d.elements.filter(e=>e.type==='image'&&e.assetId===id)); }
  function removePlacements(project,id,templateId=null) { for(const d of Object.values(project.designs))if(!templateId||d.id===templateId)d.elements=d.elements.filter(e=>e.type!=='image'||e.assetId!==id); }
  function replaceCSV(project,value) {
    const old=C.parseAttendees(project.csv).attendees, next=C.parseAttendees(value), queues=new Map();
    old.forEach((person,i)=>{const key=JSON.stringify(person);if(!queues.has(key))queues.set(key,[]);queues.get(key).push(project.attendeeIds[i]);});
    project.csv=value;
    project.attendeeIds=next.attendees.map(person=>queues.get(JSON.stringify(person))?.shift()||newId());
    const ids=new Set(project.attendeeIds);
    for(const doc of Object.values(project.designs))doc.elements=doc.elements.filter(e=>e.type!=='image'||e.scope!=='badge'||ids.has(e.attendeeId));
    project.attendee=0;
  }
  function migrateV2(input) {
    const p=clone(input);p.version=3;p.assets=[];p.attendeeIds=C.parseAttendees(p.csv).attendees.map(()=>newId());
    if(p.logo!==null&&!imageData(p.logo))throw new Error('Invalid legacy logo.');
    const add=(data,name)=>{let asset=p.assets.find(a=>a.data===data);if(!asset){asset={id:newId(),name,data};p.assets.push(asset);}return asset;};
    const logo=p.logo?add(p.logo,'Imported logo'):null;
    for(const d of Object.values(p.designs||{})){
      if(!Array.isArray(d.elements))throw new Error('Invalid legacy layout.');
      if(logo)d.elements=d.elements.map(e=>e.type==='brand'?{...imageElement(logo,d),id:e.id,label:'Imported logo',x:e.x,y:e.y,w:e.w,h:e.h}:e);
      if(d.backgroundImage!==null&&!imageData(d.backgroundImage))throw new Error('Invalid legacy background.');
      if(d.backgroundImage){const asset=add(d.backgroundImage,'Imported background');d.elements.unshift({...imageElement(asset,d,'template',null,true),fit:d.backgroundFit,opacity:d.backgroundOpacity});}
      d.backgroundImage=null;
    }
    delete p.logo;return p;
  }
  function validateProject(input) {
    const bad=message=>{throw new Error(message);};
    if(input?.version===2)input=migrateV2(input);
    if (!input || input.version!==3) bad('Choose an Event Badge Maker version 2 or 3 project.');
    if(typeof input.company!=='string'||input.company.length>100||typeof input.event!=='string'||input.event.length>200||typeof input.csv!=='string'||input.csv.length>1000000) bad('Project text is missing or too large.');
    if(!templates.some(t=>t.id===input.activeTemplate)||!input.designs) bad('The project template is not recognized.');
    if(!Array.isArray(input.assets)||input.assets.length>60)bad('Use no more than 60 library assets.');
    const assetIds=new Set();
    const assets=input.assets.map(a=>{
      if(!a||typeof a.id!=='string'||a.id.length>100||assetIds.has(a.id)||typeof a.name!=='string'||a.name.length>200||!imageData(a.data))bad('Invalid library asset.');
      assetIds.add(a.id);return {id:a.id,name:a.name,data:a.data};
    });
    if(!Array.isArray(input.attendeeIds)||input.attendeeIds.length>1000||new Set(input.attendeeIds).size!==input.attendeeIds.length||input.attendeeIds.some(id=>typeof id!=='string'||id.length>100))bad('Invalid attendee identities.');
    const parsed=C.parseAttendees(input.csv);if(!parsed.error&&parsed.attendees.length!==input.attendeeIds.length)bad('Attendee identities do not match the CSV.');
    const personIds=new Set(input.attendeeIds),clean=newProject(input.csv);
    clean.company=input.company;clean.event=input.event;clean.activeTemplate=input.activeTemplate;clean.assets=assets;clean.attendeeIds=[...input.attendeeIds];clean.attendee=Math.max(0,Math.min(Number.isInteger(input.attendee)?input.attendee:0,input.attendeeIds.length-1));clean.scale=[1,2,3,4].includes(input.scale)?input.scale:3;
    for(const template of templates){
      const doc=input.designs[template.id];
      if(!doc||doc.width!==template.width||doc.height!==template.height||!Array.isArray(doc.elements)||doc.elements.length>60)bad(`Invalid layout: ${template.name}.`);
      if(!/^#[a-f\d]{6}$/i.test(doc.bg))bad('Invalid background color.');
      const ids=new Set();
      const elements=doc.elements.map(raw=>{
        if(!raw||typeof raw.id!=='string'||raw.id.length>100||ids.has(raw.id))bad('Invalid or duplicate element identifier.');ids.add(raw.id);
        for(const key of ['x','y','w','h'])if(typeof raw[key]!=='number'||!Number.isFinite(raw[key]))bad('Element dimensions must be finite numbers.');
        if(typeof raw.label!=='string'||raw.label.length>1000)bad('Invalid element label.');
        if(raw.type==='image'){
          if(!assetIds.has(raw.assetId)||!['template','badge'].includes(raw.scope)||!['image','background'].includes(raw.kind)||!['cover','contain'].includes(raw.fit)||typeof raw.opacity!=='number'||!Number.isFinite(raw.opacity)||raw.opacity<0||raw.opacity>1)bad('Invalid image placement.');
          if(raw.scope==='badge'&&!personIds.has(raw.attendeeId))bad('Image placement refers to a missing attendee.');
          return bounds({id:raw.id,type:'image',label:raw.label,assetId:raw.assetId,x:raw.x,y:raw.y,w:raw.w,h:raw.h,scope:raw.scope,attendeeId:raw.scope==='badge'?raw.attendeeId:null,kind:raw.kind,fit:raw.fit,opacity:raw.opacity},template);
        }
        if(!['brand','text'].includes(raw.type)||!Object.hasOwn(BINDINGS,raw.bind)||!Object.hasOwn(FONTS,raw.font)||!/^#[a-f\d]{6}$/i.test(raw.color)||!['400','600','700'].includes(raw.weight)||!['left','center','right'].includes(raw.align))bad('Invalid text properties.');
        if(typeof raw.text!=='string'||raw.text.length>1000)bad('Invalid element text.');
        for(const key of ['size','tracking','lineHeight'])if(typeof raw[key]!=='number'||!Number.isFinite(raw[key]))bad('Text properties must be finite numbers.');
        if(raw.size<10||raw.size>200||raw.tracking<0||raw.tracking>12||raw.lineHeight<1||raw.lineHeight>2)bad('Text style is outside supported limits.');
        return bounds(text(raw.id,raw.bind,raw.x,raw.y,raw.w,raw.h,raw.size,raw.font,raw.color,{type:raw.type,label:raw.label,text:raw.text,weight:raw.weight,align:raw.align,italic:!!raw.italic,uppercase:!!raw.uppercase,tracking:raw.tracking,lineHeight:raw.lineHeight,autoFit:!!raw.autoFit}),template);
      });
      clean.designs[template.id]={...clone(template),bg:doc.bg,artwork:!!doc.artwork,elements};
    }
    return clean;
  }
  return {FONTS,BINDINGS,templates,newProject,rawText,resolveText,editText,bounds,filename,validateProject,clone,text,newId,visible,imageElement,placements,removePlacements,replaceCSV};
}));
