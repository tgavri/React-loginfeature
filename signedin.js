import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { styles } from './login'
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "./AuthContext";
import { collection, addDoc,query } from 'firebase/firestore'
import { useCollection } from 'react-firebase-hooks/firestore'

export default function Success({navigation}){

    const {userID} = useAuth()

    const [note, setNote] = useState('')

    const [values, loading, error] = useCollection(
        (collection(db,'users',userID,'notes'))
    )
    const notes = values?.docs.map((doc) => ({...doc.data(), id:doc.id})) || []

    function handleLogout(){
        signOut(auth).
        then(()=> navigation.navigate('Login')).
        catch(error => console.log(error))
    }

    async function handleNewNote(){
        if(note.trim()){
            await addDoc(collection(db, 'users', userID, 'notes'),{
                text:note
            }).then(()=>{
                Alert.alert("note saved")
            }).catch(error => Alert.alert(error.message))
            setNote('')
        }
    }
    return(
        <View>
            <Text>Success! You signed IN with credentials!</Text>
            <Pressable style={styles.button} onPress={handleLogout}>
                <Text>Log Out</Text>
            </Pressable>
            <Text>{userID}</Text>
            <Text style={styles.button}>Add new note:</Text>
            <TextInput
            style={styles.button}
            placeholder="note"
            value={note}
            onChangeText={setNote}
            />
            <Pressable style={styles.button} onPress={handleNewNote}>
                <Text>Save Note</Text>
            </Pressable>
            { notes.map((n)=>(
                <Text key={n.id}>{n.text}</Text>
            ))}
        </View>
    )
    
}