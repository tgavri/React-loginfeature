import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './login';
import Success from './success';
import SignedIn from './signedin';
import { AuthProvider } from './AuthContext';
import GoogleLogin from './GoogleLogin';

const Stack = createStackNavigator();




export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
      
        <Stack.Navigator >
          <Stack.Screen name='Login' component={Login} />
          <Stack.Screen name='Success' component={Success} />
          <Stack.Screen name='SignedIn' component={SignedIn} />
          <Stack.Screen name='GoogleLogin' component={GoogleLogin} />

        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
