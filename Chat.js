import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ToastAndroid,
    Alert
} from 'react-native';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { db, auth } from './firebase';
import {
    collection,
    doc,
    addDoc,
    setDoc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    getDoc,
} from 'firebase/firestore';

const Chat = ({ route, navigation }) => {
    const { chatId, userId, userName } = route.params;
    const { theme } = useTheme();
    const { userID } = useAuth();
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentUserName, setCurrentUserName] = useState('Me');
    const flatListRef = useRef(null);

    // Set chat title
    useEffect(() => {
        if (userName) {
            navigation.setOptions({
                title: `Chat with ${userName}`
            });
        }
    }, [navigation, userName]);

    // Get current user's display name
    useEffect(() => {
        const getUserProfile = async () => {
            try {
                // Make sure we have a valid userID
                const currentUserID = userID || (auth.currentUser ? auth.currentUser.uid : null);

                if (!currentUserID) {
                    console.error('No user ID available');
                    return;
                }

                // Check if user profile exists
                const profileDoc = await getDoc(doc(db, 'users', currentUserID, 'profile', 'data'));

                if (profileDoc.exists()) {
                    setCurrentUserName(profileDoc.data().displayName || 'Me');
                } else {
                    // Create profile if it doesn't exist
                    const user = auth.currentUser;
                    if (user) {
                        const displayName = user.displayName || user.email?.split('@')[0] || `User ${user.uid.substring(0, 4)}`;

                        await setDoc(doc(db, 'users', user.uid, 'profile', 'data'), {
                            displayName: displayName,
                            notificationsEnabled: true
                        }, { merge: true });

                        setCurrentUserName(displayName);
                    }
                }
            } catch (error) {
                console.error('Error fetching/creating user profile:', error);
            }
        };

        getUserProfile();
    }, [userID]);

    // Mark chat as read when opened
    useEffect(() => {
        const markChatAsRead = async () => {
            try {
                // Make sure we have a valid userID
                const currentUserID = userID || (auth.currentUser ? auth.currentUser.uid : null);

                if (!currentUserID) {
                    console.error('No user ID available for marking chat as read');
                    return;
                }

                await setDoc(
                    doc(db, 'users', currentUserID, 'chats', chatId),
                    {
                        userId,
                        userName,
                        lastOpened: serverTimestamp(),
                        unreadCount: 0
                    },
                    { merge: true }
                );

                console.log(`Chat ${chatId} marked as read for user ${currentUserID}`);
            } catch (error) {
                console.error('Error marking chat as read:', error);
            }
        };

        markChatAsRead();
    }, [chatId, userId, userName, userID]);

    // Listen for messages in this chat
    useEffect(() => {
        const chatRef = collection(db, 'chats', chatId, 'messages');
        const q = query(chatRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messageList = [];

            snapshot.forEach(doc => {
                messageList.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            setMessages(messageList);
            setLoading(false);

            // Scroll to bottom when new messages arrive
            if (flatListRef.current && messageList.length > 0) {
                setTimeout(() => {
                    flatListRef.current.scrollToEnd({ animated: true });
                }, 100);
            }
        }, (error) => {
            console.error('Error listening to messages:', error);
            setLoading(false);
        });

        return unsubscribe;
    }, [chatId]);

    // Send a message
    const sendMessage = async () => {
        if (!inputText.trim()) return;

        try {
            // Make sure we have a valid userID
            const currentUserID = userID || (auth.currentUser ? auth.currentUser.uid : null);

            if (!currentUserID) {
                showNotification('Error', 'Cannot send message. User not authenticated.');
                return;
            }

            // Add message to the chat collection
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: inputText.trim(),
                senderId: currentUserID,
                senderName: currentUserName,
                timestamp: serverTimestamp(),
            });

            // Update sender's chat reference
            await setDoc(
                doc(db, 'users', currentUserID, 'chats', chatId),
                {
                    userId,
                    userName,
                    lastMessage: inputText.trim(),
                    lastUpdated: serverTimestamp(),
                    lastOpened: serverTimestamp(),
                    unreadCount: 0
                },
                { merge: true }
            );

            // Update recipient's chat reference with unread count
            const recipientChatRef = doc(db, 'users', userId, 'chats', chatId);
            const recipientChatDoc = await getDoc(recipientChatRef);

            const unreadCount = recipientChatDoc.exists()
                ? (recipientChatDoc.data().unreadCount || 0) + 1
                : 1;

            await setDoc(
                recipientChatRef,
                {
                    userId: currentUserID,
                    userName: currentUserName,
                    lastMessage: inputText.trim(),
                    lastUpdated: serverTimestamp(),
                    unreadCount
                },
                { merge: true }
            );

            // Clear input
            setInputText('');
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('Error', 'Failed to send message. Please try again.');
        }
    };

    // Show notification
    const showNotification = (title, message) => {
        if (Platform.OS === 'android') {
            ToastAndroid.showWithGravity(
                message,
                ToastAndroid.LONG,
                ToastAndroid.CENTER
            );
        } else {
            // For iOS use Alert
            Alert.alert(title, message);
        }
    };

    // Render each message
    const renderMessage = ({ item }) => {
        const isCurrentUser = item.senderId === userID;

        return (
            <View
                style={[
                    styles.messageContainer,
                    isCurrentUser ? styles.sentMessage : styles.receivedMessage,
                    {
                        backgroundColor: isCurrentUser ? theme.primary : theme.card,
                        borderColor: theme.border
                    }
                ]}
            >
                <Text style={[styles.messageText, { color: isCurrentUser ? '#fff' : theme.text }]}>
                    {item.text}
                </Text>
                <Text
                    style={[
                        styles.timestamp,
                        { color: isCurrentUser ? 'rgba(255,255,255,0.7)' : theme.placeholderText }
                    ]}
                >
                    {item.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Sending...'}
                </Text>
            </View>
        );
    };

    // Loading state
    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.messagesList}
                onLayout={() => {
                    if (flatListRef.current && messages.length > 0) {
                        flatListRef.current.scrollToEnd({ animated: false });
                    }
                }}
            />

            <View style={[styles.inputContainer, { borderTopColor: theme.border }]}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: theme.inputBackground,
                            color: theme.text,
                            borderColor: theme.border
                        }
                    ]}
                    placeholder="Type a message..."
                    placeholderTextColor={theme.placeholderText}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <Pressable
                    style={[styles.sendButton, { backgroundColor: theme.primary }]}
                    onPress={sendMessage}
                >
                    <Text style={styles.sendButtonText}>Send</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messagesList: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    messageContainer: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginVertical: 4,
        borderWidth: 1,
    },
    sentMessage: {
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: 16,
    },
    timestamp: {
        fontSize: 12,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 12,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        maxHeight: 100,
    },
    sendButton: {
        marginLeft: 12,
        paddingHorizontal: 16,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default Chat; 