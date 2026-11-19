(function () {
  'use strict';
  const { FONTS, resolveText } = BadgeModel;
  const cache=new Map();
  function loadImage(src) {
    if(!src)return Promise.resolve(null);
    if(cache.has(src))return cache.get(src);
    const promise=new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{if(img.width*img.height>32000000)reject(new Error('Image exceeds the 32-megapixel limit.'));else resolve(img);};img.onerror=()=>reject(new Error('Image could not be decoded. Use PNG, JPEG, or WebP.'));img.src=src;});
    cache.set(src,promise); promise.catch(()=>cache.delete(src)); return promise;
  }
  async function prepare(project,doc){
    const ids=new Set(doc.elements.filter(e=>e.type==='image').map(e=>e.assetId)),images={};
    for(const asset of project.assets)if(ids.has(asset.id))images[asset.id]=await loadImage(asset.data);
    return {images};
  }
  function font(ctx,el,size){ctx.font=`${el.italic?'italic ':''}${el.weight} ${size}px ${FONTS[el.font]}`;ctx.textBaseline='alphabetic';}
  const graphemes = value => typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(value)].map(s=>s.segment):Array.from(value);
  function metrics(ctx,value,tracking){
    if(!tracking){const m=ctx.measureText(value),left=Math.max(0,m.actualBoundingBoxLeft||0);return {width:left+Math.max(m.width,m.actualBoundingBoxRight||0),left};}
    let advance=0,left=0,right=0;
    for(const ch of graphemes(value)){const m=ctx.measureText(ch);left=Math.max(left,(m.actualBoundingBoxLeft||0)-advance);right=Math.max(right,advance+(m.actualBoundingBoxRight||0));advance+=m.width+tracking;}
    return {width:left+Math.max(0,right,advance-(value?tracking:0)),left};
  }
  const width=(ctx,value,tracking)=>metrics(ctx,value,tracking).width;
  function wrap(ctx,value,w,tracking){
    const lines=[];
    for(const paragraph of value.split('\n')){
      if(!paragraph){lines.push('');continue;}
      let line='';
      for(const word of paragraph.trim().split(/\s+/u)){
        const combined=line?line+' '+word:word;
        if(width(ctx,combined,tracking)<=w){line=combined;continue;}
        if(line){lines.push(line);line='';}
        if(width(ctx,word,tracking)<=w){line=word;continue;}
        for(const ch of graphemes(word)){
          if(line && width(ctx,line+ch,tracking)>w){lines.push(line);line=ch;}else line+=ch;
        }
      }
      if(line)lines.push(line);
    }
    return lines;
  }
  function layout(ctx,el,value){
    const at=size=>{
      font(ctx,el,size);const lines=wrap(ctx,value,el.w,el.tracking),lineHeight=size*el.lineHeight;
      const glyphs=lines.map(line=>ctx.measureText(line));
      const baseline=Math.max(size*.84,...glyphs.map(m=>m.actualBoundingBoxAscent||0));
      const descent=Math.max(size*.16,...glyphs.map(m=>m.actualBoundingBoxDescent||0));
      const needed=Math.max(lines.length*lineHeight,baseline+descent+Math.max(0,lines.length-1)*lineHeight);
      return {size,lines,lineHeight,baseline,fits:needed<=el.h+.01&&lines.every(line=>width(ctx,line,el.tracking)<=el.w+.01)};
    };
    let result=at(el.size);
    if(!result.fits&&el.autoFit){let low=10,high=el.size;result=at(10);for(let i=0;i<10;i++){const mid=(low+high)/2,trial=at(mid);if(trial.fits){low=mid;result=trial;}else high=mid;}result=at(Math.floor(result.size*10)/10);}
    return result;
  }
  function write(ctx,value,x,y,tracking){
    if(!tracking){ctx.fillText(value,x,y);return;}
    // Use grapheme clusters so combining accents remain intact when letter spacing is enabled.
    for(const ch of graphemes(value)){ctx.fillText(ch,x,y);x+=ctx.measureText(ch).width+tracking;}
  }
  function drawImage(ctx,img,x,y,w,h,fit='contain'){
    if(!img)return;const ratio=fit==='cover'?Math.max(w/img.width,h/img.height):Math.min(w/img.width,h/img.height);
    const dw=img.width*ratio,dh=img.height*ratio;ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,x+(w-dw)/2,y+(h-dh)/2,dw,dh);ctx.restore();
  }
  function art(ctx,doc){
    const fill=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
    const line=(color,x,y,x2,y2,size=2)=>{ctx.strokeStyle=color;ctx.lineWidth=size;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();};
    if(doc.id==='editorial'){fill('#cf4e13',405,0,195,150);line('#504739',46,760,554,760,1.5);}
    if(doc.id==='signal'){ctx.strokeStyle='#194cf5';ctx.lineWidth=62;for(const r of [215,350]){ctx.beginPath();ctx.arc(620,-15,r,0,Math.PI*2);ctx.stroke();}}
    if(doc.id==='modular'){line('#354526',80,0,80,900,1.4);for(let y=35;y<900;y+=72)line('#182116',16,y,62,y,3);fill('#b48af4',455,400,145,500);line('#172111',112,785,412,785,1.4);}
    if(doc.id==='contour'){
      ctx.strokeStyle='#343e1d';ctx.lineWidth=2;const paths=[[[0,780],[70,680,170,790,220,700],[280,600,400,720,445,610],[480,535,550,600,600,550]],[[135,790],[170,740,260,805,325,718],[400,620,445,700,475,650],[510,590,560,640,600,600]],[[365,790],[365,710,485,740,510,690],[540,630,575,690,600,660]],[[40,790],[280,790,480,775,520,830],[550,885,565,885,600,900]]];
      for(const p of paths){ctx.beginPath();ctx.moveTo(...p[0]);for(const curve of p.slice(1))ctx.bezierCurveTo(...curve);ctx.stroke();}
    }
    if(doc.id==='spectrum'){
      for(const [angle,colors,rx,ry] of [[-.55,['#087eff','#ff6466'],220,120],[.45,['#ffdf32','#b38cff'],245,105]]){
        ctx.save();ctx.translate(300,300);ctx.rotate(angle);const gradient=ctx.createLinearGradient(-250,0,250,0);gradient.addColorStop(0,colors[0]);gradient.addColorStop(1,colors[1]);ctx.strokeStyle=gradient;ctx.lineWidth=34;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      }
    }
    if(doc.id==='executive'){fill('#143e8f',0,0,70,600);line('#122344',120,460,850,460,1.5);ctx.fillStyle='#154ff0';ctx.beginPath();ctx.roundRect(600,480,260,70,35);ctx.fill();}
    if(doc.id==='split'){fill('#10472e',0,0,320,600);line('#163728',370,465,850,465,1.5);}
    if(doc.id==='studio'){ctx.fillStyle='#ff8a0a';ctx.beginPath();ctx.arc(0,600,210,0,Math.PI*2);ctx.fill();}
    if(doc.id==='vector'){ctx.fillStyle='#142346';ctx.beginPath();ctx.moveTo(760,0);ctx.lineTo(900,0);ctx.lineTo(900,600);ctx.lineTo(540,600);ctx.closePath();ctx.fill();line('#a6f4b3',760,0,540,600,5);}
    if(doc.id==='index'){ctx.strokeStyle='#111719';ctx.lineWidth=1.5;ctx.strokeRect(12,12,876,576);for(const y of [80,145,480])line('#111719',12,y,888,y,1.5);line('#111719',665,80,665,145,1.5);for(const x of [405,705])line('#111719',x,480,x,588,1.5);fill('#ff8a12',830,25,42,40);}
  }
  function render(canvas,doc,person,project,assets={},scale=1){
    canvas.width=Math.round(doc.width*scale);canvas.height=Math.round(doc.height*scale);
    const ctx=canvas.getContext('2d');ctx.setTransform(scale,0,0,scale,0,0);ctx.fillStyle=doc.bg;ctx.fillRect(0,0,doc.width,doc.height);
    const placed=el=>{ctx.save();ctx.globalAlpha=el.opacity;drawImage(ctx,assets.images?.[el.assetId],el.x,el.y,el.w,el.h,el.fit);ctx.restore();};
    for(const el of doc.elements)if(el.type==='image'&&el.kind==='background'&&BadgeModel.visible(el,person))placed(el);
    if(doc.artwork)art(ctx,doc);
    const results=[];
    for(const el of doc.elements){
      if(!BadgeModel.visible(el,person))continue;
      if(el.type==='image'){if(el.kind!=='background')placed(el);results.push({id:el.id,fits:!!assets.images?.[el.assetId],size:0});continue;}
      const value=resolveText(el,person,project),l=layout(ctx,el,value);font(ctx,el,l.size);ctx.fillStyle=el.color;
      ctx.save();ctx.beginPath();ctx.rect(el.x,el.y,el.w,el.h);ctx.clip();
      l.lines.forEach((line,index)=>{const m=metrics(ctx,line,el.tracking),x=el.x+m.left+(el.align==='center'?(el.w-m.width)/2:el.align==='right'?el.w-m.width:0);write(ctx,line,x,el.y+l.baseline+index*l.lineHeight,el.tracking);});
      ctx.restore();results.push({id:el.id,fits:l.fits,size:l.size,lines:l.lines.length,empty:!value});
    }
    return results;
  }
  async function png(doc,person,project,scale){const canvas=document.createElement('canvas');const results=render(canvas,doc,person,project,await prepare(project,doc),scale);const bad=results.filter(r=>!r.fits);if(bad.length){canvas.width=canvas.height=1;throw new Error(`Text does not fit for ${person.name}. Enlarge the text box or enable Auto-fit.`);}return new Promise((resolve,reject)=>canvas.toBlob(blob=>{canvas.width=canvas.height=1;blob?resolve(blob):reject(new Error('PNG export failed. Try a lower resolution.'));},'image/png'));}
  async function readImage(file){
    if(file.size>12000000)throw new Error('Choose an image smaller than 12 MB.');
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw new Error('Use a PNG, JPEG, or WebP image.');
    const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('The file could not be read.'));reader.readAsDataURL(file);});
    const img=await loadImage(src);const ratio=Math.min(1,4096/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*ratio);canvas.height=Math.round(img.height*ratio);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const data=canvas.toDataURL('image/png');if(data.length>16000000)throw new Error('The decoded image is too large. Use a smaller image.');return data;
  }
  window.BadgeRenderer={render,prepare,png,readImage,loadImage,layout};
}());
