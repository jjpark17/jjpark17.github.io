import { readFile, writeFile, access, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

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
const publicationById = new Map(data.publications.map(paper => [paper.id, paper]));

function renderNewsItem(item) {
  if (typeof item.date !== 'string' || !/^\d{4}$/.test(item.date) || typeof item.text !== 'string' || !item.text.trim()) {
    throw new Error('Invalid news item: expected a year and a short text announcement');
  }
  let textHTML = escape(item.text);
  if (item.publicationId != null) {
    const paper = publicationById.get(item.publicationId);
    if (!paper) throw new Error(`Unknown news publication: ${item.publicationId}`);
    const shortTitle = paper.title.split(':', 1)[0];
    const titleIndex = item.text.indexOf(shortTitle);
    const link = label => `<a href="publications.html#pub-${escape(paper.id)}">${escape(label)}</a>`;
    textHTML = titleIndex < 0
      ? link(item.text)
      : `${escape(item.text.slice(0, titleIndex))}${link(shortTitle)}${escape(item.text.slice(titleIndex + shortTitle.length))}`;
  }
  return `<li class="news-item"><span class="news-date">${escape(item.date)}</span><p>${textHTML}</p></li>`;
}
const htmlNews = data.news.map(renderNewsItem).join('\n');

const versionedAssets = ['assets/css/styles.css', 'assets/js/main.js', 'assets/favicon.svg'];
await Promise.all(['assets/Jaejun_Park_CV.pdf', ...versionedAssets].map(file => access(path.join(root, file))));
const assetHash = createHash('sha256');
for (const file of versionedAssets) {
  const source = await readFile(path.join(root, file), 'utf8');
  assetHash.update(source.replace(/\r\n/g, '\n'));
}
const assetVersion = assetHash.digest('hex').slice(0, 12);

const portraitIcon = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><circle cx="32" cy="22" r="10"/><path d="M13 55c0-12 8-20 19-20s19 8 19 20"/></svg>';
const pictureIcon = '<svg viewBox="0 0 56 44" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="5" width="46" height="34" rx="3"/><circle cx="18" cy="16" r="4"/><path d="m10 34 11-12 8 8 6-6 10 10"/></svg>';

async function imageMarkup(image, kind, defaultAlt) {
  if (image == null) {
    return kind === 'profile'
      ? `<div class="photo-placeholder">${portraitIcon}<span>Photo</span></div>`
      : `<div class="thumbnail-placeholder">${pictureIcon}<span>Paper image</span></div>`;
  }
  if (typeof image !== 'object' || Array.isArray(image) || typeof image.src !== 'string') {
    throw new Error(`Invalid ${kind} image: expected {src, alt} or null`);
  }
  const segments = image.src.split('/');
  if (!image.src.startsWith('assets/images/') || /[\\%?#:\u0000]/.test(image.src) || segments.some(segment => segment === '..' || segment === '.' || segment === '')) {
    throw new Error(`Invalid ${kind} image path: use a local file inside assets/images/ without traversal`);
  }
  const imagePath = path.resolve(root, image.src);
  let canonicalImagePath;
  try {
    canonicalImagePath = await realpath(imagePath);
    if (!(await stat(canonicalImagePath)).isFile()) throw new Error('Not a file');
  } catch {
    throw new Error(`Missing ${kind} image file: ${image.src}`);
  }
  const canonicalImagesRoot = path.join(await realpath(root), 'assets', 'images');
  const relativeImagePath = path.relative(canonicalImagesRoot, canonicalImagePath);
  if (relativeImagePath === '..' || relativeImagePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativeImagePath)) {
    throw new Error(`Invalid ${kind} image: the file must remain inside assets/images/`);
  }
  if (image.alt != null && typeof image.alt !== 'string') {
    throw new Error(`Invalid ${kind} image alt: expected text`);
  }
  const alt = image.alt?.trim() || defaultAlt;
  const imageClass = kind === 'profile' ? 'photo-image' : 'paper-image';
  return `<img class="${imageClass}" src="${escape(image.src)}" alt="${escape(alt)}"${kind === 'profile' ? '' : ' loading="lazy"'} decoding="async">`;
}

const profilePhoto = await imageMarkup(data.profile.image, 'profile', `Portrait of ${data.profile.name}`);
const publications = [...data.publications].sort((a, b) => b.year - a.year || Object.keys(categoryNames).indexOf(a.category) - Object.keys(categoryNames).indexOf(b.category));
const thumbnails = new Map(await Promise.all(publications.map(async paper => [paper.id, await imageMarkup(paper.thumbnail, 'paper', `Representative image of ${paper.title}`)])));

function renderPublication(paper) {
  const awardHTML = awardsFor(paper.id).map(award => `<span class="publication-award">${escape(award.title)} · ${escape(award.venue)}</span>`).join('');
  const note = paper.note || (paper.subtype === 'work-in-progress' ? 'Work-in-Progress' : '');
  const typeLabel = paper.category === 'domestic' && paper.subtype === 'demo' ? 'Domestic demo' : categoryNames[paper.category];
  const searchable = [paper.title, ...paper.authors, paper.venue, paper.venueShort, paper.year, paper.id, note, ...awardsFor(paper.id).map(award => award.title)].join(' ').toLowerCase();
  const paperSearchHTML = paper.category !== 'domestic' ? `<a class="paper-search" href="${escape(scholarSearch(paper.title))}" target="_blank" rel="noopener noreferrer" aria-label="Find ${escape(paper.title)} on Google Scholar">Find on Scholar ↗</a>` : '';
  const footerHTML = awardHTML || paperSearchHTML ? `<div class="publication-footer"><div>${awardHTML}</div>${paperSearchHTML}</div>` : '';
  return `<article class="publication-item" id="pub-${escape(paper.id)}" data-category="${escape(paper.category)}" data-search="${escape(searchable)}"><div class="publication-image"><div class="paper-thumbnail">${thumbnails.get(paper.id)}</div></div><div class="publication-meta"><span class="publication-year">${paper.year}</span><span class="publication-type">${escape(typeLabel)}</span></div><div class="publication-copy"><h3>${escape(paper.title)}</h3><p class="publication-authors">${authors(paper)}</p><p class="publication-venue">${escape(paper.venue)}${note ? ` <span class="publication-note">· ${escape(note)}</span>` : ''}</p>${footerHTML}</div></article>`;
}
const htmlPublicationsWithImages = publications.map(renderPublication).join('\n');

const filters = [['all', 'All'], ['journal', 'Journals'], ['conference', 'Conferences'], ['demo', 'Posters & demos'], ['domestic', 'Domestic']].map(([category, label]) => `<button type="button" data-filter="${category}" aria-pressed="${category === 'all'}">${escape(label)} <span>${category === 'all' ? data.publications.length : data.publications.filter(paper => paper.category === category).length}</span></button>`).join('');
const values = {
  ASSET_VERSION: assetVersion,
  PROFILE_PHOTO: profilePhoto,
  HOME_NEWS: htmlNews,
  NAME: escape(data.profile.name), ROLE: escape(data.profile.role), EMAIL: escape(data.profile.email),
  DEPARTMENT: escape(data.profile.department), INSTITUTION: escape(data.profile.institution),
  ADVISOR: escape(data.profile.advisor), SCHOLAR_URL: escape(data.profile.scholarUrl), YEAR: '2026',
  STRUCTURED_DATA: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person', name: data.profile.name, jobTitle: data.profile.role, affiliation: { '@type': 'CollegeOrUniversity', name: data.profile.institution }, email: `mailto:${data.profile.email}`, sameAs: [data.profile.scholarUrl, 'https://github.com/jjpark17'], knowsAbout: data.researchInterests }).replace(/</g, '\\u003c'),
  PUBLICATION_COUNT: data.publications.length, PUBLICATION_FILTERS: filters,
  PUBLICATIONS_WITH_IMAGES: htmlPublicationsWithImages
};
const pageNames = ['index', 'publications'];
const templates = await Promise.all(pageNames.map(name => readFile(path.join(root, `${name}.template.html`), 'utf8')));
const outputs = templates.map(template => template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
  if (!(key in values)) throw new Error(`Unknown template placeholder: ${key}`);
  return values[key];
}));
for (const [index, name] of pageNames.entries()) {
  await writeFile(path.join(root, `${name}.html`), outputs[index], 'utf8');
}
console.log(`Built ${pageNames.map(name => `${name}.html`).join(', ')} with shared profile data and ${data.publications.length} publication records.`);
