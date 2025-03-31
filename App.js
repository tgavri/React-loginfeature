import { StatusBar } from 'expo-status-bar';
import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './login';
import Success from './success';
import SignedIn from './signedin';
import { AuthProvider } from './AuthContext';
import GoogleLogin from './GoogleLogin';
import { ThemeProvider, useTheme } from './ThemeContext';
import Messages from './Messages';
import Chat from './Chat';
import ChatIcon from './ChatIcon';
import { LogBox } from 'react-native';
import UserSelectionModal from './UserSelectionModal';
import { auth } from './firebase';
import { setNavigationRef } from './ChatNotificationService';

// Ignore specific warnings
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native',
  'Overwriting fontFamily style attribute',
  'Non-serializable values were found in the navigation state',
  // Add any other warnings you want to ignore
]);

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { theme, isDarkMode } = useTheme();
  const navigationRef = useRef(null);

  // Set navigation reference for chat notifications
  useEffect(() => {
    if (navigationRef.current) {
      setNavigationRef(navigationRef.current);
    }
  }, [navigationRef.current]);

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: theme.background,
      text: theme.text,
      card: theme.card,
      primary: theme.primary,
      border: theme.border,
    },
  };

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: theme.background,
      text: theme.text,
      card: theme.card,
      primary: theme.primary,
      border: theme.border,
    },
  };

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <NavigationContainer
        theme={isDarkMode ? customDarkTheme : customLightTheme}
        ref={navigationRef}
      >
        <Stack.Navigator
          screenOptions={({ navigation }) => ({
            headerStyle: {
              backgroundColor: theme.primary,
            },
            headerTintColor: theme.text,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Stack.Screen
            name="Login"
            component={Login}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Success"
            component={Success}
            options={{ title: 'Success Page' }}
          />
          <Stack.Screen
            name="SignedIn"
            component={SignedIn}
            options={{ headerBackVisible: false, gestureEnabled: false }}
          />
          <Stack.Screen
            name='Messages'
            component={Messages}
            options={({ navigation }) => ({
              headerRight: () => (
                <ChatIcon navigation={navigation} />
              ),
            })}
          />
          <Stack.Screen
            name='Chat'
            component={Chat}
            options={({ route }) => ({
              title: route.params?.userName || 'Chat'
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
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
