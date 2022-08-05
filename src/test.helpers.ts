import request from 'sync-request';
import config from './config.json';
const port = config.port;
const url = config.url;

export function requestUserProfileSetName(token: string, nameFirst: string, nameLast: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/setname/v2`,
    {
      json: {
        nameFirst: nameFirst,
        nameLast: nameLast,
      },
      headers: {
        token: token,
      },
    }
  );

  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestUserProfileSetEmail(token: string, email: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/setemail/v2`,
    {
      json: {
        email: email,
      },
      headers: {
        token: token,
      },

    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestUserProfileSetHandle(token: string, handleStr: string) {
  const res = request(
    'PUT',
    `${url}:${port}/user/profile/sethandle/v2`,
    {
      json: {
        handleStr: handleStr,
      },
      headers: {
        token: token,
      },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestUploadPhoto(imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number, token: string) {
  const res = request(
    'POST',
    `${url}:${port}/user/profile/uploadphoto/v1`,
    {
      json: {
        imgUrl: imgUrl,
        xStart: xStart,
        yStart: yStart,
        xEnd: xEnd,
        yEnd: yEnd,
      },
      headers: {
        token: token,
      },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse((res.body).toString() as string),
  };
}

export function requestUsersAll(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/users/all/v2`,
    {
      qs: {

      },
      headers: {
        token: token,
      },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestUserProfile(token: string, uId: number) {
  const res = request(
    'GET',
    `${url}:${port}/user/profile/v3`,
    {
      qs: {
        uId: uId
      },
      headers: {
        token: token,
      },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestClear() {
  const res = request(
    'DELETE',
    `${url}:${port}/clear/v1`,
    {
      qs: {},
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/register/v3`,
    {
      json: {
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestAuthLogin(email: string, password: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/login/v3`,
    {
      json: {
        email: email,
        password: password,
      }
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestAuthLogout(token: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/logout/v2`,
    {
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestPasswordRequest(email: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/passwordreset/request/v1`,
    {
      json: {
        email: email,
      },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
  };
}

export function requestPasswordReset(resetCode: string, newPassword: string) {
  const res = request(
    'POST',
    `${url}:${port}/auth/passwordreset/reset/v1`,
    {
      json: {
        resetCode: resetCode,
        newPassword: newPassword,
      },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
  };
}

export function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  const res = request(
    'POST',
    `${url}:${port}/channels/create/v3`,
    {
      json: { name, isPublic },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestChannelsList(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/channels/list/v3`,
    {
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestChannelsListAll(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/channels/listall/v3`,
    {
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestChannelInvite(token: string, channelId: number, uId: number) {
  const res = request(
    'POST',
    `${url}:${port}/channel/invite/v3`,
    {
      json: { channelId, uId },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestDMCreate(token: string, uIds: number[]) {
  const res = request(
    'POST',
    `${url}:${port}/dm/create/v2`,
    {
      json: { uIds },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestDMMessages(token: string, dmId: number, start: number) {
  const res = request(
    'GET',
    `${url}:${port}/dm/messages/v2`,
    {
      qs: { dmId, start },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
  };
}

export function requestMessageSendDM(token: string, dmId: number, message: string) {
  const res = request(
    'POST',
    `${url}:${port}/message/senddm/v2`,
    {
      json: { dmId, message },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestDMList(token: string) {
  const res = request(
    'GET',
    `${url}:${port}/dm/list/v2`,
    {
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestDMRemove(token: string, dmId: number) {
  const res = request(
    'DELETE',
    `${url}:${port}/dm/remove/v2`,
    {
      qs: { dmId },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}

export function requestDMDetails(token: string, dmId: number) {
  const res = request(
    'GET',
    `${url}:${port}/dm/details/v2`,
    {
      qs: { dmId },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
  };
}

export function requestDMLeave(token: string, dmId: number) {
  const res = request(
    'POST',
    `${url}:${port}/dm/leave/v2`,
    {
      json: { dmId },
      headers: { token },
    }
  );
  return {
    res: res,
    bodyObj: JSON.parse(String(res.body)),
  };
}

export function requestNotificationsGet(token: string) {
  const res = request(
    'GET',
      `${url}:${port}/notifications/get/v1`,
      {
        headers:
        {
          token,
        }
      }
  );
  return {
    res: res,
    bodyObj: JSON.parse(res.body as string),
  };
}
