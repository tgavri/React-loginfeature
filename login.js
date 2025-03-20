import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';
import { useAuth } from "./AuthContext";
import { onGoogleButtonPress } from "./GoogleLogin";

export default function Login({ navigation }) {
    const [email, setEmail] = useState('test@test.dk');
    const [password, setPassword] = useState('test123');
    const { setUserID, userID } = useAuth();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setUserID(user.uid);
                Alert.alert("bruger id: " + user.uid);
            }
        });
        return unsubscribe; // Stop listening when the component unmounts
    }, [navigation, setUserID]);

    function handleSignUp() {
        console.log("signing up...");
        createUserWithEmailAndPassword(auth, email, password)
            .then(() => { navigation.navigate('Success'); })  // success side
            .catch(error => console.log(error));
    }

    function handleSignIn() {
        console.log("signing In...");
        signInWithEmailAndPassword(auth, email, password)
            .then(() => { navigation.navigate('SignedIn'); })  // success side
            .catch(error => Alert.alert(error.message));
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>Enter Email and Password</Text>
            <TextInput
                style={styles.input}
                placeholder="email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Pressable style={styles.button} onPress={handleSignIn}>
                <Text style={styles.buttonText}>Sign In</Text>
            </Pressable>
            <Pressable style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!')).catch(error => console.error("Google Sign-In Error: ", error))}>
                <Text style={styles.buttonText}>Google Sign In</Text>
            </Pressable>
        </View>
    );
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
        backgroundColor: '#ff6666',
        padding: 10,
        borderWidth: 2,
        borderColor: '#000',
    },
    subtitle: {
        fontSize: 18,
        color: '#000',
        marginBottom: 20,
        backgroundColor: '#ff6666',
        padding: 5,
        borderWidth: 2,
        borderColor: '#000',
    },
    input: {
        width: '100%',
        padding: 15,
        marginVertical: 10,
        borderWidth: 2,
        borderColor: '#000',
        backgroundColor: '#fff',
        color: '#000',
        fontSize: 16,
    },
    button: {
        width: '100%',
        padding: 15,
        backgroundColor: '#ff6666',
        alignItems: 'center',
        marginVertical: 10,
        borderWidth: 2,
        borderColor: '#000',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});