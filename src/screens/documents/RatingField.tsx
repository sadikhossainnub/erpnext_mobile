import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface RatingFieldProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  maxRating?: number;
}

const RatingField: React.FC<RatingFieldProps> = ({ label, value, onValueChange, maxRating = 5 }) => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.colors.onSurface,
    },
    starsContainer: {
      flexDirection: 'row',
    },
  });

  const stars = [];
  for (let i = 1; i <= maxRating; i++) {
    stars.push(
      <TouchableOpacity key={i} onPress={() => onValueChange(i)}>
        <Icon
          name={i <= value ? 'star' : 'star-outline'}
          size={32}
          color={theme.colors.primary}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.starsContainer}>{stars}</View>
    </View>
  );
};

export default RatingField;
