import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200EE', // A modern, deep purple
    secondary: '#03DAC6', // A vibrant teal for accents
    background: '#F5F7FA', // A light, clean background
    surface: '#FFFFFF', // White for card backgrounds
    text: '#333333', // Darker text for better readability
    placeholder: '#9E9E9E', // Lighter gray for placeholders
    error: '#B00020', // A standard, clear error red
    accent: '#03DAC6', // Alias for secondary, often used for floating action buttons
  },
  roundness: 8, // Increased roundness for a softer, modern look
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
};
