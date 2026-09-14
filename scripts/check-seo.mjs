import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { parse } from 'parse5';
import config from '../astro.config.mjs';

const dist = resolve('dist');
const base = `${config.base.replace(/\/$/, '')}/`;
const origin = new URL(config.site).origin;
const absolute = (file) => new URL(`${base}${file}`, origin).href;
const attrs = (node) => Object.fromEntries((node.attrs ?? []).map(({ name, value }) => [name, value]));
const flatten = (node) => [node, ...(node.childNodes ?? []).flatMap(flatten)];
const content = (node) => node.nodeName === '#text' ? node.value : (node.childNodes ?? []).map(content).join('');
const files = (await readdir(dist, { recursive: true })).filter((file) => file.endsWith('.html')).sort();
assert(files.length > 0, 'Build the site before checking SEO.');
const pages = new Map();
const titles = new Set();
const descriptions = new Set();
const resources = new Set();
const single = (nodes, predicate, label) => {
  const found = nodes.filter(predicate);
  assert.equal(found.length, 1, label);
  return found[0];
};

for (const file of files) {
  const html = await readFile(resolve(dist, file), 'utf8');
  const nodes = flatten(parse(html));
  const elements = (tag) => nodes.filter((node) => node.tagName === tag);
  const meta = (name) => attrs(single(nodes, (node) => node.tagName === 'meta' &&
    (attrs(node).name === name || attrs(node).property === name), `${file}: one ${name} tag`)).content;
  const title = content(single(nodes, (node) => node.tagName === 'title', `${file}: one title`)).trim();
  const description = meta('description').trim();
  assert(title && !titles.has(title), `${file}: meaningful unique title`);
  assert(description && !descriptions.has(description), `${file}: meaningful unique description`);
  titles.add(title); descriptions.add(description);
  const canonical = attrs(single(nodes, (node) => node.tagName === 'link' && attrs(node).rel === 'canonical', `${file}: one canonical`)).href;
  assert.equal(canonical, absolute(file.split(sep).join('/')), `${file}: canonical matches deployed file`);
  assert.equal(meta('og:url'), canonical);
  assert.equal(meta('og:title'), title);
  assert.equal(meta('og:description'), description);
  assert.equal(meta('twitter:title'), title);
  assert.equal(meta('twitter:description'), description);
  assert.equal(meta('twitter:image'), meta('og:image'));
  assert(!/noindex|nofollow/i.test(meta('robots')), `${file}: indexable robots directive`);
  assert(attrs(elements('html')[0]).lang, `${file}: document language`);
  assert.equal(elements('h1').length, 1, `${file}: one primary heading`);
  assert(content(elements('h1')[0]).trim(), `${file}: nonempty primary heading`);
  const ids = nodes.map((node) => attrs(node).id).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length, `${file}: unique element IDs`);
  const data = elements('script').filter((node) => attrs(node).type === 'application/ld+json').map((node) => JSON.parse(content(node)));
  assert(data.some((item) => item['@type'] === 'WebPage' && item.url === canonical), `${file}: matching WebPage data`);
  for (const item of data) {
    assert.equal(item['@context'], 'https://schema.org');
    if (item['@type'] === 'BreadcrumbList') {
      assert.equal(item.itemListElement.at(-1).item, canonical);
      item.itemListElement.forEach((crumb, index) => assert.equal(crumb.position, index + 1));
    }
  }
  for (const image of elements('img')) {
    const a = attrs(image);
    assert('alt' in a, `${file}: image alt attribute`);
    assert(Number(a.width) > 0 && Number(a.height) > 0, `${file}: reserved image dimensions`);
  }
  const links = elements('a').map((node) => attrs(node).href).filter(Boolean);
  const assetUrls = nodes.flatMap((node) => {
    const a = attrs(node);
    return [a.src, a.poster, ...(a.srcset ?? '').split(',').map((candidate) => candidate.trim().split(/\s+/)[0]),
      ...(node.tagName === 'link' && ['icon', 'stylesheet', 'preload'].includes(a.rel) ? [a.href] : [])].filter(Boolean);
  });
  assetUrls.push(meta('og:image'));
  const verification = Object.fromEntries(elements('meta')
    .map(attrs).filter((a) => ['google-site-verification', 'msvalidate.01'].includes(a.name))
    .map((a) => [a.name, a.content]));
  if (file === 'index.html') {
    assert(verification['google-site-verification'], 'Keep Google ownership verification.');
    assert(verification['msvalidate.01'], 'Keep Bing ownership verification.');
  }
  pages.set(file.split(sep).join('/'), { canonical, title, description, links, ids, data, verification });
  for (const href of [...links, ...assetUrls]) {
    const target = new URL(href, canonical);
    if (target.origin !== origin) continue;
    assert(target.pathname.startsWith(base), `${file}: unexpected same-domain link outside ImageSage: ${href}`);
    const localPath = decodeURIComponent(target.pathname.slice(base.length)) || 'index.html';
    const disk = resolve(dist, localPath);
    assert(!relative(dist, disk).startsWith('..'), 'Resource stays inside dist.');
    await access(disk).catch(() => assert.fail(`${file}: missing local destination ${href}`));
    resources.add(target.href.split('#')[0]);
  }
}

const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8');
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
assert.equal(new Set(locations).size, locations.length, 'No duplicate sitemap URLs.');
assert.deepEqual([...locations].sort(), [...pages.values()].map((page) => page.canonical).sort(), 'Sitemap covers all canonical pages.');
for (const [file, page] of pages) {
  for (const href of page.links) {
    const target = new URL(href, page.canonical);
    const destination = pages.get(target.pathname.slice(base.length));
    if (target.origin === origin && destination && target.hash) {
      assert(destination.ids.includes(decodeURIComponent(target.hash.slice(1))), `${file}: missing anchor ${href}`);
    }
  }
}
const reached = new Set();
function crawl(file) {
  if (reached.has(file) || !pages.has(file)) return;
  reached.add(file);
  for (const href of pages.get(file).links) {
    const target = new URL(href, absolute(file));
    if (target.origin === origin && target.pathname.startsWith(base)) crawl(target.pathname.slice(base.length));
  }
}
crawl('index.html');
assert.equal(reached.size, pages.size, 'Every page is reachable through homepage links.');
for (const required of ['privacy.html', 'support.html', 'license.html', 'ai-transparency.html']) assert(pages.has(required), `Preserve ${required}.`);
assert((await readFile(resolve(dist, 'index.html'), 'utf8')).includes('window-mode="direct"'), 'Preserve the Store direct-install badge.');

if (process.argv.includes('--live')) {
  for (const [file, page] of pages) {
    const response = await fetch(page.canonical, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
    assert.equal(response.status, 200, `${file}: live status`);
    assert(!response.headers.get('x-robots-tag')?.includes('noindex'), `${file}: live X-Robots-Tag`);
    const nodes = flatten(parse(await response.text()));
    const title = nodes.find((node) => node.tagName === 'title');
    assert.equal(content(title), page.title, `${file}: live deployment title`);
    const canonical = nodes.find((node) => node.tagName === 'link' && attrs(node).rel === 'canonical');
    assert.equal(attrs(canonical).href, page.canonical, `${file}: live canonical`);
    const metadata = nodes.filter((node) => node.tagName === 'meta').map(attrs);
    assert.equal(metadata.find((a) => a.name === 'description')?.content, page.description, `${file}: live description`);
    for (const [name, value] of Object.entries(page.verification)) {
      assert.equal(metadata.find((a) => a.name === name)?.content, value, `${file}: live ${name}`);
    }
    const data = nodes.filter((node) => node.tagName === 'script' && attrs(node).type === 'application/ld+json')
      .map((node) => JSON.parse(content(node)));
    assert.deepEqual(data, page.data, `${file}: live structured data`);
  }
  const liveMap = await fetch(absolute('sitemap.xml'), { signal: AbortSignal.timeout(20000), cache: 'no-store' });
  assert.equal(liveMap.status, 200);
  assert.equal((await liveMap.text()).trim(), sitemap.trim(), 'Live sitemap matches build.');
  for (const resource of resources) {
    const response = await fetch(resource, { method: 'HEAD', signal: AbortSignal.timeout(20000) });
    assert.equal(response.status, 200, `Live destination: ${resource}`);
  }
  const robots = await fetch(`${origin}/robots.txt`, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
  assert.equal(robots.status, 200);
  assert((await robots.text()).includes(`Sitemap: ${absolute('sitemap.xml')}`), 'Domain-root robots.txt discovers ImageSage sitemap.');
}
console.log(`SEO checks passed: ${pages.size} pages, complete sitemap, unique metadata, structured data, crawlable links and local assets${process.argv.includes('--live') ? ', plus live deployment' : ''}.`);
