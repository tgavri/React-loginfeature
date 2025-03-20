# TestApp

TestApp is a React Native application that provides user authentication using Firebase. Users can sign up, sign in, and sign in with Google. Additionally, authenticated users can add notes to their account.

## Features

- User authentication with email and password
- Google Sign-In
- Add notes for authenticated users
- Navigation between different screens

## Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-username/React-loginfeature.git
   cd React-loginfeature
   ```

2. **Install dependencies:**

Set up Firebase:

Create a Firebase project in the Firebase Console.
Add a web app to your Firebase project to get your Firebase configuration.
Replace the Firebase configuration in firebase.js with your own configuration.
Run the app:

Usage
Sign Up:

Enter your email and password.
Click on the "Sign Up" button.
Sign In:

Enter your email and password.
Click on the "Sign In" button.
Google Sign-In:

Click on the "Google Sign In" button.
Add Notes:

After signing in, you can add notes.
Enter your note in the text input and click on the "Save Note" button.
## Project Structure
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

## Dependencies
expo
firebase
@react-native-firebase/auth
@react-native-google-signin/google-signin
@react-navigation/native
@react-navigation/stack
react
react-dom
react-firebase-hooks
react-native
react-native-web
Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.


