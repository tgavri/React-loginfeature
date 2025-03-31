import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync() {
    let token;

    try {
        if (Platform.OS === 'android') {
            // Set notification channel for Android
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            // Check for existing permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // If no existing permission, request it
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            // If permission not granted, return
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            // Get the token - use the simpler version that's compatible with all Expo versions
            token = await Notifications.getExpoPushTokenAsync();

            console.log('Push token:', token);
        } else {
            console.log('Must use physical device for push notifications');
        }

        return token?.data;
    } catch (error) {
        console.error('Error registering for push notifications:', error);
        return null;
    }
}

// Save the user's push token to Firestore
export async function savePushToken(userId, token) {
    if (!userId || !token) return;

    try {
        await setDoc(doc(db, 'users', userId, 'settings', 'notifications'), {
            pushToken: token,
            updatedAt: new Date(),
            notificationsEnabled: true
        }, { merge: true });
        console.log('Push token saved successfully for user:', userId);
    } catch (error) {
        console.error('Error saving push token:', error);
    }
}

// Toggle notifications for a user
export async function toggleNotifications(userId, enabled) {
    if (!userId) return;

    try {
        await setDoc(doc(db, 'users', userId, 'settings', 'notifications'), {
            notificationsEnabled: enabled,
            updatedAt: new Date(),
        }, { merge: true });
        console.log('Notification settings updated for user:', userId);
        return true;
    } catch (error) {
        console.error('Error updating notification settings:', error);
        return false;
    }
}

// Get notification settings for a user
export async function getNotificationSettings(userId) {
    if (!userId) return { notificationsEnabled: false };

    try {
        const docRef = doc(db, 'users', userId, 'settings', 'notifications');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return { notificationsEnabled: false };
        }
    } catch (error) {
        console.error('Error getting notification settings:', error);
        return { notificationsEnabled: false };
    }
}

// Send a local notification
export async function sendLocalNotification(title, body, data = {}) {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
            },
            trigger: null, // Sends the notification immediately
        });
    } catch (error) {
        console.error('Error sending local notification:', error);
    }
}

// Example function to send a welcome notification
export async function sendWelcomeNotification(username) {
    try {
        await sendLocalNotification(
            'Welcome to the App!',
            `Hi ${username || 'there'}, we're glad to have you with us.`,
            { type: 'welcome' }
        );
    } catch (error) {
        console.error('Error sending welcome notification:', error);
    }
}

// Example function to send a note created notification
export async function sendNoteCreatedNotification() {
    try {
        await sendLocalNotification(
            'Note Created!',
            'Your note has been saved successfully.',
            { type: 'note_created' }
        );
    } catch (error) {
        console.error('Error sending note created notification:', error);
    }
} 