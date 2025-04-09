import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ProfileScreen from '../Screens/ProfileScreen';
import RepositoriesScreen from '../Screens/RepositoriesScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'person';

            if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Repositories') {
              iconName = focused ? 'code' : 'code-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'GitHub Profile' }}
        />
        <Tab.Screen 
          name="Repositories" 
          component={RepositoriesScreen} 
          options={{ title: 'Repositories' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default TabNavigator;
