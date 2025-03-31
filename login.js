import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, Switch } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from './firebase';
import { useAuth } from "./AuthContext";
import { onGoogleButtonPress } from "./GoogleLogin";
import { useTheme } from './ThemeContext';
import { doc, setDoc } from 'firebase/firestore';

export default function Login({ navigation }) {
    const [email, setEmail] = useState('test@test.dk');
    const [password, setPassword] = useState('test123');
    const { setUserID, userID } = useAuth();
    const { theme, isDarkMode, toggleTheme } = useTheme();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                // Set user ID in context
                setUserID(user.uid);

                // Create user document in Firestore
                createUserDocument(user);

                // Alert.alert("bruger id: " + user.uid);
            }
        });
        return unsubscribe; // Stop listening when the component unmounts
    }, [navigation, setUserID]);

    // Create user document in Firestore
    const createUserDocument = async (user) => {
        try {
            // Basic user data
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email || '',
                createdAt: new Date()
            }, { merge: true });

            // User profile with display name
            const displayName = user.displayName || user.email?.split('@')[0] || `User ${user.uid.substring(0, 4)}`;
            await setDoc(doc(db, 'users', user.uid, 'profile', 'data'), {
                displayName: displayName,
                notificationsEnabled: true
            }, { merge: true });

            console.log("User document created for:", user.uid);
        } catch (error) {
            console.error("Error creating user document:", error);
        }
    };

    function handleSignUp() {
        console.log("signing up...");
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                Alert.alert("Welcome to the app!", "Your account has been created successfully.");
                navigation.navigate('Success');
            })
            .catch(error => console.log(error));
    }

    function handleSignIn() {
        console.log("signing In...");
        signInWithEmailAndPassword(auth, email, password)
            .then(() => { navigation.navigate('SignedIn'); })
            .catch(error => Alert.alert(error.message));
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

            <Text style={[styles.title, { color: theme.text, backgroundColor: theme.primary, borderColor: theme.border }]}>Login</Text>
            <Text style={[styles.subtitle, { color: theme.text, backgroundColor: theme.primary, borderColor: theme.border }]}>Enter Email and Password</Text>
            <TextInput
                style={[styles.input, {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border
                }]}
                placeholder="email"
                placeholderTextColor={theme.placeholderText}
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={[styles.input, {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border
                }]}
                placeholder="password"
                placeholderTextColor={theme.placeholderText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Pressable style={[styles.button, { backgroundColor: theme.primary, borderColor: theme.border }]} onPress={handleSignIn}>
                <Text style={[styles.buttonText, { color: theme.text }]}>Sign In</Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: theme.primary, borderColor: theme.border }]} onPress={handleSignUp}>
                <Text style={[styles.buttonText, { color: theme.text }]}>Sign Up</Text>
            </Pressable>

            <Pressable style={[styles.button, { backgroundColor: theme.primary, borderColor: theme.border }]} onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!')).catch(error => console.error("Google Sign-In Error: ", error))}>
                <Text style={[styles.buttonText, { color: theme.text }]}>Google Sign In</Text>
            </Pressable>
        </View>
    );
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    themeToggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: 40,
        right: 20,
    },
    themeText: {
        marginRight: 10,
        fontSize: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
        padding: 10,
        borderWidth: 2,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 20,
        padding: 5,
        borderWidth: 2,
    },
    input: {
        width: '100%',
        padding: 15,
        marginVertical: 10,
        borderWidth: 2,
        fontSize: 16,
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
});