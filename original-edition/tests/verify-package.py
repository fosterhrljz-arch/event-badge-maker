"""Verify a ZIP against source without extracting or executing its contents."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import sys
import zipfile

root = Path(__file__).resolve().parents[1]
archive = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root.with_suffix('.zip')
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None, 'ZIP integrity check failed'
    files = [name for name in z.namelist() if not name.endswith('/')]
    assert len(files) == len(set(files)), 'Duplicate archive entries'
    assert all(not PurePosixPath(name).is_absolute() and '..' not in PurePosixPath(name).parts for name in files), 'Unsafe archive path'
    expected = {root.name + '/' + p.relative_to(root).as_posix(): p for p in root.rglob('*') if p.is_file() and '__pycache__' not in p.parts}
    assert set(files) == set(expected), 'Archive and source file lists differ'
    for name, source in expected.items():
        assert hashlib.sha256(z.read(name)).digest() == hashlib.sha256(source.read_bytes()).digest(), 'Content mismatch: ' + name
    for filename in ['index.html', 'styles.css', 'app.js', 'core.js', 'icon.svg', 'README.md', 'TEST_RESULTS.md', 'sample-attendees.csv']:
        assert root.name + '/' + filename in files, 'Missing required file: ' + filename
result = {'archive': archive.name, 'status': 'PASS', 'files': len(files), 'bytes': archive.stat().st_size, 'sha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'checks': ['ZIP CRC integrity', 'Safe relative paths', 'No duplicate entries', 'Exact source file list', 'SHA-256 match for every file', 'Required app, demo and documentation files']}
print(json.dumps(result, indent=2))
