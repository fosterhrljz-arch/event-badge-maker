"""Read generated browser PDFs and validate page geometry and text completeness."""
from pathlib import Path
import csv
import io
import json
import re
import sys
from datetime import datetime, timezone
from pypdf import PdfReader
import pymupdf

root = Path(__file__).resolve().parents[1]
evidence = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root / 'evidence'
results = []


def check(name, condition, detail=None):
    results.append({'name': name, 'status': 'PASS' if condition else 'FAIL', 'detail': detail})
    print(('PASS: ' if condition else 'FAIL: ') + name)


def inspect(filename, expected_pages):
    reader = PdfReader(evidence / filename)
    check(filename + ': page count', len(reader.pages) == expected_pages, len(reader.pages))
    sizes = [(round(float(p.mediabox.width), 2), round(float(p.mediabox.height), 2)) for p in reader.pages]
    check(filename + ': every page is A4 portrait', all(abs(w - 595.28) < 1 and abs(h - 841.89) < 1 for w, h in sizes), sizes)
    doc = pymupdf.open(evidence / filename)
    outside = []
    for page in doc:
        for word in page.get_text('words'):
            x0, y0, x1, y1 = word[:4]
            if x0 < 33 or y0 < 33 or x1 > page.rect.width - 33 or y1 > page.rect.height - 33:
                outside.append(word[4])
    check(filename + ': text respects page margins', not outside, outside)
    return reader, [' '.join(page.extract_text().split()) for page in reader.pages]


demo = list(csv.DictReader(io.StringIO((root / 'sample-attendees.csv').read_text(encoding='utf-8'))))
for style in ['minimal', 'conference', 'creative']:
    reader, texts = inspect(style + '-demo.pdf', 2)
    for index, text in enumerate(texts):
        expected = demo[index * 6:(index + 1) * 6]
        others = demo[(1 - index) * 6:(2 - index) * 6]
        check(f'{style}: page {index + 1} has exactly its six attendee names', all(text.count(p['name']) == 1 for p in expected) and all(p['name'] not in text for p in others))
        check(f'{style}: page {index + 1} includes organizations and roles', all(p['organization'] in text and p['role'].lower() in text.lower() for p in expected))
        check(f'{style}: page {index + 1} has no editor controls', 'Print / Save PDF' not in text and 'Import CSV' not in text and 'Good names.' not in text)

for count in [1, 6, 7, 12, 13]:
    reader, texts = inspect(f'pagination-{count}.pdf', (count + 5) // 6)
    observed = [int(value) for text in texts for value in re.findall(r'Person\s+(\d+)', text)]
    check(f'{count} attendees: every name appears once in source order', observed == list(range(1, count + 1)), observed)
    check(f'{count} attendees: no name crosses a page break', all(len(re.findall(r'Person\s+\d+', text)) == min(6, count - i * 6) for i, text in enumerate(texts)))

inspect('seven-attendees.pdf', 2)
for style in ['minimal', 'conference', 'creative']:
    reader, texts = inspect(f'long-{style}.pdf', 1)
    compact = re.sub(r'\s+', '', texts[0])
    for letter, count, field in [('E', 100, 'event'), ('N', 120, 'name'), ('O', 160, 'organization'), ('R', 80, 'role')]:
        check(f'long {style}: full {field} is present', letter * count in compact)

reader, texts = inspect('invalid-input.pdf', 1)
check('Invalid input prints a diagnostic instead of stale badges', 'No badges to print.' in texts[0] and all(p['name'] not in texts[0] for p in demo))

report = {'timestamp': datetime.now(timezone.utc).isoformat(), 'passed': sum(r['status'] == 'PASS' for r in results), 'failed': sum(r['status'] == 'FAIL' for r in results), 'results': results}
(evidence / 'pdf-results.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
raise SystemExit(1 if report['failed'] else 0)
