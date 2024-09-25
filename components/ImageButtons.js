import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_KEY } from '@env';  // Import the API key from .env
import TranslationModal from './TranslationModal';  // Ensure you have the TranslationModal component

const ImageButtons = ({ setImage, setTranslatedText, setModalVisible, selectedLanguage }) => {
  const [imageUri, setImageUri] = React.useState(null);  // To store the image URI
  const [translatedText, setTranslatedTextState] = React.useState('');
  const [romanizedText, setRomanizedText] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [modalVisible, setModalVisibleState] = React.useState(false);

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
  
      // Romanization logic (for languages that support romanization)
      if (['ko', 'ja', 'zh'].includes(targetLanguage)) {
        romanizedText = getRomanization(objectName, targetLanguage);  // Use your romanization function here
      }

      const description = objectName;  // Use the recognized object as the description

      // Set the values for the modal
      setTranslatedTextState(translatedText);
      setRomanizedText(romanizedText);
      setDescription(description);
      setModalVisibleState(true);
    } catch (error) {
      console.error('Error translating text:', error);
    }
  };

  // Placeholder function to get romanization if necessary
  const getRomanization = (objectName, language) => {
    // Implement your romanization logic here. This is a placeholder.
    if (language === 'ja') {
      return "megane";  // Example: Romanization for "glasses" in Japanese
    }
    // Add logic for other languages if necessary
    return '';  // Return empty if no romanization is available
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
      setImageUri(imageUri);  // Store the image URI for modal
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
      setImageUri(imageUri);  // Store the image URI for modal
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

      {/* Translation Modal */}
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
