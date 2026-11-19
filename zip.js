(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BadgeZIP=api;}(globalThis,function(){
  'use strict';
  const table=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
  const crc32=bytes=>{let crc=0xffffffff;for(const b of bytes)crc=table[(crc^b)&255]^(crc>>>8);return(crc^0xffffffff)>>>0;};
  function header(size){const bytes=new Uint8Array(size);return {bytes,view:new DataView(bytes.buffer)};}
  function create(files){
    const parts=[],central=[];let offset=0,centralSize=0;
    if(files.length>65535)throw new Error('Too many files for this archive.');
    for(const file of files){
      if(!/^[a-zA-Z0-9_.-]+$/.test(file.name))throw new Error('Unsafe archive filename.');
      const name=new TextEncoder().encode(file.name),bytes=file.bytes,crc=crc32(bytes),local=header(30);
      local.view.setUint32(0,0x04034b50,true);local.view.setUint16(4,20,true);local.view.setUint16(6,0x800,true);local.view.setUint16(12,33,true);local.view.setUint32(14,crc,true);local.view.setUint32(18,bytes.length,true);local.view.setUint32(22,bytes.length,true);local.view.setUint16(26,name.length,true);
      parts.push(local.bytes,name,bytes);
      const item=header(46);item.view.setUint32(0,0x02014b50,true);item.view.setUint16(4,20,true);item.view.setUint16(6,20,true);item.view.setUint16(8,0x800,true);item.view.setUint16(14,33,true);item.view.setUint32(16,crc,true);item.view.setUint32(20,bytes.length,true);item.view.setUint32(24,bytes.length,true);item.view.setUint16(28,name.length,true);item.view.setUint32(42,offset,true);central.push(item.bytes,name);centralSize+=46+name.length;offset+=30+name.length+bytes.length;
    }
    const end=header(22);end.view.setUint32(0,0x06054b50,true);end.view.setUint16(8,files.length,true);end.view.setUint16(10,files.length,true);end.view.setUint32(12,centralSize,true);end.view.setUint32(16,offset,true);return new Blob([...parts,...central,end.bytes],{type:'application/zip'});
  }
  return {create,crc32};
}));
