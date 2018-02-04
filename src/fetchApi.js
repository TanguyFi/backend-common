import isoFetch from 'isomorphic-fetch';
import fetchWithCookieBuilder from 'fetch-cookie';
import { CookieJar } from 'tough-cookie';

const cookieJar = new CookieJar();
const fetchWithCookie = fetchWithCookieBuilder(isoFetch, cookieJar);

async function fetchServer(url, options) {
  const fetch = options.cookie ? fetchWithCookie : isoFetch;

  const result = await fetch(url, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body,
  });
  const body = await result.json();
  if (!result.ok) {
    throw new Error(`${result.status} ${result.statusText} ${body.error}`);
  }
  return body;
}

export function clearCookies(domain, path) {
  return new Promise((resolve, reject) => {
    cookieJar.store.removeCookies(domain, path, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export default fetchServer;
