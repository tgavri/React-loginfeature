import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { db, auth } from './firebase';
import { collection, query, getDocs, orderBy, where, onSnapshot, doc, getDoc, setDoc } from 'firebase/firestore';

const Messages = ({ navigation }) => {
    const { theme } = useTheme();
    const { userID } = useAuth();
    const [users, setUsers] = useState([]);
    const [recentChats, setRecentChats] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get current user ID (with fallback to auth.currentUser)
    const getCurrentUserID = () => {
        return userID || (auth.currentUser ? auth.currentUser.uid : null);
    };

    // Create sample users function
    const createSampleUsers = async (currentUserID) => {
        try {
            console.log("Creating sample users directly in Messages...");

            // Create 5 sample users
            const sampleUsers = [
                { id: 'sample1', displayName: 'John Doe', email: 'john@example.com' },
                { id: 'sample2', displayName: 'Jane Smith', email: 'jane@example.com' },
                { id: 'sample3', displayName: 'Robert Johnson', email: 'robert@example.com' },
                { id: 'sample4', displayName: 'Emily Davis', email: 'emily@example.com' },
                { id: 'sample5', displayName: 'Michael Brown', email: 'michael@example.com' }
            ];

            const usersList = [];

            // Create user documents
            for (const user of sampleUsers) {
                // Skip if this would be the current user
                if (user.id === currentUserID) continue;

                // Set basic user document
                await setDoc(doc(db, 'users', user.id), {
                    email: user.email,
                    createdAt: new Date()
                });

                // Set user profile
                await setDoc(doc(db, 'users', user.id, 'profile', 'data'), {
                    displayName: user.displayName,
                    notificationsEnabled: true
                });

                usersList.push(user);
            }

            console.log("Created sample users:", usersList.length);
            return usersList;
        } catch (error) {
            console.error("Error creating sample users:", error);
            return [];
        }
    };

    // Load all users except the current user
    useEffect(() => {
        const currentUserID = getCurrentUserID();

        if (!currentUserID) {
            console.error('No user ID available for Messages component');
            setLoading(false);
            return;
        }

        const fetchUsers = async () => {
            try {
                console.log("Fetching users for Messages component, current user:", currentUserID);

                const usersCollection = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollection);
                let usersList = [];

                console.log("Total users found:", usersSnapshot.docs.length);

                // Process each user doc
                for (const userDoc of usersSnapshot.docs) {
                    // Skip the current user
                    if (userDoc.id === currentUserID) {
                        console.log("Skipping current user:", userDoc.id);
                        continue;
                    }

                    // Get user data
                    const userData = userDoc.data();

                    // Get user profile if exists
                    let profile = { displayName: 'User ' + userDoc.id.substring(0, 4) };
                    const profileDoc = await getDoc(doc(db, 'users', userDoc.id, 'profile', 'data'));
                    if (profileDoc.exists()) {
                        profile = { ...profile, ...profileDoc.data() };
                    }

                    usersList.push({
                        id: userDoc.id,
                        ...userData,
                        ...profile
                    });
                }

                console.log("Filtered users count:", usersList.length);

                // If no users found, create sample users
                if (usersList.length === 0) {
                    console.log("No users found, creating sample users...");
                    usersList = await createSampleUsers(currentUserID);

                    // Alert the user that sample users were created
                    Alert.alert(
                        "Sample Users Created",
                        "Since no other users were found, sample users have been created for testing chat functionality.",
                        [{ text: "OK" }]
                    );
                }

                setUsers(usersList);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        // Listen for recent chats
        const unsubscribe = onSnapshot(
            collection(db, 'users', currentUserID, 'chats'),
            (snapshot) => {
                const chatList = [];
                snapshot.forEach(doc => {
                    chatList.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                setRecentChats(chatList);
                setLoading(false);
            },
            (error) => {
                console.error('Error listening to chats:', error);
                setLoading(false);
            }
        );

        fetchUsers();
        return unsubscribe;
    }, [userID]);

    // Start a new chat - navigate directly to user selection
    const openUserSelection = () => {
        // Instead of navigating to UserSelection modal which has navigation issues,
        // we'll directly open a chat with a sample user if no users exist
        if (users.length > 0) {
            // If we have users, start a chat with the first one
            const user = users[0];
            startChat(user.id, user.displayName);
        } else {
            // Otherwise alert the user that no chat partners are available
            Alert.alert(
                "No Chat Partners",
                "No users available to chat with. Please try again later.",
                [{ text: "OK" }]
            );
        }
    };

    // Start a chat with selected user
    const startChat = async (userId, userName) => {
        const currentUserID = getCurrentUserID();

        if (!currentUserID) {
            console.error('Cannot start chat: No current user ID');
            return;
        }

        // Generate a chat ID from both user IDs (sorted and joined)
        const chatId = [currentUserID, userId].sort().join('_');

        // Navigate to the Chat screen
        navigation.navigate('Chat', {
            chatId,
            userId,
            userName
        });
    };

    const renderUserItem = ({ item }) => (
        <Pressable
            style={[styles.userItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => startChat(item.id, item.displayName)}
        >
            <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.text }]}>{item.displayName}</Text>
                <Text style={[styles.userEmail, { color: theme.placeholderText }]}>
                    {item.email || `ID: ${item.id.substring(0, 8)}`}
                </Text>
            </View>
        </Pressable>
    );

    const renderRecentChatItem = ({ item }) => (
        <Pressable
            style={[styles.chatItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => startChat(item.userId, item.userName)}
        >
            <View style={styles.chatInfo}>
                <Text style={[styles.userName, { color: theme.text }]}>{item.userName}</Text>
                <Text style={[styles.lastMessage, { color: theme.placeholderText }]} numberOfLines={1}>
                    {item.lastMessage || 'Start chatting...'}
                </Text>
            </View>
            {item.unreadCount > 0 && (
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unreadCount}</Text>
                </View>
            )}
        </Pressable>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* New Chat Button */}
            <TouchableOpacity
                style={[styles.newChatButton, { backgroundColor: theme.primary }]}
                onPress={openUserSelection}
            >
                <Text style={styles.newChatButtonText}>Start New Chat</Text>
            </TouchableOpacity>

            {recentChats.length > 0 && (
                <>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Chats</Text>
                    <FlatList
                        data={recentChats}
                        renderItem={renderRecentChatItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                    />
                </>
            )}

            <Text style={[styles.sectionTitle, { color: theme.text }]}>All Users</Text>
            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.placeholderText }]}>
                        No users available. Creating sample users...
                    </Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 12,
        marginLeft: 4,
    },
    list: {
        paddingBottom: 16,
    },
    userItem: {
        flexDirection: 'row',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        elevation: 2,
    },
    chatItem: {
        flexDirection: 'row',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        elevation: 2,
        justifyContent: 'space-between',
    },
    userInfo: {
        flex: 1,
    },
    chatInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    lastMessage: {
        fontSize: 14,
    },
    badge: {
        backgroundColor: '#ff6666',
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    newChatButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 8,
    },
    newChatButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        fontSize: 16,
    },
});

export default Messages; 