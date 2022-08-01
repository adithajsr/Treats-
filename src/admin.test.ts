import request, { HttpVerb } from 'sync-request';
import config from './config.json';

const port = config.port;
const url = config.url;

import { requestClear } from './users.test';
import { requestAuthRegister } from './auth.test';
import { requestChannelsCreate } from './channels.test';
import { requestMessageSend, requestSendDm, payloadObj, requestChannelJoinV2 } from './message.test';
import { requestDMCreate } from './dm.test';
import { requestUsersAll, requestUserProfile } from './users.test';
import { requestChannelDetailsHelper, requestChannelMessages } from './channel.test';
import { requestDMMessages, requestDMDetails } from './dm.test';

// -------------------------------------------------------------------------//

function requestHelper(method: HttpVerb, path: string, payload: payloadObj) {
  let qs = {};
  let json = {};
  let headers = {};

  // Check if token key exists in payload
  if (payload.token !== undefined) {
    headers = { token: payload.token };
    delete payload.token;
  }

  let res;
  if (method === 'GET' || method === 'DELETE') {
    qs = payload;
    res = request(method, `${url}:${port}` + path, { qs, headers });
  } else {
    json = payload;
    res = request(method, `${url}:${port}` + path, { json, headers });
  }
  if (res.statusCode === 400 || res.statusCode === 403) {
    return res.statusCode;
  }
  if (res.statusCode === 200) {
    return JSON.parse(res.getBody() as string);
  }
}

// -------------------------------------------------------------------------//

function requestAdminUserRemove(token: string, uId: number) {
  return requestHelper('DELETE', '/admin/user/remove/v1', { token, uId });
}

// -------------------------------------------------------------------------//

let testUser: any;
let byeUser: any;
let testChannel: any;
let testDm: any;

describe('admin/user/remove/v1 test', () => {
  describe('testUser and byeUser beforeEach', () => {
    beforeEach(() => {
      requestClear();
      testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
      byeUser = requestAuthRegister('avalidemail@gmail.com', 'a123abc!@#', 'Jane', 'Doe');
    });

    afterEach(() => {
      requestClear();
    });

    test('invalid token, fail user remove', () => {
      const testRequest = requestAdminUserRemove(testUser.bodyObj.token + 'a', byeUser.bodyObj.authUserId);
      expect(testRequest).toBe(403);
    });

    test('uId does not refer to a valid user, fail user remove', () => {
      const testRequest = requestAdminUserRemove(testUser.bodyObj.token, 9999);
      expect(testRequest).toBe(400);
    });

    test('auth user is not a global owner, fail user remove', () => {
      const testRequest = requestAdminUserRemove(byeUser.bodyObj.token, testUser.bodyObj.authUserId);
      expect(testRequest).toBe(403);
    });

    test('succcessful user remove', () => {
      // testUser creates a channel
      testChannel = requestChannelsCreate(testUser.bodyObj.token, 'channelName', true);
      // byeUser joins the channel
      requestChannelJoinV2(byeUser.bodyObj.token, testChannel.bodyObj.channelId);
      // byeUser sends two messages to the channel
      const m1 = requestMessageSend(byeUser.bodyObj.token, testChannel.bodyObj.channelId, 'first message');
      const m2 = requestMessageSend(byeUser.bodyObj.token, testChannel.bodyObj.channelId, 'second message');
      // testUser creates a DM
      testDm = requestDMCreate(testUser.bodyObj.token, [byeUser.bodyObj.authUserId]);
      // byeUser sends two dms
      requestSendDm(byeUser.bodyObj.token, testDm.bodyObj.dmId, 'first dm');
      requestSendDm(byeUser.bodyObj.token, testDm.bodyObj.dmId, 'second dm');
      const testRequest = requestAdminUserRemove(testUser.bodyObj.token, byeUser.bodyObj.authUserId);
      // check outputs
      expect(testRequest).toStrictEqual({});
      // check users/all array
      expect(requestUsersAll().bodyObj.users).toStrictEqual([
        {
          uId: testUser.bodyObj.authUserId,
          email: 'validemail@gmail.com',
          nameFirst: 'John',
          nameLast: 'Doe',
          handleStr: 'johndoe'
        }
      ]);
      // retrieve user details user/profile
      expect(requestUserProfile(testUser.bodyObj.token, byeUser.bodyObj.authUserId).bodyObj).toStrictEqual(
        {
          uId: byeUser.bodyObj.authUserId,
          email: 'avalidemail@gmail.com',
          nameFirst: 'Removed',
          nameLast: 'user',
          handleStr: 'janedoe'
        }
      );
      // retrieve channel details - requestChannelDetailsHelper - members
      const cD = requestChannelDetailsHelper(testUser.bodyObj.token, testChannel.bodyObj.channelId);
      expect(cD.channelDetails).toStrictEqual(
        {
          name: 'channelName',
          isPublic: true,
          ownerMembers: [
            {
              email: 'validemail@gmail.com',
              handle: 'johndoe',
              nameFirst: 'John',
              nameLast: 'Doe',
              uId: 1,
            },
          ],
          allMembers: [
            {
              email: 'validemail@gmail.com',
              handle: 'johndoe',
              nameFirst: 'John',
              nameLast: 'Doe',
              uId: 1,
            },
          ],
        }
      );
      // retrieve channel details - requestChannelMessages - message
      const channelM = requestChannelMessages(testUser.bodyObj.token, testChannel.bodyObj.channelId, 0);
      expect(channelM.bodyObj.messages).toStrictEqual(
        [
          {
            messageId: m1.messageId,
            uId: byeUser.bodyObj.authUserId,
            message: 'Removed user',
            timeSent: expect.any(Number),
            pinned: 0,
            react: 0,
          },
          {
            messageId: m2.messageId,
            uId: byeUser.bodyObj.authUserId,
            message: 'Removed user',
            timeSent: expect.any(Number),
            pinned: 0,
            react: 0,
          }
        ]
      );
      // retrieve dm details - requestDMDetails - members
      const dmD = requestDMDetails(testUser.bodyObj.token, testDm.bodyObj.dmId);
      expect(dmD.bodyObj.members).toStrictEqual([{
        dmPerms: 1,
        uId: testUser.bodyObj.authUserId
      }]);
      // retrieve dm details - requestDMMessages - messages
      const dmM = requestDMMessages(testUser.bodyObj.token, testDm.bodyObj.dmId, 0);
      expect(dmM.bodyObj.messages[0].message).toStrictEqual('Removed user');
      expect(dmM.bodyObj.messages[1].message).toStrictEqual('Removed user');
    });
  });

  test('uId is the only global owner, fail user remove', () => {
    requestClear();
    testUser = requestAuthRegister('validemail@gmail.com', '123abc!@#', 'John', 'Doe');
    const testRequest = requestAdminUserRemove(testUser.bodyObj.token, testUser.bodyObj.authUserId);
    expect(testRequest).toBe(400);
    requestClear();
  });
});
