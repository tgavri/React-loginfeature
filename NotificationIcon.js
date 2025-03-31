import React, { useState, useEffect } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { useTheme } from './ThemeContext';
import { getNotificationSettings } from './NotificationService';
import { useAuth } from './AuthContext';

const NotificationIcon = ({ onPress }) => {
    const { theme } = useTheme();
    const { userID } = useAuth();
    const [hasUnread, setHasUnread] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        if (userID) {
            loadNotificationSettings();

            // For demo purposes, simulate new notifications every 30 seconds
            const interval = setInterval(() => {
                if (notificationsEnabled) {
                    setHasUnread(true);
                }
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [userID, notificationsEnabled]);

    async function loadNotificationSettings() {
        const settings = await getNotificationSettings(userID);
        setNotificationsEnabled(settings.notificationsEnabled || false);
    }

    const handlePress = () => {
        setHasUnread(false);
        if (onPress) onPress();
    };

    // If notifications are disabled, don't show the icon
    if (!notificationsEnabled) return null;

    return (
        <Pressable
            style={styles.container}
            onPress={handlePress}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
            <View style={[styles.icon, { borderColor: theme.text }]}>
                <Text style={[styles.iconText, { color: theme.text }]}>🔔</Text>
            </View>
            {hasUnread && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>●</Text>
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 8,
        marginRight: 10,
        position: 'relative',
    },
    icon: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 20,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 2,
        backgroundColor: 'red',
        borderRadius: 10,
        width: 10,
        height: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
    },
});

export default NotificationIcon; 