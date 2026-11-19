"""Independently verify downloaded PNGs and ZIP CRCs with Python's standard library."""
import json
import struct
import sys
import zlib
import zipfile
from pathlib import Path

root = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
evidence = root / 'evidence'
results = []

def png(data, expected):
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    assert struct.unpack('>II', data[16:24]) == expected
    offset, image_data, ended = 8, b'', False
    while offset < len(data):
        length = struct.unpack('>I', data[offset:offset+4])[0]
        kind = data[offset+4:offset+8]
        payload = data[offset+8:offset+8+length]
        crc = struct.unpack('>I', data[offset+8+length:offset+12+length])[0]
        assert zlib.crc32(kind + payload) & 0xffffffff == crc
        if kind == b'IDAT':
            image_data += payload
        if kind == b'IEND':
            ended = True
        offset += 12 + length
    assert ended and offset == len(data)
    assert len(zlib.decompress(image_data)) > expected[0] * expected[1]

portrait = {'editorial', 'signal', 'modular', 'contour', 'spectrum'}
for file in sorted((evidence / 'templates').glob('*.png')):
    png(file.read_bytes(), (1800, 2700) if file.stem in portrait else (2700, 1800))
    results.append({'name': f'{file.name}: PNG chunks, dimensions, CRC and pixel stream', 'status': 'passed'})
assert len(results) == 10
with zipfile.ZipFile(evidence / 'demo-badges.zip') as archive:
    assert archive.testzip() is None
    names = archive.namelist()
    assert len(names) == 12 and len(set(names)) == 12
    for name in names:
        assert Path(name).name == name
        png(archive.read(name), (1800, 2700))
        results.append({'name': f'{name}: ZIP extraction, CRC and complete PNG', 'status': 'passed'})
report = {'passed': len(results), 'failed': 0, 'results': results}
(evidence / 'export-verification.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(f"PASS {len(results)} independent PNG/ZIP integrity checks")
