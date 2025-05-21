// app/(tabs)/profile.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { account } from '../../lib/appwrite'; // Asegúrate que la ruta sea correcta

interface UserProfile {
  name: string;
  email: string;
  profilePicUrl?: string; // Si guardas la URL de la foto de perfil en Appwrite (ej. en prefs)
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const currentUser = await account.get();
        setUser({
          name: currentUser.name || 'Usuario', // Nombre del usuario desde Appwrite
          email: currentUser.email,
          // Ejemplo: profilePicUrl: currentUser.prefs?.profilePicUrl,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert(
          "Error",
          "No se pudieron cargar los datos del usuario. Intenta iniciar sesión de nuevo.",
          [{ text: "OK", onPress: () => router.replace('/(auth)/login') }]
        );
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [router]); // Añadimos router a las dependencias por si se usa dentro del efecto para redirección

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, Cerrar Sesión",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await account.deleteSession('current');
              router.replace('/(auth)/login'); // Asegúrate que esta es tu pantalla de login
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              Alert.alert("Error", "No se pudo cerrar la sesión. Inténtalo de nuevo.");
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { id: "cambiarconta", label: "Cambiar contraseña" },
    { id: "apariencia", label: "Apariencia" },
    { id: "apoyanos", label: "Apoyanos" },
    { id: "acerca_de", label: "Acerca de" },
  ];

  if (loading && !user) { // Mostrar carga solo si no hay datos de usuario aún
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4A3B31" />
        <Text className="mt-2 text-gray-600">Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Banner superior y Foto de Perfil */}
      <View className="relative mb-16">
        {/* Banner de color */}
        <View className="bg-secondary h-72 w-full rounded-b-[30px]" />
        
        {/* Contenedor de la imagen de perfil para centrarla y superponerla */}
        <View className="absolute top-16 left-0 right-0 items-center">
          <Image
            source={
              user?.profilePicUrl
                ? { uri: user.profilePicUrl }
                : require('../../assets/profile.png') // ¡Actualiza esta ruta!
            }
            className="w-72 h-72 mt-10 rounded-full"
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Nombre del Usuario */}
      <View className="items-center mt-10 mb-6 px-6">
        <Text className="text-3xl font-bold text-gray-800">
          {user?.name || 'Usuario'}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">{user?.email}</Text>
      </View>

      {/* Opciones del Menú */}
      <View className="px-6">
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => {
              if (item.id === "cambiarconta") {
                // Navegar a la pantalla de recuperación de contraseña
                router.push("/forgotPassword");
              } else if (item.id === "apoyanos" || item.id === "apariencia") {
                // Mostrar alerta indicando que la función estará disponible próximamente
                Alert.alert("Próximamente", "Esta función estará disponible próximamente.");
              } else if (item.id === "acerca_de") {
                // Abrir el enlace al repositorio de GitHub en el navegador
                Linking.openURL("https://github.com/N1lzon/FreeLit");
              }
            }}
            className="py-4 flex-row justify-between items-center border-b border-gray-200"
          >
            <Text className="text-lg text-gray-700">{item.label}</Text>
            <Text className="text-gray-400 text-xl">{">"}</Text>
          </TouchableOpacity>
        ))}

        {/* Botón de Cerrar Sesión */}
        <TouchableOpacity
          onPress={handleLogout}
          disabled={loading}
          className={`py-4 mt-14 rounded-lg ${loading ? 'bg-secondary' : 'bg-primary hover:bg-secondary'}`}
        >
          <Text className="text-lg text-white font-semibold text-center">
            {loading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Espacio al final para que el último elemento no quede pegado a la tab bar */}
      <View className="h-8" />
    </ScrollView>
  );
}
