// app/(tabs)/login.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { account } from "../../lib/appwrite"; // Asegúrate que esta ruta sea correcta

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Para feedback visual en el botón
  const insets = useSafeAreaInsets(); // Obtiene los insets de área segura

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        "Campos incompletos",
        "Por favor, introduce tu correo y contraseña."
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(
        "Formato de correo inválido",
        "Por favor, introduce un correo válido."
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Credenciales incorrectas",
        "El correo o la contraseña son incorrectos."
      );
      return;
    }

    setLoading(true);
    try {
      const session = await account.createEmailPasswordSession(email, password);
      console.log("Sesión iniciada:", session);
      router.replace("/(tabs)"); // Navegación tras login exitoso
    } catch (error: any) {
      console.error("Error en el inicio de sesión:", error);
      if (error.code === 401) {
        Alert.alert(
          "Credenciales incorrectas",
          "El correo o la contraseña son incorrectos."
        );
      } else {
        Alert.alert(
          "Error en el inicio de sesión",
          error.message || "No se pudo iniciar sesión. Verifica tus credenciales."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Navega a la pantalla de recuperación. Recuerda que las rutas para grupos (auth)
  // se omiten en la URL real (por lo que, si el archivo está en app/(auth)/forgotPassword.tsx,
  // la ruta real es "/forgotPassword").
  const handleForgotPassword = () => {
    router.push("/forgotPassword");
  };

  // En el mismo sentido, la ruta de registro es "/register" si el archivo está en app/(auth)/register.tsx.
  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <KeyboardAwareScrollView
      extraScrollHeight={20}
      enableOnAndroid
      keyboardOpeningTime={0}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
        paddingBottom: Math.max(insets.bottom, 24), // Ajuste para la barra de navegación
        backgroundColor: "white",
      }}
    >
      <View className="items-center">
        {/* Header con logo y nombre de la app */}
        <View className="flex-row mb-7">
          <Image
            source={require("../../assets/images/icon.png")}
            className="w-40 h-20"
            resizeMode="contain"
          />
          <Text className="font-bold text-6xl mt-3">FreeLit</Text>
        </View>

        {/* Ilustración */}
        <Image
          source={require("../../assets/reading2.png")}
          className="w-80 h-80 mb-8"
          resizeMode="contain"
        />

        <Text className="text-3xl font-bold text-center text-gray-800 mb-10">
          Iniciar Sesión
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="E-mail"
          placeholderTextColor="#9CA3AF"
          className="bg-gray-100 rounded-lg p-4 w-full mb-4 text-base text-gray-700"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          placeholderTextColor="#9CA3AF"
          className="bg-gray-100 rounded-lg p-4 w-full mb-3 text-base text-gray-700"
          secureTextEntry
        />

        <TouchableOpacity
          onPress={handleForgotPassword}
          className="self-end mb-8"
        >
          <Text className="text-sm text-gray-600">
            ¿Olvidaste tu contraseña?{" "}
            <Text className="text-primary font-semibold">Click Aquí</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLogin}
          disabled={loading}
          className={`bg-primary rounded-lg p-4 w-full items-center justify-center ${
            loading ? "opacity-70" : ""
          }`}
        >
          {loading ? (
            <Text className="text-white text-lg font-semibold">Cargando...</Text>
          ) : (
            <Text className="text-white text-2xl font-bold">Iniciar sesión</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleRegister} className="mt-8 mb-4">
          <Text className="text-center text-gray-600">
            ¿No tienes una cuenta?{" "}
            <Text className="text-primary font-semibold">Regístrate</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}