```javascript
// In the database, there are arrays of object user, and arrays of object channel

const data_base = {
    user: [
        {
            user_id: 10,
            email: 'student@unsw.com',
            password: 'password',
            first_name: 'John',
            last_name: 'Doe',
            // possible usage of handle variable
            // handle_name: 'a handle'
        }
    ]

    channel: [
        {
            channel_id: 999,
            channel_name: 'channel',
            // predicting we might need to make auth_id an array of auth_ids
            // i.e. auth_id: [1, 3, 6, 9, 12]
            auth_id: 1,
            is_public: true,
            start: 0,
            message: 'Hello world",
        }
    ]
}


```
