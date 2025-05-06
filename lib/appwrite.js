import { Platform } from 'react-native';
import { Client, Databases } from 'react-native-appwrite';
import 'react-native-url-polyfill/auto';

const config ={
    endpoint:"https://fra.cloud.appwrite.io/v1",
    projectId:"680a822b00166a0b66a2",
    dbId:"6819f5f20030744d499f",
    collectionId: "6819f60500309df5bcdc"
}

const client = new Client()
        .setEndpoint(config.endpoint)
        .setProject(config.projectId);

switch (Platform.OS){
    case "ios":
        client.setPlatform("")
        break
    case "android":
        client.setPlatform("com.nilson.freelit")
        break
}

const database = new Databases(client)

export { client, config, database };

