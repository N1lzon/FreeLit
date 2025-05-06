import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown:false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          tabBarActiveTintColor:'',
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Biblioteca',
          headerShown:false,
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="bookmark" color={color} />,
          tabBarActiveTintColor:'',
        }}
      />

      <Tabs.Screen
        name="SearchModal"
        options={{
          href: null,
        }}
      />

      
    </Tabs>
  );
}
