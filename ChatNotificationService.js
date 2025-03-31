import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { ToastAndroid, Alert, Platform } from 'react-native';

// Store active listeners so we can clean them up
const activeListeners = {};

// Store navigation reference globally
let navigationRef = null;

// Set the navigation reference from any component
export const setNavigationRef = (navRef) => {
    navigationRef = navRef;
};

// Navigate using the global reference
export const navigateToChat = (chatParams) => {
    if (!navigationRef) {
        console.warn('Navigation reference not set. Cannot navigate to chat.');
        return;
    }

    // Navigate using the stored reference
    navigationRef.navigate('Chat', chatParams);
};

// Initialize chat notifications listener for a user
export const initChatNotifications = (userId) => {
    if (!userId) return null;

    // Only set up if not already listening
    if (activeListeners[userId]) {
        return activeListeners[userId];
    }

    try {
        // Listen for chats with unread messages
        const userChatsRef = collection(db, 'users', userId, 'chats');
        const q = query(
            userChatsRef,
            where('unreadCount', '>', 0),
            orderBy('unreadCount', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                // Only notify on new or modified documents with unread messages
                if (change.type === 'added' || change.type === 'modified') {
                    const chat = change.doc.data();

                    // Skip notification if no unread messages
                    if (!chat.unreadCount || chat.unreadCount <= 0) return;

                    // Show notification for new message
                    showChatNotification(
                        chat.userName,
                        chat.lastMessage || 'New message',
                        () => {
                            // Navigate to the chat when notification is tapped
                            const chatParams = {
                                chatId: change.doc.id,
                                userId: chat.userId,
                                userName: chat.userName
                            };
                            navigateToChat(chatParams);
                        }
                    );
                }
            });
        });

        // Store the listener reference
        activeListeners[userId] = unsubscribe;

        return unsubscribe;
    } catch (error) {
        console.error('Error setting up chat notifications:', error);
        return null;
    }
};

// Remove notification listener
export const removeChatNotifications = (userId) => {
    if (activeListeners[userId]) {
        activeListeners[userId]();
        delete activeListeners[userId];
    }
};

// Show notification using Toast for Android and Alert for iOS
export const showChatNotification = (sender, message, onPress) => {
    if (Platform.OS === 'android') {
        // For Android, show a toast and handle tap
        ToastAndroid.showWithGravity(
            `${sender}: ${message}`,
            ToastAndroid.LONG,
            ToastAndroid.TOP
        );

        // Android doesn't directly support tapping on toast, 
        // so here we'd ideally show a proper notification
        // For simplicity, we'll auto-navigate after a short delay
        if (onPress) {
            setTimeout(onPress, 1000);
        }
    } else {
        // For iOS use Alert with actions
        Alert.alert(
            `Message from ${sender}`,
            message,
            [
                {
                    text: "View",
                    onPress: onPress
                },
                {
                    text: "Dismiss",
                    style: "cancel"
                }
            ]
        );
    }
}; 