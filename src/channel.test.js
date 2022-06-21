import { channelJoinV1, channelInviteV1, channelDetailsV1, channelMessagesV1 } from './channel';
import { clearV1 } from './other';
import { validate as uuidValidate } from 'uuid';

// return error when 
// channelId doesn't refer to a valid channel
// channelId is valid and the authorised user is not a member of the channel

// return type if no error: name, isPublic, ownerMembers, allMembers

// channelDetailsV1
// Given a channel with ID channelId that the authorised user is a member of, provide basic details about the channel.


// tests
// ensure errors are returned for invalid channel
// ensure errors are returned for authorised user isn't a member of the channel but channelId is valid
// check that a valid channelId with an authorised user that is a member returns channel details



describe (channelDetailsV1 check) {

    beforeEach(() => {
        clearV1();
    });
    
    test('test error returned on invalid channel', () => {

        let result = channelDetailsV1()


    });

    test('test error returned on non-member authorised user', () => {

        let result = channelDetailsV1()


    });

    test('test successful return', () => {

        let result = channelDetailsV1()


    });


  

}