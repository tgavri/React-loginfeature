import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Pressable,
    ActivityIndicator
} from 'react-native';
import { useTheme } from './ThemeContext';
import { useAuth } from './AuthContext';
import { db, auth } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc, query, where } from 'firebase/firestore';
import { getAuth, listUsers } from 'firebase/auth';

const UserSelectionModal = ({ visible, onClose, onSelectUser, route, navigation }) => {
    const { theme } = useTheme();
    const { userID } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to handle user selection from route params
    useEffect(() => {
        if (route?.params?.onSelectUser) {
            const handleSelectFromParams = (user) => {
                route.params.onSelectUser(user);
                onClose();
            };
            // Override the onSelectUser prop with the one from params
            onSelectUser = handleSelectFromParams;
        }
    }, [route]);

    // Create sample users function
    const createSampleUsers = async () => {
        try {
            console.log("Creating sample users...");

            // Create 5 sample users
            const sampleUsers = [
                { id: 'sample1', displayName: 'John Doe', email: 'john@example.com' },
                { id: 'sample2', displayName: 'Jane Smith', email: 'jane@example.com' },
                { id: 'sample3', displayName: 'Robert Johnson', email: 'robert@example.com' },
                { id: 'sample4', displayName: 'Emily Davis', email: 'emily@example.com' },
                { id: 'sample5', displayName: 'Michael Brown', email: 'michael@example.com' }
            ];

            // Create user documents
            for (const user of sampleUsers) {
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
            }

            return sampleUsers;
        } catch (error) {
            console.error("Error creating sample users:", error);
            return [];
        }
    };

    // Create Firestore documents for a Firebase Auth user
    const createUserDocument = async (user) => {
        try {
            // Check if user already has a document
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            // If document doesn't exist, create it
            if (!userDoc.exists()) {
                // Create main user document
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email || '',
                    createdAt: new Date()
                });

                // Generate display name from email or UID
                const displayName = user.displayName ||
                    (user.email ? user.email.split('@')[0] : `User ${user.uid.substring(0, 4)}`);

                // Create profile document
                await setDoc(doc(db, 'users', user.uid, 'profile', 'data'), {
                    displayName: displayName,
                    notificationsEnabled: true
                });

                console.log("Created new user document for:", user.uid);
                return {
                    id: user.uid,
                    email: user.email,
                    displayName: displayName
                };
            } else {
                // Get user profile
                const profileDoc = await getDoc(doc(db, 'users', user.uid, 'profile', 'data'));
                const displayName = profileDoc.exists()
                    ? profileDoc.data().displayName
                    : (user.email ? user.email.split('@')[0] : `User ${user.uid.substring(0, 4)}`);

                return {
                    id: user.uid,
                    email: user.email,
                    displayName: displayName,
                    ...userDoc.data()
                };
            }
        } catch (error) {
            console.error("Error creating user document:", error);
            return null;
        }
    };

    // Load all users except the current user
    useEffect(() => {
        if (visible) {
            const fetchUsers = async () => {
                try {
                    setLoading(true);
                    const currentUser = auth.currentUser;
                    const currentUserID = userID || (currentUser ? currentUser.uid : '');

                    console.log("Current userID:", currentUserID);

                    // First, get all users from Firestore
                    const usersCollection = collection(db, 'users');
                    const usersSnapshot = await getDocs(usersCollection);
                    const firestoreUserIds = usersSnapshot.docs.map(doc => doc.id);

                    console.log("Total users found in Firestore:", usersSnapshot.docs.length);

                    // Get all other authenticated users from Auth
                    const authUsers = await fetchAuthUsers();
                    console.log("Total users found in Auth:", authUsers.length);

                    let usersList = [];

                    // Process Firestore users
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

                    // Process Auth users not yet in Firestore
                    for (const authUser of authUsers) {
                        // Skip if this auth user is already in Firestore or is the current user
                        if (firestoreUserIds.includes(authUser.uid) || authUser.uid === currentUserID) {
                            continue;
                        }

                        // Create Firestore document for this auth user
                        const userDoc = await createUserDocument(authUser);
                        if (userDoc) {
                            usersList.push(userDoc);
                        }
                    }

                    console.log("Filtered users count:", usersList.length);

                    // If no users found (except current user), create sample users
                    if (usersList.length === 0) {
                        console.log("No users found, creating sample users...");
                        const sampleUsers = await createSampleUsers();

                        // Add sample users to the list
                        usersList = sampleUsers.filter(user => user.id !== currentUserID);
                    }

                    setUsers(usersList);
                    setLoading(false);
                } catch (error) {
                    console.error('Error fetching users:', error);
                    setLoading(false);
                }
            };

            fetchUsers();
        }
    }, [visible, userID]);

    // Function to get Firebase Auth users (this is a mock since client SDK can't list all users)
    // You would need to implement a server function to actually get all users
    const fetchAuthUsers = async () => {
        // This is a placeholder. In a real app, you would call a server function.
        console.log("Note: In a production app, you would need a server function to list all Auth users");

        // For testing, we'll use the current user as a reference
        const currentUser = auth.currentUser;
        if (!currentUser) return [];

        // In a real implementation, you would get all users from your server
        // For now, we'll just return the current user as an example
        return [currentUser];
    };

    const handleSelectUser = (user) => {
        if (onSelectUser) {
            onSelectUser(user);
        }

        if (navigation) {
            // Pass the selected user as payload to the beforeRemove listener
            navigation.goBack({
                selectedUser: user
            });
        } else if (onClose) {
            onClose();
        }
    };

    const renderUserItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.userItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => handleSelectUser(item)}
        >
            <Text style={[styles.userName, { color: theme.text }]}>{item.displayName}</Text>
            <Text style={[styles.userEmail, { color: theme.placeholderText }]}>
                {item.email || `ID: ${item.id.substring(0, 8)}`}
            </Text>
        </TouchableOpacity>
    );

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
                No users available for chat
            </Text>
            <Text style={[styles.emptySubText, { color: theme.placeholderText }]}>
                Note: In a production app, you'd need a server function to list all Auth users
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Select User to Chat</Text>
                        <Pressable onPress={onClose} style={styles.closeButton}>
                            <Text style={[styles.closeButtonText, { color: theme.primary }]}>×</Text>
                        </Pressable>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
                    ) : (
                        <FlatList
                            data={users}
                            renderItem={renderUserItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.userList}
                            ListEmptyComponent={renderEmptyList}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        maxHeight: '80%',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    userList: {
        paddingBottom: 20,
    },
    userItem: {
        padding: 15,
        marginVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
    },
    loader: {
        marginTop: 20,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    emptySubText: {
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default UserSelectionModal; 