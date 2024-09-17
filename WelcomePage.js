// WelcomePage.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';

const WelcomePage = ({ onAnimationComplete }) => {
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showPage, setShowPage] = useState(true);

  useEffect(() => {
    const hideWelcomePage = async () => {
      await new Promise(resolve => setTimeout(resolve, 4000));

      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start(() => {
        setShowPage(false);
        onAnimationComplete();
      });
    };

    hideWelcomePage();
  }, [fadeAnim, onAnimationComplete]);

  return (
    <Animated.View style={{ ...styles.container, opacity: fadeAnim }}>
      {showPage && (
        <View style={styles.innerContainer}>
          <Image source={require('./logoapp.gif')} style={styles.logoImage} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 450,
    height: 450,
    marginBottom: 20,
  },
});

export default WelcomePage;
