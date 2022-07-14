import { getData, setData } from './dataStore';

/*
This function returns the amount of messages in a specified channel
Arguments: 
    channelId (number) - specifying the channel

Return: 
    messageAmount (number) - amount of messages
*/

export function MessagesLength(channelId: number) {
    const data = getData();
    const channelIndex = data.channel.findIndex(a => a.channelId === channelId);
    messageAmount = data.channel[channelIndex].messages.length;
    return messageAmount;
}

/*
This function returns 50 messages in a specified channel from a specified startpoint

Arguments: 
    token (string) - to determine if valid user requesting function
    channelId(number) - to specify the channel 
    start (number) - to specify where we start from 

Return: 
    Returns {error: 'error'} if invalid dmId, unauthorised member or start > 
    messages in channel
    Returns an array of messages, start and end indexes if successful

*/
export function channelMessagesv2(token: string, channelId: number, start: number) {
    let data = getData();

    //checking for valid channelId
    const channelIndex = data.channel.findIndex(a => a.channelId === channelId)
    if (channelIndex === -1) return {error: 'error'};

    //checking that member is authorised user of channel
    const tokenIndex = data.token.findIndex(a => a.token === token);
    if (tokenIndex === -1) return {error: 'error'}; 
    
    const uId = data.token[tokenIndex].uId;
    const memberIndex = data.channel[channelIndex].members.findIndex(a => a.uId === uId);

    if (memberIndex === -1) return {error: 'error'};

    //checking whether start index is greater than the amount of messages 
    messageAmount = data.channel[channelIndex].messages.length;

    if (start > messageAmount) {
        return {error: 'error'};
    } 

    //Storing start + 50 amount of messages in a new array to be returned 
    let returnMessages = [];

    for (let i = 0; i < start + 50; i++) {
        returnMessages[i] = data.channel[channelIndex].messages[i];
    }
    
    //Checking whether there are less messages than the endIndex
    const endIndex = start + 50;
    if (messageAmount < endIndex) endIndex = -1;


    return {returnMessages, start, endIndex};
}