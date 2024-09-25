import React from 'react';
import { Picker } from '@react-native-picker/picker';
import { Text, StyleSheet, View } from 'react-native';

const LanguagePicker = ({ selectedLanguage, setSelectedLanguage }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose a Language:</Text>
      <Picker
        selectedValue={selectedLanguage}
        onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="English" value="en" />
        <Picker.Item label="Spanish" value="es" />
        <Picker.Item label="French" value="fr" />
        <Picker.Item label="Japanese" value="ja" />
        <Picker.Item label="Chinese" value="zh" />
        <Picker.Item label="Korean" value="ko" />
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  picker: {
    height: 50,
    width: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
});

export default LanguagePicker;
