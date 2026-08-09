/* ==========================================================================
   /api/coding-stats  —  Vercel serverless function

   Purpose
   -------
   Fetches fresh, publicly-available statistics for the three coding
   profiles shown on the portfolio (LeetCode, GeeksforGeeks, Code360) and
   returns them as one small JSON payload for the frontend to render.

   Why a backend at all?
   ----------------------
   Some of these platforms don't send CORS headers that allow a browser to
   read the response directly, and none of them offer an official public
   JSON API. Doing the fetch here (server-side, Node) sidesteps CORS
   entirely, keeps request patterns/rate-limits off the client, and gives us
   one place to add caching and safe fallbacks.

   Reliability model
   ------------------
   Every platform is fetched independently inside its own try/catch via
   Promise.allSettled. A slow, blocked, or reshaped response from ONE
   platform can never take down the others or crash this function — it
   simply reports that platform as unavailable, and the frontend keeps
   showing the last known value instead of a fake number.

   Data sources (see the long comment in each fetch* function for details
   and caveats):
     - LeetCode:      official GraphQL endpoint (leetcode.com/graphql),
                       with a community REST API as a fallback.
     - GeeksforGeeks:  community REST API (no official/public API exists).
     - Code360:        no public API and no server-rendered HTML exists
                       (fully client-rendered app behind a loading screen),
                       so it is not fetched here — the frontend keeps its
                       last manually-set value for this platform.

   Caching
   -------
   Results are cached in-memory (per warm serverless instance) for
   CACHE_TTL_MS and also marked cacheable at the CDN edge via
   Cache-Control / stale-while-revalidate, so refreshing the portfolio
   repeatedly doesn't hammer any of these platforms.
   ========================================================================== */

const LEETCODE_USERNAME = 'SaravanaBava';
const GFG_USERNAME = 'saravanaba07t';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT_MS = 8000;

// A realistic browser User-Agent. Some of these upstream services sit
// behind bot-protection that quietly blocks/challenges requests carrying
// no User-Agent (or an obviously non-browser one like Node's default),
// which is a common reason "live" fetches silently fail from a server.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// Persists between invocations as long as the serverless instance stays
// warm. Not guaranteed (cold starts reset it), which is fine — worst case
// we just fetch fresh data a bit more often.
let cache = { data: null, timestamp: 0 };

async function fetchJSON(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { 'User-Agent': BROWSER_UA, Accept: 'application/json, text/plain, */*', ...(options.headers || {}) },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------------------------------------------------------------- *
 * LEETCODE
 * Primary: LeetCode's own public GraphQL endpoint (used by leetcode.com
 * itself to render public profiles — no auth needed for public stats).
 * Fallback: a community-run REST wrapper, in case LeetCode changes/blocks
 * the GraphQL shape.
 * ---------------------------------------------------------------------- */
async function fetchLeetCode() {
  try {
    const query = `
      query userStats($username: String!) {
        matchedUser(username: $username) {
          profile { ranking }
          submitStatsGlobal {
            acSubmissionNum { difficulty count }
          }
        }
      }`;
    const data = await fetchJSON('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://leetcode.com',
        Referer: `https://leetcode.com/u/${LEETCODE_USERNAME}/`,
      },
      body: JSON.stringify({ query, variables: { username: LEETCODE_USERNAME } }),
    });

    const user = data && data.data && data.data.matchedUser;
    if (!user) throw new Error('user not found in GraphQL response');

    const byDiff = {};
    for (const row of user.submitStatsGlobal.acSubmissionNum) {
      byDiff[row.difficulty.toLowerCase()] = row.count;
    }
    if (typeof byDiff.all !== 'number') throw new Error('unexpected GraphQL shape');

    return {
      available: true,
      solved: byDiff.all,
      easy: byDiff.easy ?? null,
      medium: byDiff.medium ?? null,
      hard: byDiff.hard ?? null,
      ranking: user.profile && typeof user.profile.ranking === 'number' ? user.profile.ranking : null,
      source: 'leetcode-graphql',
    };
  } catch (primaryErr) {
    try {
      const data = await fetchJSON(`https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}`);
      const solved = data && (data.totalSolved ?? data.solvedProblem);
      if (typeof solved !== 'number') throw new Error('unexpected fallback shape');
      return {
        available: true,
        solved,
        easy: data.easySolved ?? null,
        medium: data.mediumSolved ?? null,
        hard: data.hardSolved ?? null,
        ranking: typeof data.ranking === 'number' ? data.ranking : null,
        source: 'leetcode-stats-api-fallback',
      };
    } catch (fallbackErr) {
      return {
        available: false,
        error: `primary: ${primaryErr.message}; fallback: ${fallbackErr.message}`,
      };
    }
  }
}

/* ---------------------------------------------------------------------- *
 * GEEKSFORGEEKS
 * GeeksforGeeks has no official public API and its modern profile page
 * (/profile/<user>) is fully client-rendered, so there is nothing to
 * scrape server-side either. This uses a well-known community REST
 * wrapper. If it's down, the card falls back to its last known value.
 * ---------------------------------------------------------------------- */
async function fetchGeeksforGeeks() {
  try {
    const data = await fetchJSON(`https://geeks-for-geeks-api.vercel.app/${GFG_USERNAME}`);
    const info = data && data.info;
    const solved = info && (info.totalProblemsSolved ?? info.solved);
    const solvedNum = typeof solved === 'string' ? parseInt(solved, 10) : solved;
    if (typeof solvedNum !== 'number' || Number.isNaN(solvedNum)) {
      throw new Error('unexpected response shape');
    }
    return {
      available: true,
      solved: solvedNum,
      score: info.codingScore != null ? Number(info.codingScore) : null,
      instituteRank: info.instituteRank != null ? String(info.instituteRank) : null,
      source: 'geeks-for-geeks-api',
    };
  } catch (err) {
    return { available: false, error: err.message };
  }
}

/* ---------------------------------------------------------------------- *
 * CODE360 (Naukri Coding Ninjas)
 * No official/public API exists, and the profile URL serves a fully
 * client-rendered app (a loading screen with no data in the initial HTML),
 * so there's nothing that can be reliably fetched or scraped server-side
 * either. This intentionally reports "unavailable" every time so the
 * frontend shows "Unavailable" (or a cached last-known-good value from a
 * previous successful visit, if this ever changes) instead of a number
 * that was never actually fetched.
 * ---------------------------------------------------------------------- */
async function fetchCode360() {
  return { available: false, error: 'No public API or server-rendered data available for Code360.' };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const now = Date.now();
    if (cache.data && now - cache.timestamp < CACHE_TTL_MS) {
      console.log('[coding-stats] Serving cached response (age: ' + Math.round((now - cache.timestamp) / 1000) + 's)');
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
      res.status(200).send(JSON.stringify(cache.data));
      return;
    }

    console.log('[coding-stats] Cache miss/expired — fetching fresh data from all platforms…');
    const [leetcode, geeksforgeeks, code360] = await Promise.allSettled([
      fetchLeetCode(),
      fetchGeeksforGeeks(),
      fetchCode360(),
    ]);

    const unwrap = (result) =>
      result.status === 'fulfilled' ? result.value : { available: false, error: result.reason?.message || 'unknown error' };

    const payload = {
      leetcode: unwrap(leetcode),
      geeksforgeeks: unwrap(geeksforgeeks),
      code360: unwrap(code360),
      fetchedAt: new Date().toISOString(),
    };

    console.log('[coding-stats] Fetch results —',
      'leetcode:', payload.leetcode.available ? `ok (${payload.leetcode.solved} solved, via ${payload.leetcode.source})` : `FAILED (${payload.leetcode.error})`,
      '| geeksforgeeks:', payload.geeksforgeeks.available ? `ok (${payload.geeksforgeeks.solved} solved)` : `FAILED (${payload.geeksforgeeks.error})`,
      '| code360:', payload.code360.available ? 'ok' : `unavailable (${payload.code360.error})`
    );

    cache = { data: payload, timestamp: now };

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).send(JSON.stringify(payload));
  } catch (err) {
    // Belt-and-braces: this should never happen since every fetch* function
    // already catches its own errors, but if something truly unexpected
    // blows up here, still return valid JSON (all platforms unavailable)
    // instead of a 500/HTML error page the frontend can't parse.
    console.error('[coding-stats] Unexpected handler error:', err);
    res.status(200).send(JSON.stringify({
      leetcode: { available: false, error: 'internal error' },
      geeksforgeeks: { available: false, error: 'internal error' },
      code360: { available: false, error: 'internal error' },
      fetchedAt: new Date().toISOString(),
    }));
  }
};
