import isoFetch from 'isomorphic-fetch';
import fetchWithCookieBuilder from 'fetch-cookie';
import { CookieJar } from 'tough-cookie';
import { omit, mergeDeepRight } from 'ramda';
import { DomainError } from './errors';

const cookieJar = new CookieJar();
const fetchWithCookie = fetchWithCookieBuilder(isoFetch, cookieJar);

async function fetchServer(url, options) {
  const fetch = options.cookie ? fetchWithCookie : isoFetch;
  const fetchOptions = mergeDeepRight(
    {
      headers: { 'Content-Type': 'application/json' },
    },
    omit(['cookie'], options),
  );

  const result = await fetch(url, fetchOptions);
  const body = await result.json();
  if (!result.ok) {
    if (result.status === 400) {
      throw new DomainError(
        body.error.message,
        body.error.errorCode,
        body.error.payload,
      );
    } else {
      throw new Error(`${result.status} ${result.statusText} ${body.error}`);
    }
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
