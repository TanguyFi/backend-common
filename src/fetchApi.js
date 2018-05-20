import isoFetch from 'isomorphic-fetch';
import fetchWithCookieBuilder from 'fetch-cookie';
import { CookieJar } from 'tough-cookie';
import { omit, mergeDeepRight } from 'ramda';
import ContentDisposition from 'content-disposition';
import ContentType from 'content-type';

import { DomainError } from './errors';

const fetchWithCookie = jar => fetchWithCookieBuilder(isoFetch, jar);

async function parseJSONResponse(response) {
  const body = await response.json();
  if (!response.ok) {
    if (response.status === 400) {
      throw new DomainError(
        body.error.message,
        body.error.errorCode,
        body.error.payload,
      );
    } else {
      throw new Error(
        `${response.status} ${response.statusText} ${body.error}`,
      );
    }
  }
  return body;
}

async function parseOctetStreamResponse(response) {
  return {
    buffer: await response.buffer(),
    filename: ContentDisposition.parse(
      response.headers.get('content-disposition'),
    ).parameters.filename,
  };
}

async function fetchServer(url, options) {
  const fetch = options.cookieJar
    ? fetchWithCookie(options.cookieJar)
    : isoFetch;
  const fetchOptions = mergeDeepRight(
    {
      headers: { 'Content-Type': 'application/json' },
    },
    omit(['cookieJar'], options),
  );

  const response = await fetch(url, fetchOptions);

  const contentType = ContentType.parse(response.headers.get('content-type'))
    .type;

  if (contentType === 'application/json') {
    return parseJSONResponse(response);
  } else if (contentType === 'application/octet-stream') {
    return parseOctetStreamResponse(response);
  }
  return response.text();
}

export function clearCookies(jar, domain, path) {
  return new Promise((resolve, reject) => {
    jar.store.removeCookies(domain, path, err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
}

export function cookieJar() {
  return new CookieJar();
}

export default fetchServer;
