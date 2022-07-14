import { getData, setData } from './dataStore';

export function MessagesLength(channelId) {
    let data = getData();
    const channelIndex = data.channel.findIndex(a => a.channelId === channelId);
    messageAmount = data.channel[channelIndex].messages.length;
}

export function channelMessagesv2(token, channelId, start) {
    let data = getData();

    //checking for valid dmId
    const channelIndex = data.channel.findIndex(a => a.channelId === channelId)
    if (channelIndex === -1) return {error: 'error'};

    //checking that member is authorised user of DM
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