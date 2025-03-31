import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { db, auth } from './firebase';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';

const ChatIcon = ({ navigation }) => {
    const { theme } = useTheme();
    const { userID } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);

    // Ensure user document exists before attempting to listen for chat messages
    useEffect(() => {
        const setupUserDocument = async () => {
            // Skip if already initialized or no user ID
            if (isInitialized || !userID) return;

            try {
                // Get the authenticated user
                const currentUser = auth.currentUser;
                if (!currentUser) return;

                // Check if user document exists
                const userDocRef = doc(db, 'users', userID);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    console.log("Creating user document for chat", userID);
                    await setDoc(userDocRef, {
                        email: currentUser.email || '',
                        createdAt: new Date()
                    });
                }

                setIsInitialized(true);
            } catch (error) {
                console.error("Error setting up user document:", error);
            }
        };

        setupUserDocument();
    }, [userID, isInitialized]);

    // Listen for unread message count
    useEffect(() => {
        if (!userID || !isInitialized) return;

        try {
            console.log("Setting up chat listener for user:", userID);
            const userChatsRef = collection(db, 'users', userID, 'chats');
            const q = query(userChatsRef, where('unreadCount', '>', 0));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                let count = 0;
                snapshot.forEach(doc => {
                    count += doc.data().unreadCount || 0;
                });
                setUnreadCount(count);
                console.log("Unread message count:", count);
            }, (error) => {
                console.error("Error in chat listener:", error);
            });

            return unsubscribe;
        } catch (error) {
            console.error("Error setting up chat listener:", error);
        }
    }, [userID, isInitialized]);

    const handleIconPress = () => {
        // Navigate to Messages screen to see all chats and users
        navigation.navigate('Messages');
    };

    // If no user is logged in, don't show the icon
    if (!userID || !auth.currentUser) return null;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handleIconPress}
        >
            <View style={styles.iconContainer}>
                <Text style={[styles.icon, { color: theme.text }]}>💬</Text>
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: 15,
    },
    iconContainer: {
        position: 'relative',
    },
    icon: {
        fontSize: 24,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -8,
        backgroundColor: '#ff6666',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 3,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default ChatIcon; 