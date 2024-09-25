import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_KEY } from '@env';  // Import the API key from .env
import TranslationModal from './TranslationModal';  // Ensure you have the TranslationModal component

const ImageButtons = ({ setImage, setTranslatedText, setModalVisible, selectedLanguage }) => {
  const [imageUri, setImageUri] = React.useState(null);
  const [translatedText, setTranslatedTextState] = React.useState('');
  const [romanizedText, setRomanizedText] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [modalVisible, setModalVisibleState] = React.useState(false);

  const processImage = async (imageUri) => {
    console.log('Processing image...');
    const image = await fetch(imageUri);
    const imageBlob = await image.blob();
    const reader = new FileReader();
  
    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];
      console.log('Base64 Image:', base64Image.slice(0, 100));
  
      try {
        const response = await axios.post(
          `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
          {
            requests: [
              {
                image: { content: base64Image },
                features: [{ type: 'LABEL_DETECTION', maxResults: 5 }], 
              },
            ],
          }
        );
  
        const labels = response.data.responses[0].labelAnnotations;
        console.log('Recognized Labels:', labels);
  
        const objectName = labels[0]?.description;  // Get the first recognized label
        console.log('Chosen Object:', objectName);
  
        await translateObject(objectName);
        
      } catch (error) {
        console.error('Error processing image:', error);
        console.log('Response data:', error.response?.data);
      }
    };
  
    reader.readAsDataURL(imageBlob);
  };
  
  const translateObject = async (objectName) => {
    const targetLanguage = selectedLanguage;
  
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
        {
          q: objectName,
          target: targetLanguage,
        }
      );
  
      const translatedText = response.data.data.translations[0].translatedText;
      let romanizedText = '';

      // Check for romanization support
      if (['ja', 'ko', 'zh'].includes(targetLanguage)) {
        romanizedText = await getRomanization(objectName, targetLanguage);
      }

      const description = objectName;
      setTranslatedTextState(translatedText);
      setRomanizedText(romanizedText);
      setDescription(description);
      setModalVisibleState(true);
    } catch (error) {
      console.error('Error translating text:', error);
    }
  };

  const getRomanization = async (objectName, language) => {
    // Call a suitable API or function to get romanization
    // This is a placeholder for the actual implementation
    if (language === 'ja') {
      return "megane";  // Example: Romanization for "glasses" in Japanese
    }
    // Add logic for other languages with proper romanization API calls
    return '';
  };

  const pickImage = async () => {
    console.log('Opening image picker...');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setImageUri(imageUri);
      console.log('Image selected:', imageUri);
      await processImage(imageUri);
    } else {
      console.log('No image selected');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    console.log('Opening camera...');
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setImageUri(imageUri);
      console.log('Photo taken:', imageUri);
      await processImage(imageUri);
    } else {
      console.log('No photo taken');
    }
  };

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick an Image</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take a Photo</Text>
      </TouchableOpacity>

      <TranslationModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisibleState}
        translatedText={translatedText}
        romanizedText={romanizedText}
        description={description}
        image={imageUri}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ImageButtons;
