import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007BFF', // Frappe Blue
    secondary: '#6C757D', // Frappe Gray
    background: '#F8F9FA', // Frappe Light Gray
    surface: '#FFFFFF',
    text: '#212529', // Frappe Black
    placeholder: '#6C757D', // Frappe Gray
    error: '#DC3545', // Frappe Red
  },
  roundness: 4,
};
