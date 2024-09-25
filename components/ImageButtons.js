import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_KEY } from '@env';  // Import the API key from .env

const ImageButtons = ({ setImage, setTranslatedText, setModalVisible, selectedLanguage }) => {


  // Function to process the image with Google Vision API
  const processImage = async (imageUri) => {
    console.log('Processing image...');
    const image = await fetch(imageUri);
    const imageBlob = await image.blob();
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = reader.result.split(',')[1];  // Get the base64 string
      console.log('Base64 Image:', base64Image.slice(0, 100));  // Log first 100 characters

      try {
        // Step 1: Recognize the object using Google Vision API
        const response = await axios.post(
          `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,  // Use the imported API key
          {
            requests: [
              {
                image: { content: base64Image },  // Send the base64 image content
                features: [{ type: 'LABEL_DETECTION', maxResults: 1 }],
              },
            ],
          }
        );

        const objectName = response.data.responses[0].labelAnnotations[0].description;
        console.log('Recognized Object:', objectName);

        // Step 2: Translate the recognized object using Google Translate API
        await translateObject(objectName);
        
      } catch (error) {
        console.error('Error processing image:', error);
        console.log('Response data:', error.response?.data);  // Log additional error data
      }
    };

    reader.readAsDataURL(imageBlob);  // Read the image blob as base64
  };

  // Function to translate the recognized object and format the output
  const translateObject = async (objectName) => {
    console.log('Translating object...');
    const targetLanguage = selectedLanguage;

    try {
      // Step 3: Use Google Translate API to translate the object name
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,  // Use the imported API key
        {
          q: objectName,
          target: targetLanguage,
        }
      );

      const translatedText = response.data.data.translations[0].translatedText;
      console.log('Translated Object:', translatedText);

      // Step 4: Check if the language has romanization (custom logic for supported languages)
      let romanizedText = '';
      if (['ko', 'ja', 'zh'].includes(targetLanguage)) {
        romanizedText = getRomanization(objectName, targetLanguage);  // Get romanization if needed
      }

      // Step 5: Format the response to display translated text and optional romanization
      let formattedResponse = `${translatedText}`;
      if (romanizedText) {
        formattedResponse += `\n(${romanizedText})`;  // Add romanization in parentheses
      }

      console.log('Formatted Response:', formattedResponse);

      // Step 6: Show the formatted response in the modal
      setTranslatedText(formattedResponse);
      setModalVisible(true);

    } catch (error) {
      console.error('Error translating text:', error);
    }
  };

  // Placeholder function to get romanization if necessary
  const getRomanization = (objectName, language) => {
    if (language === 'ja') {
      return "megane";  // Example of Japanese romanization for "glasses"
    }
    return '';  // Return empty string if no romanization available
  };

  // Image picker from gallery
  const pickImage = async () => {
    console.log('Opening image picker...');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      setImage(imageUri);
      console.log('Image selected:', imageUri);  // Log the image URI
      await processImage(imageUri);
    } else {
      console.log('No image selected');
    }
  };

  // Image picker from camera
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
      setImage(imageUri);
      console.log('Photo taken:', imageUri);  // Log the photo URI
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
    </View>
  );
};

// Styles for the buttons and container
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
