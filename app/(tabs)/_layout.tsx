import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { AuthProvider } from "../../contexts/AuthProvider";
import "../../global.css";

export default function TabLayout() {
  return (
     <AuthProvider>
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown:false,
          tabBarShowLabel:false,
          tabBarIcon: ({ color }) => <FontAwesome size={32} name="home" color={color} />,
          tabBarActiveTintColor:'#ed7152',

        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Biblioteca',
          headerShown:false,
          tabBarShowLabel:false,
          tabBarIcon: ({ color }) => <FontAwesome size={32} name="bookmark" color={color} />,
          tabBarActiveTintColor:'#ed7152',
        }}
        
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown:false,
          tabBarShowLabel:false,
          tabBarIcon: ({ color }) => <FontAwesome size={32} name="user" color={color} />,
          tabBarActiveTintColor:'#ed7152',
        }}
        
      />

      <Tabs.Screen
        name="SearchModal"
        options={{
          href: null,
        }}
      />

     
<Tabs.Screen
        name="BookDetailModal"
        options={{
          href: null,
        }}
      />

      
    </Tabs>
    </AuthProvider>
  );
}
