import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeroOpeningAnimationProps {
  onFinish: () => void;
  autoPlay?: boolean;
}

export default function HeroOpeningAnimation({
  onFinish,
  autoPlay = true,
}: HeroOpeningAnimationProps) {
  // Core animation drivers
  const masterOpacity = useRef(new Animated.Value(1)).current;
  const emblemScale = useRef(new Animated.Value(0.4)).current;
  const emblemOpacity = useRef(new Animated.Value(0)).current;
  const emblemRotate = useRef(new Animated.Value(-12)).current;
  const textTranslateX = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const auraScale = useRef(new Animated.Value(0.5)).current;
  const auraOpacity = useRef(new Animated.Value(0)).current;
  const shockwaveScale = useRef(new Animated.Value(0.3)).current;
  const shockwaveOpacity = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const sheenTranslate = useRef(new Animated.Value(-140)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // Hero exit shared-element transition drivers
  const heroExitTranslateX = useRef(new Animated.Value(0)).current;
  const heroExitTranslateY = useRef(new Animated.Value(0)).current;
  const heroExitScale = useRef(new Animated.Value(1)).current;

  const [statusText, setStatusText] = useState('CONNECTING ENGINE');
  const [isTransitioningOut, setIsTransitioningOut] = useState(false);

  useEffect(() => {
    // 1. Aurora glow intro
    Animated.parallel([
      Animated.timing(auraOpacity, {
        toValue: 0.65,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(auraScale, {
        toValue: 1.15,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Emblem spring reveal
    Animated.parallel([
      Animated.timing(emblemOpacity, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.spring(emblemScale, {
        toValue: 1,
        friction: 6.5,
        tension: 45,
        useNativeDriver: true,
      }),
      Animated.spring(emblemRotate, {
        toValue: 0,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Shockwave energy pulse
    Animated.sequence([
      Animated.delay(220),
      Animated.parallel([
        Animated.timing(shockwaveScale, {
          toValue: 2.2,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(shockwaveOpacity, {
            toValue: 0.85,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(shockwaveOpacity, {
            toValue: 0,
            duration: 700,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();

    // 4. "Nexus" wordmark reveals smoothly right beside emblem
    Animated.sequence([
      Animated.delay(420),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateX, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 5. Light sheen sweep across the emblem
    Animated.sequence([
      Animated.delay(650),
      Animated.timing(sheenTranslate, {
        toValue: 220,
        duration: 850,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // 6. Subtitle & status
    Animated.sequence([
      Animated.delay(750),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // 7. Dynamic status updates & charging laser line
    const statusT1 = setTimeout(() => setStatusText('AUTHENTICATING WORKSPACE'), 900);
    const statusT2 = setTimeout(() => setStatusText('SYSTEM ONLINE'), 1750);

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // 8. Idle floating / breathing levitation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const floatTimer = setTimeout(() => floatLoop.start(), 800);

    // 9. Auto-trigger hero exit transition into main app
    let exitTimer: any;
    if (autoPlay) {
      exitTimer = setTimeout(() => {
        triggerHeroExit();
      }, 2450);
    }

    return () => {
      clearTimeout(statusT1);
      clearTimeout(statusT2);
      clearTimeout(floatTimer);
      if (exitTimer) clearTimeout(exitTimer);
      floatLoop.stop();
    };
  }, []);

  function triggerHeroExit() {
    if (isTransitioningOut) return;
    setIsTransitioningOut(true);

    // The hero shared element calculation:
    // Move from screen center to the top-left brand anchor position
    const targetTranslateX = -SCREEN_WIDTH * 0.26;
    const targetTranslateY = -(SCREEN_HEIGHT * 0.38);

    Animated.parallel([
      // Fade out dark splash background
      Animated.timing(masterOpacity, {
        toValue: 0,
        duration: 480,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      // Hero emblem morph: flies up to the header brand position
      Animated.timing(heroExitTranslateX, {
        toValue: targetTranslateX,
        duration: 480,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroExitTranslateY, {
        toValue: targetTranslateY,
        duration: 480,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroExitScale, {
        toValue: 0.36,
        duration: 480,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }

  const emblemRotateInterpolated = emblemRotate.interpolate({
    inputRange: [-12, 0],
    outputRange: ['-12deg', '0deg'],
  });

  return (
    <Animated.View
      style={[
        styles.fullScreenOverlay,
        {
          opacity: masterOpacity,
        },
      ]}
      pointerEvents={isTransitioningOut ? 'none' : 'auto'}
    >
      <StatusBar barStyle="light-content" />

      {/* Tap anywhere to skip / enter immediately */}
      <Pressable style={styles.interactiveBackdrop} onPress={triggerHeroExit}>
        {/* Background ambient stars / grid dots */}
        <View style={styles.starsContainer}>
          <View style={[styles.starDot, { top: '15%', left: '20%', opacity: 0.4 }]} />
          <View style={[styles.starDot, { top: '22%', right: '25%', opacity: 0.6 }]} />
          <View style={[styles.starDot, { top: '38%', left: '12%', opacity: 0.3 }]} />
          <View style={[styles.starDot, { top: '65%', right: '15%', opacity: 0.5 }]} />
          <View style={[styles.starDot, { top: '78%', left: '30%', opacity: 0.4 }]} />
          <View style={[styles.starDot, { top: '85%', right: '35%', opacity: 0.3 }]} />
        </View>

        {/* Top bar with quick Skip button */}
        <SafeAreaView style={styles.topControls}>
          <View style={styles.topBar}>
            <View style={styles.badgeLive}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>NEXUS OS</Text>
            </View>
            <Pressable
              onPress={triggerHeroExit}
              hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
              style={({ pressed }) => [styles.skipButton, pressed && { opacity: 0.6 }]}
            >
              <Text style={styles.skipButtonText}>Skip ↗</Text>
            </Pressable>
          </View>
        </SafeAreaView>

        {/* Ambient Aurora Glows */}
        <Animated.View
          style={[
            styles.auroraContainer,
            {
              opacity: auraOpacity,
              transform: [{ scale: auraScale }],
            },
          ]}
          pointerEvents="none"
        >
          {/* Cyan Glow (bottom-left) */}
          <View style={[styles.auraCircle, styles.auraCyan]} />
          {/* Magenta / Violet Glow (center-right) */}
          <View style={[styles.auraCircle, styles.auraMagenta]} />
          {/* Electric Blue Glow (center-left) */}
          <View style={[styles.auraCircle, styles.auraBlue]} />
          {/* Golden Solar Glow (top-right) */}
          <View style={[styles.auraCircle, styles.auraGold]} />
        </Animated.View>

        {/* Shockwave Expanding Ring */}
        <Animated.View
          style={[
            styles.shockwaveRing,
            {
              opacity: shockwaveOpacity,
              transform: [{ scale: shockwaveScale }],
            },
          ]}
          pointerEvents="none"
        />

        {/* Central Hero Composition */}
        <Animated.View
          style={[
            styles.heroCenter,
            {
              transform: [
                { translateX: heroExitTranslateX },
                { translateY: Animated.add(heroExitTranslateY, floatAnim) },
                { scale: heroExitScale },
              ],
            },
          ]}
        >
          {/* Main Logo Row: Emblem + Nexus Typography */}
          <View style={styles.logoRow}>
            {/* The Iridescent Faceted Emblem */}
            <Animated.View
              style={[
                styles.emblemWrapper,
                {
                  opacity: emblemOpacity,
                  transform: [
                    { scale: emblemScale },
                    { rotate: emblemRotateInterpolated },
                  ],
                },
              ]}
            >
              <Image
                source={require('../../assets/nexus-emblem.png')}
                style={styles.emblemImage}
                resizeMode="contain"
              />

              {/* Shimmer light sweep */}
              <Animated.View
                style={[
                  styles.sheenLight,
                  {
                    transform: [{ translateX: sheenTranslate }, { rotate: '25deg' }],
                  },
                ]}
                pointerEvents="none"
              />
            </Animated.View>

            {/* "Nexus" Wordmark Image */}
            <Animated.View
              style={[
                styles.textWrapper,
                {
                  opacity: textOpacity,
                  transform: [{ translateX: textTranslateX }],
                },
              ]}
            >
              <Image
                source={require('../../assets/nexus-text.png')}
                style={styles.textImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Bottom Status & Charging Beam */}
        <Animated.View
          style={[
            styles.bottomMeta,
            {
              opacity: isTransitioningOut ? masterOpacity : subtitleOpacity,
            },
          ]}
        >
          <Text style={styles.tagline}>FACILITY INTELLIGENCE PLATFORM</Text>

          {/* Futuristic Charging Laser Progress Line */}
          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  transform: [
                    {
                      scaleX: progressAnim,
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* Dynamic Status Pill */}
          <View style={styles.statusPill}>
            <View style={styles.statusDotPulse} />
            <Text style={styles.statusLabel}>{statusText}</Text>
          </View>

          <Text style={styles.tapNotice}>Tap anywhere to continue</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullScreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#05070B',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactiveBackdrop: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  starDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    shadowColor: '#00D4FF',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 3,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 24 : 10,
  },
  badgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 7,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  liveText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  skipButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  skipButtonText: {
    color: '#E0E7E5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  auroraContainer: {
    position: 'absolute',
    width: 340,
    height: 340,
    justifyContent: 'center',
    alignItems: 'center',
  },
  auraCircle: {
    position: 'absolute',
    borderRadius: 160,
  },
  auraCyan: {
    width: 220,
    height: 220,
    backgroundColor: '#00F0FF',
    opacity: 0.28,
    top: 50,
    left: 30,
    transform: [{ scale: 1.1 }],
  },
  auraMagenta: {
    width: 240,
    height: 240,
    backgroundColor: '#E01595',
    opacity: 0.22,
    bottom: 30,
    right: 40,
  },
  auraBlue: {
    width: 260,
    height: 260,
    backgroundColor: '#185BFF',
    opacity: 0.32,
    top: 30,
    right: 30,
  },
  auraGold: {
    width: 140,
    height: 140,
    backgroundColor: '#FFE600',
    opacity: 0.18,
    top: 40,
    right: 50,
  },
  shockwaveRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  heroCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emblemWrapper: {
    width: 120,
    height: 105,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  emblemImage: {
    width: '100%',
    height: '100%',
  },
  sheenLight: {
    position: 'absolute',
    width: 28,
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    top: -40,
  },
  textWrapper: {
    width: 160,
    height: 48,
    marginLeft: 16,
    justifyContent: 'center',
  },
  textImage: {
    width: '100%',
    height: '100%',
  },
  bottomMeta: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  tagline: {
    color: '#8B98A5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.2,
    marginBottom: 16,
  },
  progressBarTrack: {
    width: '78%',
    maxWidth: 260,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  statusDotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38EF7D',
    shadowColor: '#38EF7D',
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
  statusLabel: {
    color: '#A8B7C7',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  tapNotice: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 10,
    marginTop: 18,
    letterSpacing: 0.5,
  },
});
