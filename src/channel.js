function channelDetailsV1(authUserId, channelId) {
  return {
    name: 'secret candy crush team', 
    isPublic: true,
    ownerMembers: [],
    allMembers: [],
  };
}

function channelJoinV1(authUserId, channelId) {
  return {};
}

function channelInviteV1(authUserId, channelId, uId) {
  return {};
}


function channelMessagesV1(authUserId, channelId, start) {
	for (let element in data.channel) {
		if (channelId = data.channel[element].channelId) {
			for (let count in data.channel[element].members)
				if (data.channel[element].members[count].uId = authUserId) {
					//Error check if start is greater than no. of msgs in channel
					if (start > data.channel[element].messages.length) return {error: 'error'};
			
					//Creating new array to store start + 50 messages in
					let messages = [];
					let i = start;
					let j = 0;

					while (i < start + 50) {
						//If start + 50 is greater than number of msgs in channel
						if (i > data.channel[element].messages.length) {
							i = -1;
							break;
						} 
						//Copying messages into array 
						messages[j] = data.channel[element].messages[i]
						i++;
						j++;
					}

					let returnValue = {
						messages: messages, 
						start: start,
						end: i
					}

					return returnValue;
				}
		}
	}

	//If channelId not found or authUserId not part of channelId valid members
	return {error: 'error'};
}


export { channelDetailsV1, channelJoinV1, channelInviteV1, channelMessagesV1 };
