import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from './firebase';
import React from 'react';
import { View, Button, StyleSheet, Text, Pressable } from 'react-native';
import { useTheme } from './ThemeContext';

export async function onGoogleButtonPress() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log('Signed in with Google!', user);
    } catch (error) {
        console.error("Google Sign-In Error: ", error);
    }
}

const GoogleLogin = () => {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Text style={[styles.title, { color: theme.text }]}>Google Sign-In</Text>
            <Pressable
                style={[styles.button, { backgroundColor: theme.primary, borderColor: theme.border }]}
                onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
            >
                <Text style={[styles.buttonText, { color: theme.text }]}>Sign in with Google</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
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

export default GoogleLogin;