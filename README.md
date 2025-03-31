# TestApp 

A React Native application that provides user authentication using Firebase, allowing users to sign up, sign in with email/password or Google, manage their notes, and engage in real-time chat with other users.

## Features

- 🔐 User authentication with email and password
- 🔑 Google Sign-In integration
- 📝 Note management for authenticated users
- 🧭 Intuitive navigation between screens
- 🔒 Secure Firebase backend integration
- 💬 Real-time chat functionality
- 👥 User-to-user messaging
- 🔔 Push notifications for new messages
- 🌓 Light/Dark mode support
- 📱 Platform-specific notifications (Android/iOS)
- 🔄 Real-time data synchronization
- 👤 User profile management
- 📋 Chat history persistence
- 🔍 User search and selection
- ⚡ Real-time unread message indicators

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account
- Google Cloud Console account (for Google Sign-In)
- React Native development environment

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/TestApp.git
   cd TestApp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Firebase:**
   - Create a new project in the [Firebase Console](https://console.firebase.google.com/)
   - Add a web app to your Firebase project
   - Copy your Firebase configuration
   - Replace the configuration in `firebase.js` with your own
   - Enable Firestore database
   - Set up Firebase Cloud Messaging for notifications

4. **Configure Google Sign-In:**
   - Set up OAuth 2.0 in the Google Cloud Console
   - Add your SHA-1 certificate fingerprint
   - Update the Google Sign-In configuration in your app

## Usage

### Authentication

1. **Sign Up:**
   - Enter your email and password
   - Click "Sign Up"

2. **Sign In:**
   - Enter your email and password
   - Click "Sign In"
   - Or use "Google Sign In" for one-click authentication

### Notes Management

1. After signing in, navigate to the notes section
2. Enter your note in the text input
3. Click "Save Note" to store it

### Chat Features

1. **Starting a Chat:**
   - Click the chat icon in the navigation bar
   - Select a user from the list
   - Start sending messages

2. **Notifications:**
   - Receive push notifications for new messages
   - Tap notifications to open the relevant chat
   - Manage notification preferences in settings

3. **User Management:**
   - View and search for other users
   - Start new conversations
   - View chat history

## Project Structure

```
TestApp/
├── .expo/
├── assets/
├── components/
│   ├── Chat.js
│   ├── ChatIcon.js
│   ├── Messages.js
│   └── UserSelectionModal.js
├── services/
│   └── ChatNotificationService.js
├── contexts/
│   ├── AuthContext.js
│   └── ThemeContext.js
├── node_modules/
├── .gitignore
├── App.js
├── firebase.js
├── index.js
├── login.js
├── package.json
├── signedin.js
├── success.js
└── app.json
```

## Dependencies

- [expo](https://expo.dev/)
- [firebase](https://firebase.google.com/)
- [@react-native-firebase/auth](https://rnfirebase.io/auth/usage)
- [@react-native-google-signin/google-signin](https://github.com/react-native-google-signin/google-signin)
- [@react-navigation/native](https://reactnavigation.org/)
- [@react-navigation/stack](https://reactnavigation.org/docs/stack-navigator/)
- [react](https://reactjs.org/)
- [react-native](https://reactnative.dev/)
- [react-native-web](https://necolas.github.io/react-native-web/)
- [@react-native-firebase/messaging](https://rnfirebase.io/messaging/usage)
- [@react-native-firebase/firestore](https://rnfirebase.io/firestore/usage)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Firebase for authentication services and real-time database
- Google for Sign-In integration and Cloud Messaging
- React Native community for the amazing ecosystem


