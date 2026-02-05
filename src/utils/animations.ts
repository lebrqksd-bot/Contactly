import { Easing } from 'react-native-reanimated';

export const animations = {
  fadeIn: {
    duration: 300,
    easing: Easing.out(Easing.ease),
  },
  fadeOut: {
    duration: 200,
    easing: Easing.in(Easing.ease),
  },
  slideIn: {
    duration: 300,
    easing: Easing.out(Easing.ease),
  },
  slideOut: {
    duration: 250,
    easing: Easing.in(Easing.ease),
  },
  scale: {
    duration: 200,
    easing: Easing.out(Easing.ease),
  },
};

