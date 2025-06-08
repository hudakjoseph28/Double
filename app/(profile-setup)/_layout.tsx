import { Stack } from 'expo-router';

export default function ProfileSetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Prevent swiping back during setup
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="photos" />
      <Stack.Screen name="prompts" />
      <Stack.Screen name="basics" />
      <Stack.Screen name="lifestyle" />
      <Stack.Screen name="complete" />
    </Stack>
  );
} 