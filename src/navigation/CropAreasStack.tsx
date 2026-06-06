import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CropAreasStackParamList } from './types';
import { theme } from '../constants/theme';
import CropAreasScreen from '../screens/CropAreasScreen';
import CropAreaFormScreen from '../screens/CropAreaFormScreen';
import CropAreaDetailsScreen from '../screens/CropAreaDetailsScreen';

const Stack = createNativeStackNavigator<CropAreasStackParamList>();

export default function CropAreasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerShown: false,
      }}
    >
      <Stack.Screen name="CropAreasScreen" component={CropAreasScreen} />
      <Stack.Screen name="CropAreaForm" component={CropAreaFormScreen} />
      <Stack.Screen name="CropAreaDetails" component={CropAreaDetailsScreen} />
    </Stack.Navigator>
  );
}
