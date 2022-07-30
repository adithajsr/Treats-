import request, { HttpVerb } from 'sync-request';
import config from './config.json';
import { requestAuthRegister } from './auth.test';
import { requestChannelsCreate } from './channels.test';
import { requestClear } from './users.test';
import { generateString } from './message.test';

const port = config.port;
const url = config.url;

// -------------------------------------------------------------------------//

function requestHelper(method: HttpVerb, path: string, payload: object) {
  let qs = {};
  let json = {};
  let res;
  if (method === 'GET' || method === 'DELETE') {
    qs = payload;
    res = request(method, `${url}:${port}` + path, { qs });
  } else {
    json = payload;
    res = request(method, `${url}:${port}` + path, { json });
  }
  if (res.statusCode === 400 || res.statusCode === 403) {
    return res.statusCode;
  }
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
}

// -------------------------------------------------------------------------//

function requestStandupStart(token: string, channelId: number, length: number) {
  return requestHelper('POST', '/standup/start/v1', { token, channelId, length });
}

function requestStandupActive(token: string, channelId: number) {
  return requestHelper('GET', '/standup/active/v1', { token, channelId });
}

function requestStandupSendV1(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/standup/send/v1', { token, channelId, message });
}

// -------------------------------------------------------------------------//
let testUser: any;
let testChannel: any;
let testStandup: any;

describe('standup capabilities', () => {
  describe('standup/start/v1 test', () => {
    beforeEach(() => {
      requestClear();
      // Create a test user
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      // Create a test channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'name', true);
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail standup start', () => {
    });
  
  });

});