import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const context = { window: {} };
vm.runInNewContext(await readFile(path.join(root, 'assets/js/content.js'), 'utf8'), context);
const data = context.window.academicContent;
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const authors = paper => paper.authors.map(name => name === data.profile.name ? `<strong>${escape(name)}</strong>` : escape(name)).join(', ');
const categoryNames = { journal: 'Journal', conference: 'Conference', demo: 'Poster / demo', domestic: 'Domestic' };
const awardsFor = id => data.awards.filter(award => award.publicationId === id);
const scholarSearch = title => `https://scholar.google.com/scholar?q=${encodeURIComponent('"' + title + '"')}`;

if (new Set(data.publications.map(paper => paper.id)).size !== data.publications.length) throw new Error('Duplicate publication IDs');
for (const award of data.awards) {
  if (!data.publications.some(paper => paper.id === award.publicationId)) throw new Error(`Unknown award publication: ${award.publicationId}`);
}
await Promise.all(['assets/Jaejun_Park_CV.pdf', 'assets/css/styles.css', 'assets/css/classic.css', 'assets/js/main.js', 'assets/favicon.svg'].map(file => access(path.join(root, file))));

const featured = data.publications.find(paper => paper.id === 'J2');
const selected = data.publications.filter(paper => paper.featured && paper.id !== featured.id);
const publications = [...data.publications].sort((a, b) => b.year - a.year || Object.keys(categoryNames).indexOf(a.category) - Object.keys(categoryNames).indexOf(b.category));
const htmlPublications = publications.map(paper => {
  const awardHTML = awardsFor(paper.id).map(award => `<span class="publication-award">${escape(award.title)} · ${escape(award.venue)}</span>`).join('');
  const note = paper.note || (paper.subtype === 'work-in-progress' ? 'Work-in-Progress' : '');
  const typeLabel = paper.category === 'domestic' && paper.subtype === 'demo' ? 'Domestic demo' : categoryNames[paper.category];
  const searchable = [paper.title, ...paper.authors, paper.venue, paper.venueShort, paper.year, paper.id, note, ...awardsFor(paper.id).map(award => award.title)].join(' ').toLowerCase();
  const paperSearchHTML = paper.category !== 'domestic' ? `<a class="paper-search" href="${escape(scholarSearch(paper.title))}" target="_blank" rel="noopener noreferrer" aria-label="Find ${escape(paper.title)} on Google Scholar">Find on Scholar ↗</a>` : '';
  const footerHTML = awardHTML || paperSearchHTML ? `<div class="publication-footer"><div>${awardHTML}</div>${paperSearchHTML}</div>` : '';
  return `<article class="publication-item" id="pub-${escape(paper.id)}" data-category="${escape(paper.category)}" data-search="${escape(searchable)}"><div><span class="publication-year">${paper.year}</span><span class="publication-type">${escape(typeLabel)}</span></div><div><h3>${escape(paper.title)}</h3><p class="publication-authors">${authors(paper)}</p><p class="publication-venue">${escape(paper.venue)}${note ? ` <span class="publication-note">· ${escape(note)}</span>` : ''}</p>${footerHTML}</div></article>`;
}).join('\n');

const filters = [['all', 'All'], ['journal', 'Journals'], ['conference', 'Conferences'], ['demo', 'Posters & demos'], ['domestic', 'Domestic']].map(([category, label]) => `<button type="button" data-filter="${category}" aria-pressed="${category === 'all'}">${escape(label)} <span>${category === 'all' ? data.publications.length : data.publications.filter(paper => paper.category === category).length}</span></button>`).join('');
const values = {
  NAME: escape(data.profile.name), ROLE: escape(data.profile.role), EMAIL: escape(data.profile.email),
  DEPARTMENT: escape(data.profile.department), INSTITUTION_SHORT: escape(data.profile.institutionShort),
  ADVISOR: escape(data.profile.advisor), SCHOLAR_URL: escape(data.profile.scholarUrl), YEAR: '2026',
  STRUCTURED_DATA: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: data.profile.name, jobTitle: data.profile.role, affiliation: { '@type': 'CollegeOrUniversity', name: data.profile.institution }, email: `mailto:${data.profile.email}`, sameAs: [data.profile.scholarUrl, 'https://github.com/jjpark17'], knowsAbout: data.researchInterests }).replace(/</g, '\\u003c'),
  FEATURED_TITLE: escape(featured.title), FEATURED_AUTHORS: authors(featured),
  SELECTED_WORK: selected.map((paper, index) => `<a class="selected-item" href="#pub-${escape(paper.id)}"><span class="selected-index" aria-hidden="true">0${index + 2}</span><div><h3>${escape(paper.title)}</h3><p>${escape(paper.venueShort)} · ${paper.year}</p></div><span class="selected-arrow" aria-hidden="true">↗</span></a>`).join('\n'),
  PUBLICATION_COUNT: data.publications.length, PUBLICATION_FILTERS: filters, PUBLICATIONS: htmlPublications,
  AWARDS: data.awards.map(award => `<article class="award-item"><span class="award-year">${award.year}</span><div><h3>${escape(award.title)}</h3><p>${escape(award.venue)} <a href="#pub-${escape(award.publicationId)}">Related publication ↗</a></p></div></article>`).join('\n'),
  EDUCATION: data.education.map(item => `<article class="education-item"><p class="education-period">${escape(item.period)}</p><h4>${escape(item.degree)}</h4><p>${escape(item.institution)}</p></article>`).join('\n'),
  PROJECTS: data.projects.map(item => `<article class="project-item"><span class="project-period">${escape(item.period)}</span><div><h4>${escape(item.title)}</h4><p>${escape(item.sponsor)}</p></div></article>`).join('\n')
};
const pageNames = ['index', 'classic'];
const templates = await Promise.all(pageNames.map(name => readFile(path.join(root, `${name}.template.html`), 'utf8')));
const outputs = templates.map(template => template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
  if (!(key in values)) throw new Error(`Unknown template placeholder: ${key}`);
  return values[key];
}));
for (const [index, name] of pageNames.entries()) {
  await writeFile(path.join(root, `${name}.html`), outputs[index], 'utf8');
}
console.log(`Built index.html and classic.html: ${data.publications.length} publications, ${data.awards.length} awards, ${data.projects.length} projects each.`);
