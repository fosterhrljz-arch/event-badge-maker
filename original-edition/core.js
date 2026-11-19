(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.BadgeCore = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const LIMITS = Object.freeze({ attendees: 1000, input: 1000000, name: 120, organization: 160, role: 80, event: 100 });
  const DEMO_CSV = `name,organization,role
Avery Morgan,Northstar Studio,Speaker
Jordan Lee,Fieldwork,Attendee
Priya Shah,Brightside Labs,Organizer
Mateo Rivera,Common Ground,Speaker
Camille Laurent,Atelier Nine,Attendee
Noah Park,Open Field,Volunteer
Amara Okafor,Kindred Works,Speaker
Elliot Chen,Paperplane,Attendee
Sofia Andersson,Tomorrow House,Organizer
Theo Williams,Studio Juniper,Volunteer
Isla Bennett,Good Company,Attendee
Rafael Costa,New Chapter,Attendee`;

  function readCSV(source) {
    if (typeof source !== 'string') throw new Error('CSV must be text.');
    if (source.length > LIMITS.input) throw new Error('This CSV is too large. Use a file under 1 MB.');
    const text = source.replace(/^\uFEFF/, '');
    const rows = [];
    let row = [], cell = '', mode = 'plain', line = 1, rowLine = 1;
    const endCell = () => { row.push(cell.trim()); cell = ''; mode = 'plain'; };
    const endRow = () => {
      endCell();
      if (row.some(value => value !== '')) rows.push({ values: row, line: rowLine });
      row = [];
    };
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (mode === 'quoted') {
        if (c === '"') {
          if (text[i + 1] === '"') { cell += '"'; i++; }
          else mode = 'closed';
        } else if (c === '\r' || c === '\n') {
          if (c === '\r' && text[i + 1] === '\n') i++;
          cell += '\n'; line++;
        } else cell += c;
        continue;
      }
      if (c === ',') { endCell(); continue; }
      if (c === '\r' || c === '\n') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        endRow(); line++; rowLine = line; continue;
      }
      if (mode === 'closed') {
        if (c !== ' ' && c !== '\t') throw new Error(`Line ${line}: unexpected text after a closing quote.`);
        continue;
      }
      if (c === '"') {
        if (cell.trim() !== '') throw new Error(`Line ${line}: put quotes around the entire value.`);
        cell = ''; mode = 'quoted';
      } else cell += c;
    }
    if (mode === 'quoted') throw new Error(`Line ${rowLine}: a quoted value is missing its closing quote.`);
    endRow();
    return rows;
  }

  function parseAttendees(source) {
    try {
      const rows = readCSV(source);
      if (!rows.length) return { attendees: [], error: null };
      const normalize = value => value.toLowerCase().trim().replace(/^organisation$/, 'organization');
      const headers = rows[0].values.map(normalize);
      if (new Set(headers).size !== headers.length) throw new Error('The header row has duplicate column names. Use each column once.');
      const columns = ['name', 'organization', 'role'];
      const missing = columns.filter(column => !headers.includes(column));
      if (missing.length) throw new Error(`Missing CSV header${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. Start with name,organization,role.`);
      if (rows.length - 1 > LIMITS.attendees) throw new Error(`Use no more than ${LIMITS.attendees.toLocaleString('en-US')} attendees at a time.`);
      const attendees = rows.slice(1).map(row => {
        if (row.values.length !== headers.length) throw new Error(`Line ${row.line}: expected ${headers.length} columns, found ${row.values.length}. Put quotes around values containing commas.`);
        const person = {};
        for (const column of columns) {
          const value = row.values[headers.indexOf(column)].replace(/\s+/gu, ' ').trim();
          if (Array.from(value).length > LIMITS[column]) throw new Error(`Line ${row.line}: ${column} exceeds ${LIMITS[column]} characters. Shorten it before printing.`);
          if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(value)) throw new Error(`Line ${row.line}: ${column} contains an unsupported control character.`);
          person[column] = value;
        }
        if (!person.name) throw new Error(`Line ${row.line}: every attendee needs a name.`);
        person.role = person.role || 'Attendee';
        return person;
      });
      return { attendees, error: null };
    } catch (error) { return { attendees: [], error: error.message }; }
  }

  function paginate(items, perPage = 6) {
    if (!Number.isInteger(perPage) || perPage < 1) throw new Error('Page size must be a positive integer.');
    const pages = [];
    for (let i = 0; i < items.length; i += perPage) pages.push(items.slice(i, i + perPage));
    return pages;
  }
  return Object.freeze({ LIMITS, DEMO_CSV, readCSV, parseAttendees, paginate });
}));
