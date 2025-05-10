import { Platform } from 'react-native';
import { Client, Databases, Storage } from 'react-native-appwrite';
import 'react-native-url-polyfill/auto';

const config = {
  endpoint: "https://fra.cloud.appwrite.io/v1",
  projectId: "680a822b00166a0b66a2",
  dbId: "6819f5f20030744d499f",
  collectionId: "6819f60500309df5bcdc",
  // Añadimos el ID del bucket para los archivos
  bucketId: "6819fbc7001d0fb81131" // Reemplaza esto con tu ID de bucket real
};

const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.projectId);

switch (Platform.OS) {
  case "ios":
    client.setPlatform("")
    break
  case "android":
    client.setPlatform("com.nilson.freelit")
    break
}

const database = new Databases(client);
// Añadimos el servicio de almacenamiento
const storage = new Storage(client);

export { client, config, database, storage };
