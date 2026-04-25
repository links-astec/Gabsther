import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

export type OrbState = 'idle' | 'listening' | 'processing' | 'speaking';

const ORB_COLORS: Record<OrbState, [string, string]> = {
  idle: ['#1d4ed8', '#4f46e5'],
  listening: ['#059669', '#10b981'],
  processing: ['#6b7280', '#9ca3af'],
  speaking: ['#7c3aed', '#a855f7'],
};

interface Props {
  state: OrbState;
  onPress: () => void;
  size?: number;
}

export function VoiceOrb({ state, onPress, size = 80 }: Props) {
  const pulse = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pulse.stopAnimation();
    rotate.stopAnimation();

    if (state === 'listening' || state === 'speaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.18, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else if (state === 'processing') {
      Animated.loop(
        Animated.timing(rotate, { toValue: 1, duration: 1200, useNativeDriver: true })
      ).start();
    } else {
      Animated.timing(pulse, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    }
  }, [state]);

  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const [color1, color2] = ORB_COLORS[state];

  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      {/* Outer glow ring */}
      {(state === 'listening' || state === 'speaking') && (
        <Animated.View
          style={[
            styles.ring,
            { width: size + 24, height: size + 24, borderRadius: (size + 24) / 2, borderColor: color1 },
            { transform: [{ scale: pulse }], opacity: 0.3 },
          ]}
        />
      )}

      <Animated.View
        style={[
          styles.orb,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: color1 },
          { transform: [{ scale: state === 'listening' || state === 'speaking' ? pulse : 1 }, { rotate: spin }] },
        ]}
      >
        {/* Inner highlight */}
        <View style={[styles.highlight, { width: size * 0.45, height: size * 0.45, borderRadius: size * 0.225 }]} />

        {/* State icon */}
        {state === 'idle' && (
          <View style={styles.micIcon}>
            <View style={[styles.micBody, { backgroundColor: '#fff' }]} />
            <View style={[styles.micBase, { backgroundColor: '#fff' }]} />
          </View>
        )}
        {state === 'listening' && (
          <View style={styles.waveBars}>
            {[1, 1.6, 1, 1.4, 1].map((h, i) => (
              <View key={i} style={[styles.bar, { height: 8 * h, backgroundColor: '#fff' }]} />
            ))}
          </View>
        )}
        {state === 'processing' && (
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.dot, { backgroundColor: '#fff' }]} />
            ))}
          </View>
        )}
        {state === 'speaking' && (
          <View style={styles.speakerIcon}>
            <View style={[styles.speakerBody, { backgroundColor: '#fff' }]} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  ring: { position: 'absolute', borderWidth: 2 },
  orb: { alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  highlight: { position: 'absolute', top: '12%', left: '18%', backgroundColor: 'rgba(255,255,255,0.2)' },
  micIcon: { alignItems: 'center' },
  micBody: { width: 10, height: 14, borderRadius: 5 },
  micBase: { width: 16, height: 3, borderRadius: 2, marginTop: 2 },
  waveBars: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  bar: { width: 3, borderRadius: 2 },
  dots: { flexDirection: 'row', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  speakerBody: { width: 14, height: 14, borderRadius: 3 },
});
