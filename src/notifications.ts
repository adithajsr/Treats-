import { getData, setData } from './dataStore'
import HTTPError from 'http-errors';

export function notificationsGetV1(token: string) {
    const data = getData();
    
    //finding correct user 
    const tokenIndex = data.token.findIndex(a => a.token === token);
    if (tokenIndex === -1) throw HTTPError(403, 'Invalid token');
    const uId = data.token[tokenIndex].uId;
    const userIndex = data.user.findIndex(a => a.uId === uId);

    let notifications = [];
    const notificationNumber = data.user[userIndex].notifications.length;

   // for (let i = notificationNumber - 1; i > notificationNumber - 20; i--) {
        notifications.push(data.user[userIndex].notifications[0]);
   // }
    
    return notifications;
}