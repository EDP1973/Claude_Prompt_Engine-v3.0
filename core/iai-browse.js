/**
 * iAI Browse Module
 * Provides web search (DuckDuckGo Instant Answers + HTML scrape) and page fetch.
 * No API keys required — uses public endpoints.
 */

const https = require('https');
const http  = require('http');
const url   = require('url');

// ── HTTP helpers ─────────────────────────────────────────────────────────────

function fetchUrl(targetUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new url.URL(targetUrl);
    const lib    = parsed.protocol === 'https:' ? https : http;
    const reqOpts = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      method:   'GET',
      headers: {
        'User-Agent':      'Mozilla/5.0 (compatible; iAI-Fetch/1.0)',
        'Accept':          'text/html,application/json,*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        ...(options.headers || {})
      }
    };

    const req = lib.request(reqOpts, res => {
      // Follow redirects (up to 3)
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location && (options._redirects||0) < 3) {
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsed.protocol}//${parsed.host}${res.headers.location}`;
        return fetchUrl(redirectUrl, { ...options, _redirects: (options._redirects||0) + 1 })
          .then(resolve).catch(reject);
      }

      let data = '';
      res.on('data', c => { data += c; if (data.length > 500_000) req.destroy(); });
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    });

    req.on('error', reject);
    req.setTimeout(options.timeout || 15000, () => { req.destroy(); reject(new Error('Request timed out')); });
    req.end();
  });
}

// ── Text extraction from HTML ─────────────────────────────────────────────────

function extractText(html) {
  // Remove scripts, styles, nav, footer
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{3,}/g, '\n\n')
    .trim();

  // Limit to 4000 chars
  return text.slice(0, 4000);
}

// ── DuckDuckGo Instant Answer API ────────────────────────────────────────────

async function duckduckgoSearch(query, maxResults = 5) {
  const q = encodeURIComponent(query);
  const { body } = await fetchUrl(
    `https://api.duckduckgo.com/?q=${q}&format=json&no_html=1&skip_disambig=1`,
    { headers: { 'Accept': 'application/json' } }
  );

  let data;
  try { data = JSON.parse(body); }
  catch(e) { throw new Error('Failed to parse search response'); }

  const results = [];

  // Abstract / answer box
  if (data.Abstract) {
    results.push({
      title:   data.Heading || query,
      url:     data.AbstractURL || '',
      snippet: data.Abstract.slice(0, 400),
      source:  data.AbstractSource || 'DuckDuckGo'
    });
  }

  // Related topics
  (data.RelatedTopics || []).slice(0, maxResults - results.length).forEach(t => {
    if (t.Text && t.FirstURL) {
      results.push({
        title:   t.Text.split(' - ')[0].slice(0, 80),
        url:     t.FirstURL,
        snippet: t.Text.slice(0, 300),
        source:  'DuckDuckGo'
      });
    } else if (t.Topics) {
      // sub-category group
      t.Topics.slice(0, 2).forEach(sub => {
        if (sub.Text && sub.FirstURL) {
          results.push({
            title:   sub.Text.split(' - ')[0].slice(0, 80),
            url:     sub.FirstURL,
            snippet: sub.Text.slice(0, 300),
            source:  'DuckDuckGo'
          });
        }
      });
    }
  });

  // Definitions
  if (data.Definition) {
    results.push({
      title:   data.DefinitionSource || 'Definition',
      url:     data.DefinitionURL || '',
      snippet: data.Definition.slice(0, 400),
      source:  data.DefinitionSource || 'DuckDuckGo'
    });
  }

  return {
    query,
    answer:  data.Answer || null,
    results: results.slice(0, maxResults)
  };
}

// ── Page fetcher ──────────────────────────────────────────────────────────────

async function fetchPage(targetUrl) {
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }
  const { statusCode, body } = await fetchUrl(targetUrl);
  if (statusCode >= 400) throw new Error(`HTTP ${statusCode} fetching ${targetUrl}`);

  // Extract <title>
  const titleMatch = body.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Extract meta description
  const descMatch = body.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)
                 || body.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : '';

  const text = extractText(body);
  return { url: targetUrl, title, description, text };
}

// ── Module export ─────────────────────────────────────────────────────────────

class IAIBrowse {
  /**
   * Search the web.
   * @param {string} query
   * @param {number} maxResults
   */
  async search(query, maxResults = 5) {
    return duckduckgoSearch(query, maxResults);
  }

  /**
   * Fetch and extract text from a URL.
   * @param {string} targetUrl
   */
  async fetchPage(targetUrl) {
    return fetchPage(targetUrl);
  }
}

module.exports = IAIBrowse;
