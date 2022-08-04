import { requestAuthRegister } from './auth.test';
import request from 'sync-request';
import config from './config.json';
import fs from 'fs';

const OK = 200;
const url = config.url;
const port = config.port;

const authDaniel = ['danielYung@gmail.com', 'password', 'Daniel', 'Yung'];
const authMaiya = ['maiyaTaylor@gmail.com', 'password', 'Maiya', 'Taylor'];

// ======================================== ClearV1 Testing ========================================

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

function requestUploadPhoto(imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number, token: string) {
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

test('Invalid uId', () => {
  requestClear();
  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]);
  const maiyaToken = maiyaUser.bodyObj.token;
  const maiyaId = maiyaUser.bodyObj.authUserId;
  expect(requestUserProfile(maiyaToken, maiyaId + 20).res.statusCode).toEqual(400);
});

test('Testing default case', () => {
  requestClear();

  const maiyaUser = requestAuthRegister(authMaiya[0], authMaiya[1], authMaiya[2], authMaiya[3]);
  const maiyaToken = maiyaUser.bodyObj.token;
  const maiyaId = maiyaUser.bodyObj.authUserId;
  const danielUser = requestAuthRegister(authDaniel[0], authDaniel[1], authDaniel[2], authDaniel[3]);
  const danielToken = danielUser.bodyObj.token;
  const danielId = danielUser.bodyObj.authUserId;

  const maiyaInfo = {
    uId: maiyaId,
    email: 'maiyaTaylor@gmail.com',
    nameFirst: 'Maiya',
    nameLast: 'Taylor',
    handleStr: 'maiyataylor',
    profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
  };

  const danielInfo = {
    uId: danielId,
    email: 'danielYung@gmail.com',
    nameFirst: 'Daniel',
    nameLast: 'Yung',
    handleStr: 'danielyung',
    profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
  };

  expect(requestUserProfile(danielToken, danielId).bodyObj).toMatchObject(danielInfo);
  const obj1 = requestUserProfile(maiyaToken, maiyaId);
  expect(obj1.bodyObj).toMatchObject(maiyaInfo);
  expect(obj1.res.statusCode).toBe(OK);
});

// ======================================== requestUserProfileSetName Testing ========================================

describe('Testing for requestUserProfileSetName', () => {
  afterEach(() => {
    requestClear();
  });
  test('Test 1 affirmitive', () => {
    // all should be well
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetName(testToken, 'Jonathan', 'Schmidt');
    expect(response.res.statusCode).toBe(OK);
    const expectedObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'Jonathan',
      nameLast: 'Schmidt',
      handleStr: 'johnsmith',
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
    };
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(expectedObject);
  });

  test('Test 2 invalid nameFirst', () => {
    // error
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetName(testToken, '', 'Schmidt');
    expect(response.res.statusCode).toBe(400);
    expect(response.bodyObj.error).toStrictEqual({ message: 'invalid input details' });
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual({
      email: 'who.is.joe@is.the.question.com',
      uId: testUserId,
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith',
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
    });
  });

  test('Test 3 invalid nameLast', () => {
    // error
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetName(testToken, 'Jonathan', 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz');
    expect(response.res.statusCode).toBe(400);
    expect(response.bodyObj.error).toStrictEqual({ message: 'invalid input details' });
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual({
      email: 'who.is.joe@is.the.question.com',
      uId: testUserId,
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith',
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
    });
  });
});

// ======================================== requestUserProfileSetEmail Testing ========================================
describe('Testing for requestUserProfileSetEmail', () => {
  afterEach(() => {
    requestClear();
  });
  test('Test 1 affirmitive', () => {
    // all should be well
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetEmail(testToken, 'something@gmail.com');
    expect(response.res.statusCode).toBe(OK);
    const expectedObject = {
      uId: testUserId,
      email: 'something@gmail.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith',
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
    };
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(expectedObject);
  });

  test('Test 2 invalid email', () => {
    // error
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetEmail(testToken, '');
    expect(response.res.statusCode).toBe(400);
    expect(response.bodyObj.error).toStrictEqual({ message: 'invalid input details' });
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual({
      email: 'who.is.joe@is.the.question.com',
      uId: testUserId,
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith',
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
    });
  });
});

// ======================================== requestUserProfileSetHandle Testing ========================================
describe('Testing for requestUserProfileSetHandle', () => {
  afterEach(() => {
    requestClear();
  });
  test('Test 1 affirmitive', () => {
    // all should be well
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetHandle(testToken, 'BigChungas2000');
    expect(response.res.statusCode).toBe(OK);
    const expectedObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'BigChungas2000',
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
    };
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(expectedObject);
  });

  test('Test 2 invalid handle', () => {
    // error
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetHandle(testToken, '');
    expect(response.res.statusCode).toBe(400);
    expect(response.bodyObj.error).toStrictEqual({ message: 'invalid input details' });
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual({
      email: 'who.is.joe@is.the.question.com',
      uId: testUserId,
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith',
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
    });
  });

  test('Test 3 occupied handle', () => {
    // all should be well
    requestAuthRegister('something@gmail.com', 'th1sp4ssw0rd', 'big', 'chungas');
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetHandle(testToken, 'bigchungas');
    expect(response.res.statusCode).toBe(400);
    const expectedObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith',
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
    };
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(expectedObject);
  });

  test('Test 4 negative non-existant token', () => {
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUserProfileSetHandle('incorrecttoken', 'bigchungas');
    expect(response.res.statusCode).toBe(403);
    const expectedObject = {
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith',
      profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
    };
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual(expectedObject);
  });
});

// ======================================== requestUsersAll Testing ========================================

describe('Testing for requestUsersAll', () => {
  afterEach(() => {
    requestClear();
  });
  test('Test 1 affirmitive multiple users', () => {
    // all should be well
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith');
    const uId2 = requestAuthRegister('z5420895@ad.unsw.edu.au', 'myrealpassword', 'Jonathan', 'Schmidt').bodyObj.authUserId;
    const uId3 = requestAuthRegister('validemail@gmail.com', '123abc123', 'John', 'Doe').bodyObj.authUserId;
    const response = requestUsersAll(returnObject.bodyObj.token);
    expect(response.res.statusCode).toBe(OK);
    expect(requestUsersAll(returnObject.bodyObj.token).bodyObj.users).toStrictEqual([
      {
        uId: returnObject.bodyObj.authUserId,
        email: 'who.is.joe@is.the.question.com',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'johnsmith',
        profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
      }, {
        uId: uId2,
        email: 'z5420895@ad.unsw.edu.au',
        nameFirst: 'Jonathan',
        nameLast: 'Schmidt',
        handleStr: 'jonathanschmidt',
        profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
      }, {
        uId: uId3,
        email: 'validemail@gmail.com',
        nameFirst: 'John',
        nameLast: 'Doe',
        handleStr: 'johndoe',
        profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
      }
    ]);
  });

  test('Test 2 affirmitive one user', () => {
    // all should be well
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith');
    const response = requestUsersAll(returnObject.bodyObj.token);
    expect(response.res.statusCode).toBe(OK);
    expect(requestUsersAll(returnObject.bodyObj.token).bodyObj.users).toStrictEqual([
      {
        uId: returnObject.bodyObj.authUserId,
        email: 'who.is.joe@is.the.question.com',
        nameFirst: 'John',
        nameLast: 'Smith',
        handleStr: 'johnsmith',
        profileImgUrl: `${url}:${port}/imgurl/default.jpg`,
      }
    ]);
  });

  test('Test 3 invalid token', () => {
    requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith');
    const response = requestUsersAll('incorrecttonken');
    expect(response.res.statusCode).toBe(403);
    expect(response.bodyObj.error).toStrictEqual({ message: 'Invalid token' });
  });
});

// ======================================== requestUploadPhoto Testing ========================================

describe('Testing for requestUploadPhoto', () => {
  requestClear();
  test('Test 1 affirmitive', () => {
    // all should be well
    const profileImgUrl = 'http://vignette1.wikia.nocookie.net/comicdc/images/a/a6/Superman-wallpapers_3097_1600.jpg/revision/latest?cb=20110827193320&path-prefix=es';
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testUserId = returnObject.authUserId;
    const testToken = returnObject.token;
    const response = requestUploadPhoto(profileImgUrl, 15, 15, 1600, 1080, testToken);
    expect(response.res.statusCode).toBe(OK);
    let testImgUrl = requestUserProfile(testToken, testUserId).bodyObj.profileImgUrl;
    while (testImgUrl === `${url}:${port}/imgurl/default.jpg`) {
      testImgUrl = requestUserProfile(testToken, testUserId).bodyObj.profileImgUrl;
    }
    const res = request(
      'GET',
      testImgUrl
    );
    expect(res.statusCode).toBe(OK);
    expect(requestUserProfile(testToken, testUserId).bodyObj).toStrictEqual({
      uId: testUserId,
      email: 'who.is.joe@is.the.question.com',
      nameFirst: 'John',
      nameLast: 'Smith',
      handleStr: 'johnsmith',
      profileImgUrl: expect.any(String),
    });
    const urlProfile = requestUserProfile(testToken, testUserId).bodyObj.profileImgUrl;
    let urlUuid = urlProfile.replace(`${url}:${port}/imgurl/`, '');
    urlUuid = urlUuid.replace(/jpg$/, '');
    urlUuid = urlUuid.replace('.', '');
    const deletionUrl = `${__dirname}/profilePics/${urlUuid}.jpg`;
    fs.unlinkSync(deletionUrl);
    requestClear();
  });

  test('Test 2 coverge of errors', () => {
    requestClear();
    const profileImgUrl = 'http://vignette1.wikia.nocookie.net/comicdc/images/a/a6/Superman-wallpapers_3097_1600.jpg/revision/latest?cb=20110827193320&path-prefix=es';
    const returnObject = requestAuthRegister('who.is.joe@is.the.question.com', 'yourmumma', 'John', 'Smith').bodyObj;
    const testToken = returnObject.token;

    const response1 = requestUploadPhoto(profileImgUrl, 15, 15, 14, 14, testToken);
    expect(response1.res.statusCode).toBe(400);
    expect(response1.bodyObj.error).toStrictEqual({ message: 'cropping coordinates are invalid' });

    const response2 = requestUploadPhoto(profileImgUrl, -1, 15, 1920, 1080, testToken);
    expect(response2.res.statusCode).toBe(400);
    expect(response2.bodyObj.error).toStrictEqual({ message: 'cropping coordinates are invalid' });

    const profileImgUrlAlt = 'http://www.clipartbest.com/cliparts/4T9/6ne/4T96nenrc.png';
    const response3 = requestUploadPhoto(profileImgUrlAlt, 15, 15, 1600, 1353, testToken);
    expect(response3.res.statusCode).toBe(400);
    expect(response3.bodyObj.error).toStrictEqual({ message: 'image uploaded is not a JPG' });

    const response4 = requestUploadPhoto(profileImgUrl, 15, 15, 1920, 1080, 'invalidToken');
    expect(response4.res.statusCode).toBe(403);
    expect(response4.bodyObj.error).toStrictEqual({ message: 'Invalid token' });

    const response5 = requestUploadPhoto(profileImgUrl, 15, 15, 1921, 1081, testToken);
    expect(response5.res.statusCode).toBe(400);
    expect(response5.bodyObj.error).toStrictEqual({ message: 'cropping coordinates are invalid' });
    requestClear();
  });
});
