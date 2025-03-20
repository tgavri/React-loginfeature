# TestApp

A React Native application that provides user authentication using Firebase, allowing users to sign up, sign in with email/password or Google, and manage their notes.

## Features

- 🔐 User authentication with email and password
- 🔑 Google Sign-In integration
- 📝 Note management for authenticated users
- 🧭 Intuitive navigation between screens
- 🔒 Secure Firebase backend integration

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Firebase account
- Google Cloud Console account (for Google Sign-In)

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

## Project Structure

```
TestApp/
├── .expo/
├── assets/
├── node_modules/
├── .gitignore
├── App.js
├── AuthContext.js
├── GoogleLogin.js
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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Firebase for authentication services
- Google for Sign-In integration
- React Native community for the amazing ecosystem


