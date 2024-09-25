import React from 'react';
import { Image, StyleSheet } from 'react-native';

const ImagePreview = ({ image }) => {
  return <Image source={{ uri: image }} style={styles.image} />;
};

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 8,
  },
});

export default ImagePreview;
