import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { registerRootComponent } from 'expo';
import LanguagePicker from './components/LanguagePicker';
import ImageButtons from './components/ImageButtons';
import ImagePreview from './components/ImagePreview';
import TranslationModal from './components/TranslationModal';

function App() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [translatedText, setTranslatedText] = useState('');

  return (
    <View style={styles.container}>
      {/* Language Picker Component */}
      <LanguagePicker 
        selectedLanguage={selectedLanguage} 
        setSelectedLanguage={setSelectedLanguage} 
      />

      {/* Image Buttons Component */}
      <ImageButtons 
        setImage={setImage} 
        setTranslatedText={setTranslatedText} 
        setModalVisible={setModalVisible}
        selectedLanguage={selectedLanguage}  // Pass selected language for translation
      />

      {/* Image Preview Component */}
      {image && (
        <>
          <ImagePreview image={image} />
          <TranslationModal 
            modalVisible={modalVisible} 
            setModalVisible={setModalVisible} 
            translatedText={translatedText}
          />
        </>
      )}
    </View>
  );
}

// Styles for the App
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  }
});

registerRootComponent(App);
