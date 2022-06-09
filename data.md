```javascript
// In the database, there are arrays of object user, and arrays of object channel

const data_base = {
    user: [
        {
            uId: 10,
            email: 'student@unsw.com',
            password: 'password',
            nameFirst: 'John',
            nameLast: 'Doe',
            // possible usage of handle variable
            // handle_name: 'a handle'
        }
    ]

    channel: [
        {
            channelId: 999,
            channelName: 'channel',
            // predicting we might need to make auth_id an array of auth_ids
            // i.e. auth_id: [1, 3, 6, 9, 12]
            authId: 1,
            isPublic: true,
            start: 0,
            message: 'Hello world",
        }
    ]
}


```
