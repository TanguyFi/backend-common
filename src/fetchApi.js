import isoFetch from 'isomorphic-fetch';
import fetchWithCookieBuilder from 'fetch-cookie';
import { CookieJar } from 'tough-cookie';
import { omit, mergeDeepRight } from 'ramda';
import ContentDisposition from 'content-disposition';
import ContentType from 'content-type';

import { DomainError } from './errors';

const cookieJar = new CookieJar();
const fetchWithCookie = fetchWithCookieBuilder(isoFetch, cookieJar);

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
  const fetch = options.cookie ? fetchWithCookie : isoFetch;
  const fetchOptions = mergeDeepRight(
    {
      headers: { 'Content-Type': 'application/json' },
    },
    omit(['cookie'], options),
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
