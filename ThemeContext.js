import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance, useColorScheme } from 'react-native';

// Create theme context
const ThemeContext = createContext();

// Define theme colors
export const lightTheme = {
    background: '#f5f5f5',
    text: '#000000',
    primary: '#ff6666',
    card: '#ffffff',
    border: '#000000',
    inputBackground: '#ffffff',
    placeholderText: '#757575',
};

export const darkTheme = {
    background: '#121212',
    text: '#ffffff',
    primary: '#ff6666',
    card: '#1e1e1e',
    border: '#ffffff',
    inputBackground: '#2c2c2c',
    placeholderText: '#9e9e9e',
};

export const ThemeProvider = ({ children }) => {
    // Get device color scheme
    const deviceColorScheme = useColorScheme();
    const [isDarkMode, setIsDarkMode] = useState(deviceColorScheme === 'dark');

    // Set initial theme based on device settings
    useEffect(() => {
        const colorScheme = Appearance.getColorScheme();
        setIsDarkMode(colorScheme === 'dark');

        // Listen for theme changes on the device
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            setIsDarkMode(colorScheme === 'dark');
        });

        return () => subscription.remove();
    }, []);

    // Toggle theme function
    const toggleTheme = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    // Current theme
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{
            isDarkMode,
            toggleTheme,
            theme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook to use theme
export const useTheme = () => useContext(ThemeContext); 