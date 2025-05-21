// app/(tabs)/register.tsx
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
import { account } from "../../lib/appwrite";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onRegister = async () => {
    // Validación: que ningún campo esté vacío
    if (!name || !email || !password) {
      Alert.alert("Campos incompletos", "Por favor, completa todos los campos.");
      return;
    }

    // Validación: formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Formato de correo inválido", "Por favor, introduce un correo válido.");
      return;
    }

    // Validación: contraseña debe tener al menos 8 caracteres
    if (password.length < 8) {
      Alert.alert(
        "Contraseña muy corta",
        "La contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    try {
      // Se utiliza "unique()" para generar un ID único en Appwrite.
      const response = await account.create("unique()", email, password, name);
      console.log("Usuario registrado:", response);
      // Redirige a la pantalla principal tras un registro exitoso.
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Error en el registro:", error);
      // Si el código de error es 409, se asume que el correo ya está en uso.
      if (error.code === 409) {
        Alert.alert("Correo en uso", "El correo ya está en uso.");
      } else {
        Alert.alert(
          "Error en el registro",
          error.message || "No se pudo registrar. Intenta nuevamente."
        );
      }
    }
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

        {/* Título de la pantalla */}
        <Text className="text-3xl font-bold text-center text-gray-800 mb-10">
          Regístrate
        </Text>

        {/* Campos de entrada */}
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Nombre"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="words"
          className="bg-gray-100 rounded-lg p-4 w-full mb-4 text-base text-gray-700"
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="E-mail"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          keyboardType="email-address"
          className="bg-gray-100 rounded-lg p-4 w-full mb-4 text-base text-gray-700"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          className="bg-gray-100 rounded-lg p-4 w-full mb-6 text-base text-gray-700"
        />

        {/* Botón de registro */}
        <TouchableOpacity
          onPress={onRegister}
          className="bg-primary rounded-lg p-4 w-full items-center justify-center"
        >
          <Text className="text-white text-2xl font-bold">Registrarse</Text>
        </TouchableOpacity>

        {/* Link para ir a login */}
        <TouchableOpacity onPress={() => router.push("/login")} className="mt-8">
          <Text className="text-center text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <Text className="text-primary font-semibold">Inicia sesión</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
