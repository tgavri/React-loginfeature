import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Alert, StyleSheet, Switch, ToastAndroid, Platform } from "react-native";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "./AuthContext";
import { collection, addDoc, query, doc, setDoc, getDoc } from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore'
import { useTheme } from './ThemeContext';
import { initChatNotifications, removeChatNotifications } from "./ChatNotificationService";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Messages from "./Messages";
import ChatIcon from "./ChatIcon";
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

// Notes tab component
function NotesScreen() {
    const { userID } = useAuth()
    const { theme, isDarkMode, toggleTheme } = useTheme();
    const [note, setNote] = useState('')
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [displayName, setDisplayName] = useState('');

    const [values, loading, error] = useCollection(
        (collection(db, 'users', userID, 'notes'))
    )
    const notes = values?.docs.map((doc) => ({ ...doc.data(), id: doc.id })) || []

    // Initialize user data and chat notifications
    useEffect(() => {
        if (userID) {
            // Set up user document and profile
            const setupUserData = async () => {
                try {
                    // Create main user document if it doesn't exist
                    const userDocRef = doc(db, 'users', userID);
                    const userDoc = await getDoc(userDocRef);

                    // Get current user from auth
                    const currentUser = auth.currentUser;
                    const email = currentUser?.email || '';

                    // If user doc doesn't exist, create it
                    if (!userDoc.exists()) {
                        await setDoc(userDocRef, {
                            email: email,
                            createdAt: new Date()
                        });
                    }

                    // Get or create user profile
                    const profileDocRef = doc(db, 'users', userID, 'profile', 'data');
                    const profileDoc = await getDoc(profileDocRef);

                    // Generate a display name
                    let userName = `User ${userID.substring(0, 4)}`;
                    if (currentUser?.displayName) {
                        userName = currentUser.displayName;
                    } else if (email) {
                        userName = email.split('@')[0];
                    }

                    // If profile doesn't exist or needs updating
                    if (!profileDoc.exists()) {
                        await setDoc(profileDocRef, {
                            displayName: userName,
                            notificationsEnabled: true
                        });
                    } else {
                        // Update display name if needed
                        setDisplayName(profileDoc.data().displayName || userName);
                    }

                    // Set display name state
                    setDisplayName(userName);

                    console.log('User data setup complete for userID:', userID);
                } catch (error) {
                    console.error('Error setting up user data:', error);
                }
            };

            setupUserData();

            // Initialize chat notifications if enabled
            if (notificationsEnabled) {
                const unsubscribe = initChatNotifications(userID);

                return () => {
                    // Clean up notification listener when component unmounts
                    if (unsubscribe) {
                        removeChatNotifications(userID);
                    }
                };
            }
        }
    }, [userID]);

    function handleToggleNotifications() {
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);

        // Update user profile with notification preference
        setDoc(doc(db, 'users', userID, 'profile', 'data'), {
            notificationsEnabled: newValue
        }, { merge: true }).catch(error => {
            console.error('Error updating notification settings:', error);
        });

        // Remove notifications listener if disabled
        if (!newValue) {
            removeChatNotifications(userID);
        } else {
            // Reinitialize if enabled
            initChatNotifications(userID);
        }
    }

    // Show notification using Toast for Android and Alert for iOS
    function showNotification(title, message) {
        if (Platform.OS === 'android') {
            ToastAndroid.showWithGravity(
                message,
                ToastAndroid.LONG,
                ToastAndroid.TOP
            );
        } else {
            // For iOS use Alert
            Alert.alert(title, message);
        }
    }

    async function handleNewNote() {
        if (note.trim()) {
            try {
                await addDoc(collection(db, 'users', userID, 'notes'), {
                    text: note,
                    createdAt: new Date()
                });

                // Show notification if enabled
                if (notificationsEnabled) {
                    showNotification("Note Created!", "Your note has been saved successfully.");
                }

                // Clear the input
                setNote('');
            } catch (error) {
                Alert.alert("Error", error.message);
            }
        } else {
            Alert.alert("Error", "Please enter a note before saving.");
        }
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.themeToggleContainer}>
                <Text style={[styles.themeText, { color: theme.text }]}>
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
                />
            </View>

            <Text style={[styles.header, { color: theme.text }]}>Welcome, {displayName}!</Text>

            <Text style={[styles.userIdText, { color: theme.text }]}>{userID}</Text>

            {/* Notification settings switch */}
            <View style={styles.settingContainer}>
                <Text style={[styles.settingText, { color: theme.text }]}>
                    Enable Notifications
                </Text>
                <Switch
                    value={notificationsEnabled}
                    onValueChange={handleToggleNotifications}
                    trackColor={{ false: '#767577', true: '#00AA00' }}
                    thumbColor={notificationsEnabled ? '#008800' : '#f4f3f4'}
                />
            </View>

            <Text style={[styles.sectionTitle, {
                color: theme.text,
                backgroundColor: theme.primary,
                borderColor: theme.border
            }]}>Add new note:</Text>

            <TextInput
                style={[styles.input, {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border
                }]}
                placeholder="note"
                placeholderTextColor={theme.placeholderText}
                value={note}
                onChangeText={setNote}
            />

            <Pressable
                style={[styles.button, { backgroundColor: theme.primary, borderColor: theme.border }]}
                onPress={handleNewNote}
            >
                <Text style={[styles.buttonText, { color: theme.text }]}>Save Note</Text>
            </Pressable>

            <View style={styles.notesContainer}>
                {notes.map((n) => (
                    <Text
                        key={n.id}
                        style={[styles.noteItem, {
                            color: theme.text,
                            backgroundColor: theme.card,
                            borderColor: theme.border
                        }]}
                    >
                        {n.text}
                    </Text>
                ))}
            </View>
        </View>
    )
}

// Main SignedIn component with tab navigation
export default function SignedIn({ navigation }) {
    const { theme } = useTheme();

    // Handle logout
    function handleLogout() {
        signOut(auth)
            .then(() => navigation.navigate('Login'))
            .catch(error => console.log(error));
    }

    // Set up options for the screen
    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <Pressable
                    onPress={handleLogout}
                    style={({ pressed }) => [
                        {
                            opacity: pressed ? 0.7 : 1,
                            padding: 8,
                            marginRight: 10
                        }
                    ]}
                >
                    <MaterialIcons name="logout" size={24} color={theme.text} />
                </Pressable>
            ),
        });
    }, [navigation, theme]);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarActiveTintColor: theme.primary,
                tabBarInactiveTintColor: theme.placeholderText,
                tabBarStyle: {
                    backgroundColor: theme.background,
                    borderTopColor: theme.border
                },
                headerShown: false
            })}
        >
            <Tab.Screen
                name="Notes"
                component={NotesScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="note" size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name="Messages"
                component={Messages}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="chat" size={size} color={color} />
                    ),
                    tabBarBadge: null
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    themeToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginVertical: 20,
    },
    themeText: {
        marginRight: 10,
        fontSize: 16,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    userIdText: {
        marginVertical: 10,
        fontSize: 14,
    },
    settingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 10,
        marginVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#cccccc',
    },
    settingText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 8,
        marginVertical: 10,
        borderWidth: 2,
        width: '100%',
        textAlign: 'center',
    },
    button: {
        width: '100%',
        padding: 15,
        alignItems: 'center',
        marginVertical: 10,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: 15,
        marginVertical: 10,
        borderWidth: 2,
        fontSize: 16,
    },
    notesContainer: {
        width: '100%',
        marginTop: 20,
    },
    noteItem: {
        padding: 12,
        borderWidth: 1,
        marginVertical: 5,
        borderRadius: 5,
    }
});