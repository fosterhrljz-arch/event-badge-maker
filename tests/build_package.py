"""Build a complete review ZIP and verify every archived file against its manifest."""
import hashlib
import json
import zipfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
archive_path = root.parent / (root.name + '.zip')
excluded = {'node_modules', '.git', '__pycache__', '.cache'}
files = sorted(p for p in root.rglob('*') if p.is_file() and not excluded.intersection(p.relative_to(root).parts) and p.name != 'MANIFEST.sha256')
manifest = ''.join(hashlib.sha256(p.read_bytes()).hexdigest() + '  ' + p.relative_to(root).as_posix() + '\n' for p in files)
(root / 'MANIFEST.sha256').write_text(manifest, encoding='utf-8')
files.append(root / 'MANIFEST.sha256')
with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for file in files:
        archive.write(file, root.name + '/' + file.relative_to(root).as_posix())
with zipfile.ZipFile(archive_path) as archive:
    assert archive.testzip() is None
    for line in manifest.splitlines():
        expected, name = line.split('  ', 1)
        assert hashlib.sha256(archive.read(root.name + '/' + name)).hexdigest() == expected
    assert len(archive.namelist()) == len(files)
    for name in ['index.html', 'app.js', 'core.js', 'model.js', 'renderer.js', 'zip.js', 'styles.css', 'icon.svg', 'README.md', 'RESEARCH.md', 'TEST_RESULTS.md', 'sample-attendees.csv']:
        assert root.name + '/' + name in archive.namelist()
digest = hashlib.sha256(archive_path.read_bytes()).hexdigest()
archive_path.with_suffix('.zip.sha256').write_text(digest + '  ' + archive_path.name + '\n', encoding='utf-8')
report = {'archive': archive_path.name, 'bytes': archive_path.stat().st_size, 'files': len(files), 'sha256': digest, 'zip_crc': 'passed', 'manifest_hashes': 'passed', 'required_files': 'passed'}
archive_path.with_suffix('.zip.verification.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
