(function () {
  'use strict';
  const { DEMO_CSV, LIMITS, parseAttendees, paginate } = window.BadgeCore;
  const byId = id => document.getElementById(id);
  const ui = {
    event: byId('event-name'), csv: byId('attendee-csv'), file: byId('csv-file'), status: byId('csv-status'),
    eventError: byId('event-error'), importError: byId('import-error'), sheets: byId('sheets'),
    window: byId('sheet-window'), count: byId('preview-count'), print: byId('print-button'),
    empty: byId('empty-state'), emptyTitle: byId('empty-title'), emptyCopy: byId('empty-copy'),
    previous: byId('previous-page'), next: byId('next-page'), label: byId('page-label'), fit: byId('fit-note')
  };
  let activePage = 0, pageCount = 0, timer = 0, fileVersion = 0, fitFailure = false;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function textSlot(className, textClass, text, min, max) {
    const slot = element('div', className);
    const value = element('div', textClass, text);
    value.dir = 'auto';
    value.dataset.min = String(min);
    value.dataset.max = String(max);
    slot.append(value);
    return slot;
  }
  function makeBadge(person, eventName, design) {
    const badge = element('article', `badge badge--${design}`);
    badge.setAttribute('aria-label', `${person.name}, ${person.organization}, ${person.role}`);
    const inner = element('div', 'badge-inner');
    const event = textSlot('event-slot', 'event-text', eventName, 10, design === 'minimal' ? 12 : 15);
    const body = element('div', 'badge-body');
    body.append(textSlot('name-slot', 'badge-name', person.name, 12, design === 'creative' ? 38 : 35));
    body.append(textSlot('org-slot', 'badge-org', person.organization, 10, 17));
    inner.append(event, body, textSlot('role-slot', 'badge-role', person.role, 10, 17));
    badge.append(inner);
    return badge;
  }
  function fitText() {
    let small = false;
    fitFailure = false;
    // Measure unscaled layout boxes so preview zoom never changes printed type sizes.
    ui.sheets.querySelectorAll('[data-max]').forEach(node => {
      const slot = node.parentElement;
      const style = getComputedStyle(slot);
      const height = slot.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
      let low = Number(node.dataset.min), high = Number(node.dataset.max), best = low;
      const fits = size => {
        node.style.fontSize = `${size}px`;
        return node.scrollHeight <= height + 0.5 && node.scrollWidth <= node.clientWidth + 0.5;
      };
      if (fits(high)) best = high;
      else for (let i = 0; i < 9; i++) {
        const middle = (low + high) / 2;
        if (fits(middle)) { best = middle; low = middle; } else high = middle;
      }
      const size = Math.floor(best * 10) / 10;
      if (!fits(size)) fitFailure = true;
      if (node.classList.contains('badge-name') && size < 22) small = true;
      if (!node.classList.contains('badge-name') && node.textContent && size < 11) small = true;
    });
    ui.fit.hidden = !small;
    if (fitFailure) {
      ui.status.textContent = 'Some text does not fit. Shorten the event name or attendee details before printing.';
      ui.status.classList.add('is-error');
      setPrintReady(false);
    }
  }
  function setPrintReady(ready) {
    ui.print.disabled = !ready;
    document.body.dataset.printReady = String(ready);
  }
  function showPage() {
    activePage = Math.max(0, Math.min(activePage, pageCount - 1));
    Array.from(ui.sheets.children).forEach((sheet, i) => {
      const active = i === activePage;
      sheet.classList.toggle('is-active', active);
      sheet.setAttribute('aria-hidden', String(!active));
    });
    ui.previous.disabled = activePage <= 0;
    ui.next.disabled = activePage >= pageCount - 1;
    ui.label.textContent = pageCount ? `Page ${activePage + 1} of ${pageCount}` : 'No pages';
  }
  function scalePreview() {
    const width = ui.window.clientWidth;
    if (!width) return;
    const scale = width / (210 * 96 / 25.4);
    ui.window.style.setProperty('--preview-scale', String(scale));
    ui.window.style.height = `${297 * 96 / 25.4 * scale}px`;
  }
  function render() {
    clearTimeout(timer);
    const eventName = ui.event.value.trim();
    const eventValid = !!eventName && Array.from(eventName).length <= LIMITS.event;
    ui.eventError.textContent = !eventName ? 'Enter an event name to print your badges.' : 'Use an event name of 100 characters or fewer.';
    ui.eventError.hidden = eventValid;
    ui.event.setAttribute('aria-invalid', String(!eventValid));
    const result = parseAttendees(ui.csv.value);
    const count = result.attendees.length;
    ui.csv.setAttribute('aria-invalid', String(!!result.error));
    ui.status.classList.toggle('is-error', !!result.error);
    ui.status.textContent = result.error || (count ? `${count.toLocaleString('en-US')} attendee${count === 1 ? '' : 's'} ready` : 'No attendees yet. Paste a list or load the demo.');
    const design = document.querySelector('input[name=design]:checked').value;
    const pages = paginate(result.attendees);
    pageCount = pages.length;
    const fragment = document.createDocumentFragment();
    pages.forEach((attendees, index) => {
      const sheet = element('section', 'sheet');
      sheet.setAttribute('aria-label', `Badge sheet ${index + 1}`);
      const grid = element('div', 'badge-grid');
      attendees.forEach(person => grid.append(makeBadge(person, eventName || 'Your event', design)));
      const footer = element('div', 'sheet-footer');
      footer.append(element('span', '', '90 × 80 mm · Cut along dotted outlines'), element('span', '', `Page ${index + 1} of ${pages.length}`));
      sheet.append(grid, footer);
      fragment.append(sheet);
    });
    ui.sheets.replaceChildren(fragment);
    ui.count.textContent = `${count.toLocaleString('en-US')} badge${count === 1 ? '' : 's'} · ${pageCount} page${pageCount === 1 ? '' : 's'}`;
    ui.window.hidden = !count;
    ui.empty.hidden = !!count;
    ui.emptyTitle.textContent = result.error ? 'Check your attendee list' : 'Add your attendees';
    ui.emptyCopy.textContent = result.error ? 'Fix the CSV error in the editor. Your preview will update automatically.' : 'Paste a CSV list or import a file to see your badges here.';
    setPrintReady(eventValid && count > 0 && !result.error);
    showPage();
    scalePreview();
    fitText();
  }
  function scheduleRender() {
    fileVersion++;
    ui.importError.hidden = true;
    setPrintReady(false);
    clearTimeout(timer);
    timer = setTimeout(render, 160);
  }
  ui.event.addEventListener('input', scheduleRender);
  ui.csv.addEventListener('input', scheduleRender);
  document.querySelectorAll('input[name=design]').forEach(input => input.addEventListener('change', render));
  byId('demo-button').addEventListener('click', () => {
    fileVersion++;
    ui.csv.value = DEMO_CSV;
    ui.importError.hidden = true;
    activePage = 0;
    render();
  });
  byId('import-button').addEventListener('click', () => ui.file.click());
  ui.file.addEventListener('change', async () => {
    const file = ui.file.files[0];
    if (!file) return;
    const version = ++fileVersion;
    ui.importError.hidden = true;
    try {
      if (file.size > LIMITS.input) throw new Error('That file is too large. Choose a CSV file under 1 MB.');
      const text = await file.text();
      if (version !== fileVersion) return;
      ui.csv.value = text;
      activePage = 0;
      render();
    } catch (error) {
      if (version !== fileVersion) return;
      ui.importError.textContent = `Import failed: ${error.message} Your current list has been kept.`;
      ui.importError.hidden = false;
    } finally { ui.file.value = ''; }
  });
  ui.previous.addEventListener('click', () => { activePage--; showPage(); });
  ui.next.addEventListener('click', () => { activePage++; showPage(); });
  ui.print.addEventListener('click', () => {
    render();
    if (!ui.print.disabled) window.print();
  });
  // Refresh synchronously for both the app button and the browser's own print command.
  window.addEventListener('beforeprint', render);
  window.addEventListener('afterprint', scalePreview);
  if ('ResizeObserver' in window) new ResizeObserver(scalePreview).observe(ui.window);
  else window.addEventListener('resize', scalePreview);
  ui.csv.value = DEMO_CSV;
  render();
}());
