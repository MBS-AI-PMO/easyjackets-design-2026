// helpers/seoAudit.js
// SEO audit engine. Pure functions — no DB access, no I/O — so the same rules can be
// reused by the audit endpoint, a batch run, or a future scheduled job.
//
// Every check returns the same shape:
//   { id, group, label, weight, earned, status, value, message, fix }
// `weight` is the maximum points the check can contribute, `earned` what it actually
// scored. The page score is round(100 * sum(earned) / sum(weight)), so adding or
// removing a check reweights the total automatically.

export const TITLE_MIN = 30;
export const TITLE_MAX = 60;
export const DESC_MIN = 70;
export const DESC_MAX = 160;
export const BRAND_SUFFIX = 'Easy Jackets';

const STATUS = {
  PASS: 'pass',
  WARN: 'warn',
  FAIL: 'fail',
  INFO: 'info',
};

const CHECK_GROUPS = [
  { id: 'meta', label: 'Meta tags' },
  { id: 'content', label: 'Content & keywords' },
  { id: 'url', label: 'URL structure' },
  { id: 'indexing', label: 'Indexing & sitemap' },
  { id: 'social', label: 'Social sharing' },
  { id: 'uniqueness', label: 'Duplicate content' },
];

const clean = (value) => String(value ?? '').trim();
const collapse = (value) => clean(value).replace(/\s+/g, ' ');
const lower = (value) => clean(value).toLowerCase();

const wordsOf = (value) =>
  lower(value)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(Boolean);

const keywordList = (keywords) =>
  clean(keywords)
    .split(',')
    .map((item) => collapse(item).toLowerCase())
    .filter(Boolean);

// Words that carry no ranking signal — ignored when matching a keyword to the title.
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'how', 'in',
  'is', 'it', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'what', 'when',
  'where', 'who', 'will', 'with', 'your', 'you',
]);

const significantWords = (value) => wordsOf(value).filter((word) => !STOP_WORDS.has(word) && word.length > 2);

/**
 * Crudest possible stemmer, and deliberately so.
 *
 * Keywords are naturally plural ("varsity jackets") while titles are naturally
 * singular ("Red Satin Bomber Jacket"). Without this, every product page failed
 * "keyword in title" on nothing but the trailing s — a false negative on the
 * single heaviest content check. Only the needle is stemmed, never the haystack,
 * so a shortened stem still matches the longer word by substring.
 */
// Returns every plausible singular, because no single rule covers English. A
// "-ies -> y" rule alone turns "hoodies" into "hoody" and then fails to match
// "Hoodie"; a bare "-s" rule alone turns "boxes" into "boxe". Generating all the
// candidates and accepting any match costs nothing and avoids both.
const stemCandidates = (word) => {
  const out = [word];
  if (word.length > 3 && word.endsWith('s') && !word.endsWith('ss')) out.push(word.slice(0, -1));
  if (word.length > 4 && word.endsWith('es')) out.push(word.slice(0, -2));
  if (word.length > 4 && word.endsWith('ies')) out.push(`${word.slice(0, -3)}y`);
  return out;
};

/** True when every significant word of `keyword` appears somewhere in `haystack`. */
const keywordAppearsIn = (keyword, haystack) => {
  const target = lower(haystack);
  const parts = significantWords(keyword);
  if (!parts.length) return false;
  return parts.every((part) => stemCandidates(part).some((candidate) => target.includes(candidate)));
};

const check = ({ id, group, label, weight, earned, status, value = '', message, fix = '' }) => ({
  id,
  group,
  label,
  weight,
  earned: Math.max(0, Math.min(weight, earned)),
  status,
  value,
  message,
  fix,
});

// ── Individual checks ────────────────────────────────────────────────────────

const checkTitlePresent = (title) => {
  const text = collapse(title);
  if (!text) {
    return check({
      id: 'title-present', group: 'meta', label: 'Meta title', weight: 12, earned: 0,
      status: STATUS.FAIL, value: '—',
      message: 'This page has no meta title. Search engines will invent one from the page content, and it is the single strongest on-page ranking signal.',
      fix: `Add a title of ${TITLE_MIN}–${TITLE_MAX} characters that leads with the page's main keyword.`,
    });
  }
  return check({
    id: 'title-present', group: 'meta', label: 'Meta title', weight: 12, earned: 12,
    status: STATUS.PASS, value: text,
    message: 'A meta title is set.',
  });
};

const checkTitleLength = (title) => {
  const text = collapse(title);
  const len = text.length;

  if (!len) {
    return check({
      id: 'title-length', group: 'meta', label: 'Title length', weight: 8, earned: 0,
      status: STATUS.FAIL, value: '0 characters',
      message: 'Title length cannot be evaluated because there is no title.',
      fix: `Write a title between ${TITLE_MIN} and ${TITLE_MAX} characters.`,
    });
  }
  if (len < TITLE_MIN) {
    return check({
      id: 'title-length', group: 'meta', label: 'Title length', weight: 8, earned: 3,
      status: STATUS.WARN, value: `${len} characters`,
      message: `The title is short (${len} characters). Short titles waste space in the search result and usually leave out qualifying keywords.`,
      fix: `Expand to ${TITLE_MIN}–${TITLE_MAX} characters — add the product type, audience, or a differentiator.`,
    });
  }
  if (len > TITLE_MAX) {
    return check({
      id: 'title-length', group: 'meta', label: 'Title length', weight: 8, earned: 3,
      status: STATUS.WARN, value: `${len} characters`,
      message: `The title is ${len} characters and will be truncated in search results at roughly ${TITLE_MAX}.`,
      fix: `Trim to ${TITLE_MAX} characters or fewer, keeping the most important words first.`,
    });
  }
  return check({
    id: 'title-length', group: 'meta', label: 'Title length', weight: 8, earned: 8,
    status: STATUS.PASS, value: `${len} characters`,
    message: `Title length is in the ideal ${TITLE_MIN}–${TITLE_MAX} character range.`,
  });
};

const checkTitleBrand = (title) => {
  const text = collapse(title);
  if (!text) {
    return check({
      id: 'title-brand', group: 'meta', label: 'Brand in title', weight: 3, earned: 0,
      status: STATUS.FAIL, value: '—',
      message: 'No title, so the brand cannot appear in it.',
      fix: `Add a title. The site appends " | ${BRAND_SUFFIX}" automatically, so do not repeat the brand yourself.`,
    });
  }
  // The storefront's <SEO> component always appends " | Easy Jackets"; repeating the
  // brand inside the title itself duplicates it in the rendered <title>.
  if (keywordAppearsIn(BRAND_SUFFIX, text)) {
    return check({
      id: 'title-brand', group: 'meta', label: 'Brand in title', weight: 3, earned: 1,
      status: STATUS.WARN, value: text,
      message: `The title already contains "${BRAND_SUFFIX}", but the site appends " | ${BRAND_SUFFIX}" to every title automatically. The brand will show up twice.`,
      fix: `Remove "${BRAND_SUFFIX}" from the title text and let the site append it.`,
    });
  }
  return check({
    id: 'title-brand', group: 'meta', label: 'Brand in title', weight: 3, earned: 3,
    status: STATUS.PASS, value: `${text} | ${BRAND_SUFFIX}`,
    message: `The brand is not duplicated — the rendered title will be "${text} | ${BRAND_SUFFIX}".`,
  });
};

const checkDescriptionPresent = (description) => {
  const text = collapse(description);
  if (!text) {
    return check({
      id: 'description-present', group: 'meta', label: 'Meta description', weight: 10, earned: 0,
      status: STATUS.FAIL, value: '—',
      message: 'There is no meta description. Google will pull an arbitrary snippet from the page, which usually reads badly and lowers click-through rate.',
      fix: `Write a ${DESC_MIN}–${DESC_MAX} character description that says what the page offers and why to click it.`,
    });
  }
  return check({
    id: 'description-present', group: 'meta', label: 'Meta description', weight: 10, earned: 10,
    status: STATUS.PASS, value: text,
    message: 'A meta description is set.',
  });
};

const checkDescriptionLength = (description) => {
  const text = collapse(description);
  const len = text.length;

  if (!len) {
    return check({
      id: 'description-length', group: 'meta', label: 'Description length', weight: 7, earned: 0,
      status: STATUS.FAIL, value: '0 characters',
      message: 'Description length cannot be evaluated because there is no description.',
      fix: `Write a description between ${DESC_MIN} and ${DESC_MAX} characters.`,
    });
  }
  if (len < DESC_MIN) {
    return check({
      id: 'description-length', group: 'meta', label: 'Description length', weight: 7, earned: 3,
      status: STATUS.WARN, value: `${len} characters`,
      message: `The description is only ${len} characters. Search engines often ignore very short descriptions and generate their own snippet instead.`,
      fix: `Expand to at least ${DESC_MIN} characters — mention the product range, a benefit, and a reason to click.`,
    });
  }
  if (len > DESC_MAX) {
    return check({
      id: 'description-length', group: 'meta', label: 'Description length', weight: 7, earned: 3,
      status: STATUS.WARN, value: `${len} characters`,
      message: `The description is ${len} characters and will be cut off around ${DESC_MAX}.`,
      fix: `Trim to ${DESC_MAX} characters, and make sure the call to action is not in the part that gets cut.`,
    });
  }
  return check({
    id: 'description-length', group: 'meta', label: 'Description length', weight: 7, earned: 7,
    status: STATUS.PASS, value: `${len} characters`,
    message: `Description length is in the ideal ${DESC_MIN}–${DESC_MAX} character range.`,
  });
};

const CTA_PATTERNS = /\b(shop|browse|order|design|explore|discover|find|get|build|create|customi[sz]e|learn|read|contact|request|start|view|see)\b/i;

const checkDescriptionCta = (description) => {
  const text = collapse(description);
  if (!text) {
    return check({
      id: 'description-cta', group: 'content', label: 'Description call to action', weight: 4, earned: 0,
      status: STATUS.FAIL, value: '—',
      message: 'No description, so there is no call to action.',
      fix: 'Add a description that opens with an action verb such as "Shop", "Design", or "Browse".',
    });
  }
  if (!CTA_PATTERNS.test(text)) {
    return check({
      id: 'description-cta', group: 'content', label: 'Description call to action', weight: 4, earned: 1,
      status: STATUS.WARN, value: text,
      message: 'The description is purely descriptive with no action verb. Descriptions that tell the searcher what they can do earn measurably more clicks.',
      fix: 'Start the description with a verb — "Shop…", "Design…", "Browse…", "Request a quote for…".',
    });
  }
  return check({
    id: 'description-cta', group: 'content', label: 'Description call to action', weight: 4, earned: 4,
    status: STATUS.PASS, value: text,
    message: 'The description contains an action verb that invites a click.',
  });
};

const checkKeywordsPresent = (keywords) => {
  const list = keywordList(keywords);
  if (!list.length) {
    return check({
      id: 'keywords-present', group: 'content', label: 'Target keywords', weight: 5, earned: 0,
      status: STATUS.FAIL, value: '—',
      message: 'No target keywords are recorded for this page. Keywords are not a direct ranking factor any more, but without them there is nothing to check the title and description against.',
      fix: 'Add 3–8 comma-separated keywords describing what this page should rank for.',
    });
  }
  if (list.length < 3) {
    return check({
      id: 'keywords-present', group: 'content', label: 'Target keywords', weight: 5, earned: 3,
      status: STATUS.WARN, value: list.join(', '),
      message: `Only ${list.length} keyword${list.length === 1 ? '' : 's'} recorded. That is a thin basis for judging whether the page copy is on target.`,
      fix: 'Add a few more variations, including at least one long-tail phrase a customer would actually type.',
    });
  }
  if (list.length > 12) {
    return check({
      id: 'keywords-present', group: 'content', label: 'Target keywords', weight: 5, earned: 3,
      status: STATUS.WARN, value: `${list.length} keywords`,
      message: `${list.length} keywords is too many to focus a single page on. Pages that target everything rank for nothing.`,
      fix: 'Cut back to 3–8 keywords that describe this page specifically, and move the rest to pages of their own.',
    });
  }
  return check({
    id: 'keywords-present', group: 'content', label: 'Target keywords', weight: 5, earned: 5,
    status: STATUS.PASS, value: list.join(', '),
    message: `${list.length} target keywords recorded.`,
  });
};

const checkKeywordInTitle = (title, keywords) => {
  const list = keywordList(keywords);
  const text = collapse(title);

  if (!list.length || !text) {
    return check({
      id: 'keyword-in-title', group: 'content', label: 'Keyword in title', weight: 8, earned: 0,
      status: STATUS.FAIL, value: '—',
      message: 'Cannot verify keyword placement without both a title and target keywords.',
      fix: 'Fill in the title and keywords, then re-run the audit.',
    });
  }

  const matched = list.filter((keyword) => keywordAppearsIn(keyword, text));
  if (!matched.length) {
    return check({
      id: 'keyword-in-title', group: 'content', label: 'Keyword in title', weight: 8, earned: 0,
      status: STATUS.FAIL, value: text,
      message: `None of the ${list.length} target keywords appear in the title. The title is the strongest relevance signal a page has, and right now it is not reinforcing anything you are trying to rank for.`,
      fix: `Rewrite the title to lead with your primary keyword, e.g. "${list[0].replace(/\b\w/g, (c) => c.toUpperCase())} …".`,
    });
  }
  return check({
    id: 'keyword-in-title', group: 'content', label: 'Keyword in title', weight: 8, earned: 8,
    status: STATUS.PASS, value: matched.join(', '),
    message: `The title contains ${matched.length} of the target keywords.`,
  });
};

const checkKeywordInDescription = (description, keywords) => {
  const list = keywordList(keywords);
  const text = collapse(description);

  if (!list.length || !text) {
    return check({
      id: 'keyword-in-description', group: 'content', label: 'Keyword in description', weight: 5, earned: 0,
      status: STATUS.FAIL, value: '—',
      message: 'Cannot verify keyword placement without both a description and target keywords.',
      fix: 'Fill in the description and keywords, then re-run the audit.',
    });
  }

  const matched = list.filter((keyword) => keywordAppearsIn(keyword, text));
  if (!matched.length) {
    return check({
      id: 'keyword-in-description', group: 'content', label: 'Keyword in description', weight: 5, earned: 0,
      status: STATUS.FAIL, value: text,
      message: 'No target keyword appears in the meta description. Google bolds matched query terms in the snippet, so a description without them looks less relevant in the results list.',
      fix: `Work "${list[0]}" naturally into the description.`,
    });
  }
  return check({
    id: 'keyword-in-description', group: 'content', label: 'Keyword in description', weight: 5, earned: 5,
    status: STATUS.PASS, value: matched.join(', '),
    message: `The description contains ${matched.length} of the target keywords.`,
  });
};

const checkKeywordInUrl = (route, keywords) => {
  const list = keywordList(keywords);
  if (route === '/') {
    return check({
      id: 'keyword-in-url', group: 'url', label: 'Keyword in URL', weight: 4, earned: 4,
      status: STATUS.PASS, value: '/',
      message: 'This is the homepage — the root URL is correct and needs no keyword.',
    });
  }
  if (!list.length) {
    return check({
      id: 'keyword-in-url', group: 'url', label: 'Keyword in URL', weight: 4, earned: 0,
      status: STATUS.FAIL, value: route,
      message: 'Cannot verify the URL against target keywords because none are recorded.',
      fix: 'Add target keywords, then re-run the audit.',
    });
  }

  const slug = decodeURIComponent(route).replace(/[/_]/g, ' ');
  const matched = list.filter((keyword) => keywordAppearsIn(keyword, slug));
  if (!matched.length) {
    return check({
      id: 'keyword-in-url', group: 'url', label: 'Keyword in URL', weight: 4, earned: 1,
      status: STATUS.WARN, value: route,
      message: 'The URL does not contain any target keyword. Keyword-bearing URLs are a modest ranking signal and a strong usability one — people read the URL in the result.',
      fix: 'If this page is not yet linked from elsewhere, consider a slug containing the primary keyword. Do not rename URLs that already have traffic without a 301 redirect.',
    });
  }
  return check({
    id: 'keyword-in-url', group: 'url', label: 'Keyword in URL', weight: 4, earned: 4,
    status: STATUS.PASS, value: route,
    message: `The URL contains ${matched.length} of the target keywords.`,
  });
};

const checkUrlFormat = (route) => {
  const path = clean(route);
  const problems = [];

  if (/[A-Z]/.test(path)) problems.push('it contains uppercase letters, which some servers treat as a different URL');
  if (/_/.test(path)) problems.push('it uses underscores, which Google does not treat as word separators (hyphens are the convention)');
  if (/%[0-9A-Fa-f]{2}/.test(path)) problems.push('it contains percent-encoded characters, which look broken when shared');
  if (/\s/.test(path)) problems.push('it contains spaces');
  if (/[?#]/.test(path)) problems.push('it contains a query string or fragment, which should not be part of an indexed route');
  if (path.length > 100) problems.push(`it is ${path.length} characters long, well past the ~100 character point where URLs get truncated in results`);

  const depth = path.split('/').filter(Boolean).length;
  if (depth > 4) problems.push(`it is ${depth} levels deep, which buries the page in the site hierarchy`);

  if (problems.length) {
    return check({
      id: 'url-format', group: 'url', label: 'URL format', weight: 6, earned: Math.max(0, 6 - problems.length * 2),
      status: problems.length > 1 ? STATUS.FAIL : STATUS.WARN, value: path,
      message: `The URL has ${problems.length} formatting problem${problems.length === 1 ? '' : 's'}: ${problems.join('; ')}.`,
      fix: 'Use lowercase, hyphen-separated words with no encoded characters, and keep the path under four levels deep. Redirect the old URL if you change it.',
    });
  }

  return check({
    id: 'url-format', group: 'url', label: 'URL format', weight: 6, earned: 6,
    status: STATUS.PASS, value: path,
    message: 'The URL is lowercase, hyphen-separated, and a sensible length and depth.',
  });
};

const checkNoIndex = (metadata) => {
  if (metadata.noIndex === true) {
    return check({
      id: 'robots-index', group: 'indexing', label: 'Search engine indexing', weight: 6, earned: 6,
      status: STATUS.INFO, value: 'noindex, nofollow',
      message: 'This page is deliberately hidden from search engines. It renders a noindex robots tag and is excluded from every sitemap, so none of the other findings below affect your search traffic.',
      fix: 'Turn indexing back on from Index Control if this page should appear in search results.',
    });
  }
  return check({
    id: 'robots-index', group: 'indexing', label: 'Search engine indexing', weight: 6, earned: 6,
    status: STATUS.PASS, value: 'index, follow',
    message: 'Search engines are allowed to index this page.',
  });
};

const checkSitemapEnabled = (metadata) => {
  // A noindexed page has no business being in a sitemap, so its exclusion is
  // correct rather than a defect. Scoring it as a failure would punish the admin
  // for doing exactly the right thing.
  if (metadata.noIndex === true) {
    return check({
      id: 'sitemap-enabled', group: 'indexing', label: 'Included in sitemap', weight: 8, earned: 8,
      status: STATUS.INFO, value: 'Excluded (noindex)',
      message: 'Correctly excluded from the sitemap because the page is set to noindex. Listing a noindexed URL in a sitemap is what triggers the "Submitted URL marked noindex" error in Search Console.',
    });
  }
  if (metadata.sitemapEnabled === false) {
    return check({
      id: 'sitemap-enabled', group: 'indexing', label: 'Included in sitemap', weight: 8, earned: 0,
      status: STATUS.FAIL, value: 'Excluded',
      message: 'This page is excluded from the sitemap, so search engines will only find it by following links. If the exclusion is deliberate this is fine — if not, the page may never be indexed.',
      fix: 'Turn on "Include this route in sitemap" in Edit SEO, unless the page is intentionally private.',
    });
  }
  return check({
    id: 'sitemap-enabled', group: 'indexing', label: 'Included in sitemap', weight: 8, earned: 8,
    status: STATUS.PASS, value: 'Included',
    message: 'The page is listed in the XML sitemap.',
  });
};

const checkSitemapPriority = (metadata) => {
  const priority = Number(metadata.sitemapPriority ?? 0.5);

  if (Number.isNaN(priority) || priority < 0 || priority > 1) {
    return check({
      id: 'sitemap-priority', group: 'indexing', label: 'Sitemap priority', weight: 4, earned: 0,
      status: STATUS.FAIL, value: String(metadata.sitemapPriority),
      message: 'Sitemap priority must be a number between 0.0 and 1.0. An out-of-range value makes the sitemap entry invalid.',
      fix: 'Set priority to a value between 0.0 and 1.0 — 1.0 for the homepage, 0.8 for key pages, 0.5 for ordinary ones.',
    });
  }
  if (metadata.sitemapEnabled === false || metadata.noIndex === true) {
    return check({
      id: 'sitemap-priority', group: 'indexing', label: 'Sitemap priority', weight: 4, earned: 4,
      status: STATUS.INFO, value: String(priority),
      message: 'Priority is not applied because the page is excluded from the sitemap.',
    });
  }
  if (priority === 0) {
    return check({
      id: 'sitemap-priority', group: 'indexing', label: 'Sitemap priority', weight: 4, earned: 1,
      status: STATUS.WARN, value: '0',
      message: 'Priority is 0, the lowest possible value, which signals that this page matters less than everything else on the site.',
      fix: 'Raise priority to at least 0.3 unless the page really is the least important on the site.',
    });
  }
  return check({
    id: 'sitemap-priority', group: 'indexing', label: 'Sitemap priority', weight: 4, earned: 4,
    status: STATUS.PASS, value: String(priority),
    message: `Sitemap priority is ${priority}.`,
  });
};

const VALID_CHANGEFREQ = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];

const checkSitemapChangefreq = (metadata) => {
  const freq = lower(metadata.sitemapChangefreq || 'monthly');
  if (!VALID_CHANGEFREQ.includes(freq)) {
    return check({
      id: 'sitemap-changefreq', group: 'indexing', label: 'Change frequency', weight: 3, earned: 0,
      status: STATUS.FAIL, value: freq || '—',
      message: `"${freq}" is not a valid sitemap change frequency, so crawlers will ignore the hint.`,
      fix: `Use one of: ${VALID_CHANGEFREQ.join(', ')}.`,
    });
  }
  return check({
    id: 'sitemap-changefreq', group: 'indexing', label: 'Change frequency', weight: 3, earned: 3,
    status: STATUS.PASS, value: freq,
    message: `Change frequency is set to "${freq}".`,
  });
};

const checkCanonical = (route) => check({
  id: 'canonical', group: 'indexing', label: 'Canonical URL', weight: 5, earned: 5,
  status: STATUS.PASS, value: route,
  message: 'The storefront SEO component emits a self-referencing canonical tag for every route, which prevents duplicate-content splits from query strings and trailing slashes.',
});

const checkSocialTags = (metadata) => {
  const hasTitle = Boolean(collapse(metadata.title));
  const hasDescription = Boolean(collapse(metadata.description));

  if (!hasTitle && !hasDescription) {
    return check({
      id: 'social-tags', group: 'social', label: 'Open Graph & Twitter card', weight: 6, earned: 0,
      status: STATUS.FAIL, value: 'Incomplete',
      message: 'Open Graph and Twitter tags are generated from the title and description, and both are empty. Links to this page will share with no title and no summary.',
      fix: 'Fill in the title and description — the social tags are derived from them automatically.',
    });
  }
  if (!hasTitle || !hasDescription) {
    return check({
      id: 'social-tags', group: 'social', label: 'Open Graph & Twitter card', weight: 6, earned: 3,
      status: STATUS.WARN, value: 'Partial',
      message: `Social previews are missing a ${hasTitle ? 'description' : 'title'}, so shared links will render with a gap where the ${hasTitle ? 'summary' : 'headline'} should be.`,
      fix: `Fill in the ${hasTitle ? 'meta description' : 'meta title'} — og: and twitter: tags are generated from it.`,
    });
  }
  return check({
    id: 'social-tags', group: 'social', label: 'Open Graph & Twitter card', weight: 6, earned: 6,
    status: STATUS.PASS, value: 'Complete',
    message: 'og:title, og:description, og:image, and the Twitter summary_large_image card are all generated for this page.',
  });
};

const checkSocialImage = (metadata) => {
  const image = clean(metadata.ogImage);

  if (!image) {
    // A site-wide default card is valid SEO — every page still shares with a
    // working image. Treating that as a defect would fire on every page at once
    // and drown the issues that actually need fixing, so this scores full marks
    // and sits under "passed" as an opportunity rather than a problem.
    return check({
      id: 'social-image', group: 'social', label: 'Social share image', weight: 3, earned: 3,
      status: STATUS.INFO, value: 'Site default card',
      message: 'This page shares with the site-wide default image, which is valid. A page-specific image typically lifts click-through on shared links, so it is worth setting on pages you actively promote.',
      fix: 'Optional — upload a page image under Edit SEO if this page is shared often.',
    });
  }

  if (!/^https?:\/\/\S+$/i.test(image) && !image.startsWith('/')) {
    return check({
      id: 'social-image', group: 'social', label: 'Social share image', weight: 3, earned: 0,
      status: STATUS.FAIL, value: image,
      message: 'The share image is set but is not a usable URL, so social platforms will fail to load it and the link will share with no image at all.',
      fix: 'Re-upload the image from Edit SEO, or paste a full https:// URL.',
    });
  }

  return check({
    id: 'social-image', group: 'social', label: 'Social share image', weight: 3, earned: 3,
    status: STATUS.PASS, value: image,
    message: 'This page has its own Open Graph and Twitter card image.',
  });
};

const checkTitleUniqueness = (route, title, siblings) => {
  const text = lower(collapse(title));
  if (!text) {
    return check({
      id: 'title-unique', group: 'uniqueness', label: 'Unique title', weight: 6, earned: 0,
      status: STATUS.FAIL, value: '—',
      message: 'Uniqueness cannot be checked because the page has no title.',
      fix: 'Add a title first.',
    });
  }

  const clashes = siblings
    .filter((item) => item.route !== route && lower(collapse(item.title)) === text)
    .map((item) => item.route);

  if (clashes.length) {
    return check({
      id: 'title-unique', group: 'uniqueness', label: 'Unique title', weight: 6, earned: 0,
      status: STATUS.FAIL, value: clashes.join(', '),
      message: `${clashes.length} other page${clashes.length === 1 ? '' : 's'} use the exact same title: ${clashes.join(', ')}. Google picks one and suppresses the rest, so these pages compete with each other instead of ranking.`,
      fix: 'Give each page a title that reflects what is unique about it — the category, colour, material, or audience it covers.',
    });
  }
  return check({
    id: 'title-unique', group: 'uniqueness', label: 'Unique title', weight: 6, earned: 6,
    status: STATUS.PASS, value: 'Unique',
    message: 'No other page on the site uses this title.',
  });
};

const checkDescriptionUniqueness = (route, description, siblings) => {
  const text = lower(collapse(description));
  if (!text) {
    return check({
      id: 'description-unique', group: 'uniqueness', label: 'Unique description', weight: 5, earned: 0,
      status: STATUS.FAIL, value: '—',
      message: 'Uniqueness cannot be checked because the page has no description.',
      fix: 'Add a description first.',
    });
  }

  const clashes = siblings
    .filter((item) => item.route !== route && lower(collapse(item.description)) === text)
    .map((item) => item.route);

  if (clashes.length) {
    return check({
      id: 'description-unique', group: 'uniqueness', label: 'Unique description', weight: 5, earned: 0,
      status: STATUS.FAIL, value: clashes.join(', '),
      message: `${clashes.length} other page${clashes.length === 1 ? '' : 's'} share this exact description: ${clashes.join(', ')}. Duplicate descriptions get discarded and replaced with an auto-generated snippet.`,
      fix: 'Rewrite so each description names what is specific to that page.',
    });
  }
  return check({
    id: 'description-unique', group: 'uniqueness', label: 'Unique description', weight: 5, earned: 5,
    status: STATUS.PASS, value: 'Unique',
    message: 'No other page on the site uses this description.',
  });
};

// ── Scoring ──────────────────────────────────────────────────────────────────

export const gradeFor = (score) => {
  if (score >= 90) return { grade: 'excellent', label: 'Excellent', color: '#2e7d32' };
  if (score >= 75) return { grade: 'good', label: 'Good', color: '#0288d1' };
  if (score >= 50) return { grade: 'needs-work', label: 'Needs Improvement', color: '#ed6c02' };
  return { grade: 'poor', label: 'Poor', color: '#d32f2f' };
};

/**
 * Audit one metadata record.
 *
 * @param {object} metadata  the Metadata document (plain object)
 * @param {Array}  siblings  every other metadata record, used for duplicate detection
 * @returns {object} full report
 */
export const auditPage = (metadata, siblings = []) => {
  const route = clean(metadata.route);
  const { title, description, keywords } = metadata;

  const checks = [
    checkTitlePresent(title),
    checkTitleLength(title),
    checkTitleBrand(title),
    checkDescriptionPresent(description),
    checkDescriptionLength(description),
    checkDescriptionCta(description),
    checkKeywordsPresent(keywords),
    checkKeywordInTitle(title, keywords),
    checkKeywordInDescription(description, keywords),
    checkKeywordInUrl(route, keywords),
    checkUrlFormat(route),
    checkNoIndex(metadata),
    checkSitemapEnabled(metadata),
    checkSitemapPriority(metadata),
    checkSitemapChangefreq(metadata),
    checkCanonical(route),
    checkSocialTags(metadata),
    checkSocialImage(metadata),
    checkTitleUniqueness(route, title, siblings),
    checkDescriptionUniqueness(route, description, siblings),
  ];

  const totalWeight = checks.reduce((sum, item) => sum + item.weight, 0);
  const totalEarned = checks.reduce((sum, item) => sum + item.earned, 0);
  const score = totalWeight ? Math.round((totalEarned / totalWeight) * 100) : 0;

  const failed = checks.filter((item) => item.status === STATUS.FAIL);
  const warnings = checks.filter((item) => item.status === STATUS.WARN);
  const passed = checks.filter((item) => item.status === STATUS.PASS || item.status === STATUS.INFO);

  // Highest-impact first: biggest points lost, failures before warnings.
  const issues = [...failed, ...warnings].sort((a, b) => {
    const lostA = a.weight - a.earned;
    const lostB = b.weight - b.earned;
    if (lostB !== lostA) return lostB - lostA;
    return b.weight - a.weight;
  });

  const groups = CHECK_GROUPS.map((group) => {
    const groupChecks = checks.filter((item) => item.group === group.id);
    const weight = groupChecks.reduce((sum, item) => sum + item.weight, 0);
    const earned = groupChecks.reduce((sum, item) => sum + item.earned, 0);
    return {
      id: group.id,
      label: group.label,
      weight,
      earned,
      score: weight ? Math.round((earned / weight) * 100) : 0,
      checks: groupChecks,
    };
  }).filter((group) => group.checks.length);

  const noIndex = metadata.noIndex === true;

  return {
    route,
    score,
    ...gradeFor(score),
    // Callers exclude noindexed pages from the site average and label them
    // "Excluded from search" — a page nobody is meant to find should not drag
    // down the score of the pages that are.
    noIndex,
    totalWeight,
    totalEarned,
    checks,
    groups,
    issues,
    passed,
    counts: {
      total: checks.length,
      passed: passed.length,
      warnings: warnings.length,
      failed: failed.length,
    },
    auditedAt: new Date(),
  };
};

export { STATUS, CHECK_GROUPS };
