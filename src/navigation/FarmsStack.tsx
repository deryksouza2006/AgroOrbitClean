import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FarmsStackParamList } from './types';
import { theme } from '../constants/theme';
import FarmsScreen from '../screens/FarmsScreen';
import FarmFormScreen from '../screens/FarmFormScreen';

const Stack = createNativeStackNavigator<FarmsStackParamList>();

export default function FarmsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { color: theme.text },
        headerShown: false,
      }}
    >
      <Stack.Screen name="FarmsScreen" component={FarmsScreen} />
      <Stack.Screen name="FarmForm" component={FarmFormScreen} />
    </Stack.Navigator>
  );
}
