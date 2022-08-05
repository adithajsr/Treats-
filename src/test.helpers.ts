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
    bodyObj: JSON.parse(res.getBody() as string),
  };
}