const { Expo } = require('expo-server-sdk');

  const expo = new Expo();

  async function sendPushNotifications(tokens, { title, body, data = {} }) {
    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
      return { tickets: [], invalidTokens: tokens };
    }

    const messages = validTokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error enviando push chunk:', error);
      }
    }

    return {
      tickets,
      invalidTokens: tokens.filter((token) => !Expo.isExpoPushToken(token)),
    };
  }

  module.exports = {
    sendPushNotifications,
  };