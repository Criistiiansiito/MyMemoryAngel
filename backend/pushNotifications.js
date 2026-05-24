async function sendPushNotifications(
    tokens,
    {
        title,
        body,
        data = {},
        sound = 'default',
        channelId = 'default',
        categoryId,
        priority = 'high',
    }
) {
    const { Expo } = await import('expo-server-sdk');
    const expo = new Expo();

    const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

    if (validTokens.length === 0) {
        return { tickets: [], invalidTokens: tokens };
    }

    const messages = validTokens.map((token) => ({
        to: token,
        title,
        body,
        data,
        priority,
        channelId,
        ...(sound !== undefined ? { sound } : {}),
        ...(categoryId ? { categoryId } : {}),
    }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
            ticketChunk
                .filter((ticket) => ticket.status === 'error')
                .forEach((ticket) => {
                    console.error('Error en ticket push:', ticket);
                });
        } catch (error) {
            console.error('Error enviando push chunk:', error);
        }
    }

    return { tickets, invalidTokens: [] };
}

module.exports = { sendPushNotifications };
