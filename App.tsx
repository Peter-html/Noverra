import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, Image, KeyboardAvoidingView, Platform,
  Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, View
} from 'react-native';
import HeroOpeningAnimation from './src/components/HeroOpeningAnimation';
import ServiceRequestsModule from './src/components/ServiceRequestsModule';
import {
  AssetsView,
  InspectionsView,
  InventoryView,
  ReportsView,
  WorkOrdersView,
} from './src/components/InteractiveModules';

const C = {
  navy: '#152B30', forest: '#244B48', mint: '#BEE1CE',
  lime: '#DAEF9D', cream: '#F5F6F2', white: '#FFFFFF',
  ink: '#192B2C', muted: '#778481', border: '#E1E7E1',
  red: '#BA4F45', pale: '#EDF4ED', gold: '#D7B36D'
};

const USERS = [
  { email: 'anto@gmail.com', name: 'Anto', initials: 'AN', role: 'Administrator', color: '#E9E0F8' },
  { email: 'rufin@gmail.com', name: 'Rufin', initials: 'RU', role: 'Operations Manager', color: '#D8E9F7' },
  { email: 'victer@gmail.com', name: 'Victer', initials: 'VI', role: 'Facility Supervisor', color: '#F9E5CE' }
] as const;

type User = typeof USERS[number];
type Screen = 'login' | 'welcome' | 'home' | 'module';

const MODULES = [
  { title: 'Service requests', category: 'CASE MANAGEMENT', icon: '✉', count: '08 open', summary: 'Log facility issues with camera photo evidence, priority, and real-time dispatch.', color: '#E7EDE1' },
  { title: 'Work orders', category: 'MAINTENANCE', icon: '⌁', count: '12 active', summary: 'Review reactive, corrective, and predictive maintenance orders.', color: '#F7EDDF' },
  { title: 'Spaces & assets', category: 'PROPERTY', icon: '▦', count: '248 assets', summary: 'Browse buildings, floors, rooms, and scan QR equipment tags.', color: '#DFEDF2' },
  { title: 'Inspections', category: 'TENANCY', icon: '✓', count: '05 upcoming', summary: 'Interactive move-in/out handover checklists and digital sign-off.', color: '#E9E4F3' },
  { title: 'Inventory', category: 'MATERIALS', icon: '◫', count: '18 items', summary: 'Material stock levels, vendor SLAs, and reorder requests.', color: '#E7EDE1' },
  { title: 'Reports', category: 'ANALYTICS', icon: '▥', count: 'Overview', summary: 'SLA compliance, repair spending, and repeat asset failure analytics.', color: '#F7EDDF' }
] as const;

type Module = typeof MODULES[number];
const width = Dimensions.get('window').width;

function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: any }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 480, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 480, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    ]).start();
  }, [delay, opacity, translateY]);
  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <View style={styles.brandRow}>
      <View style={[styles.brandLogoWrap, light && { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
        <Image
          source={require('./assets/nexus-emblem.png')}
          style={styles.brandEmblem}
          resizeMode="contain"
        />
      </View>
      <Text style={[styles.brandName, light && { color: C.white }]}>
        Nexus<Text style={{ color: light ? '#00E8FF' : '#1488CC' }}>.</Text>
      </Text>
    </View>
  );
}

function PrimaryButton({ label, onPress, disabled = false, pale = false }: { label: string; onPress: () => void; disabled?: boolean; pale?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pale && { backgroundColor: C.lime },
        disabled && { opacity: 0.5 },
        pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] }
      ]}
    >
      <Text style={[styles.primaryText, pale && { color: C.navy }]}>{label}</Text>
      <Text style={[styles.buttonArrow, pale && { color: C.navy }]}>↗</Text>
    </Pressable>
  );
}

export default function App() {
  const [showHero, setShowHero] = useState(true);
  const [screen, setScreen] = useState<Screen>('login');
  const [input, setInput] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [selectedModule, setSelectedModule] = useState<Module>(MODULES[0]);
  const [welcomeShown, setWelcomeShown] = useState(false);

  useEffect(() => {
    if (screen === 'welcome') {
      const t = setTimeout(() => {
        setWelcomeShown(true);
        setScreen('home');
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [screen]);

  function enter() {
    const user = USERS.find(u => u.email === input.trim().toLowerCase());
    if (!user) {
      setError('This email is not in the three demo accounts.');
      return;
    }
    setCurrentUser(user);
    setError('');
    setScreen('welcome');
  }

  function logout() {
    setCurrentUser(null);
    setInput('');
    setWelcomeShown(false);
    setScreen('login');
  }

  function openModule(m: Module) {
    setSelectedModule(m);
    setScreen('module');
  }

  return (
    <SafeAreaView style={[styles.app, screen === 'welcome' && { backgroundColor: '#070C12' }]}>
      <StatusBar barStyle={screen === 'welcome' || showHero ? 'light-content' : 'dark-content'} />

      {/* Hero Opening Animation on App Launch */}
      {showHero && (
        <HeroOpeningAnimation onFinish={() => setShowHero(false)} />
      )}

      {/* 1. Login Screen */}
      {screen === 'login' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.loginContainer}>
            <FadeIn>
              <View style={styles.topBar}>
                <Brand />
              </View>
            </FadeIn>

            <FadeIn delay={90} style={styles.loginHero}>
              <View style={styles.eyebrow}>
                <View style={styles.onlineDot} />
                <Text style={styles.eyebrowText}>FACILITY OPERATIONS PLATFORM</Text>
              </View>
              <Text style={styles.heroTitle}>Everything in its{'\n'}<Text style={{ color: '#00B4D8' }}>right place.</Text></Text>
              <Text style={styles.heroDescription}>Connected workspace for maintenance requests, asset tracking, and service execution.</Text>
            </FadeIn>

            <FadeIn delay={180} style={styles.loginPanel}>
              <Text style={styles.panelTitle}>Welcome to Nexus</Text>
              <Text style={styles.panelSub}>Choose a demo account below or enter its email.</Text>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <View style={styles.textInputWrap}>
                <Text style={styles.inputIcon}>✉</Text>
                <TextInput
                  testID="login-email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="you@example.com"
                  placeholderTextColor="#9AA6A1"
                  style={styles.textInput}
                  value={input}
                  onChangeText={v => { setInput(v); setError(''); }}
                  onSubmitEditing={enter}
                />
              </View>
              {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
              <PrimaryButton label="Enter Nexus" onPress={enter} disabled={!input.trim()} />
              <View style={styles.dividerRow}>
                <View style={styles.hairline} />
                <Text style={styles.dividerText}>DEMO ACCOUNTS</Text>
                <View style={styles.hairline} />
              </View>

              {/* Demo Accounts List: Name only (e.g. Anto) without role */}
              {USERS.map(user => (
                <Pressable
                  key={user.email}
                  accessibilityRole="button"
                  onPress={() => { setInput(user.email); setError(''); }}
                  style={({ pressed }) => [
                    styles.accountRow,
                    input === user.email && styles.accountSelected,
                    pressed && { opacity: 0.7 }
                  ]}
                >
                  <View style={[styles.avatar, { backgroundColor: user.color }]}>
                    <Text style={styles.avatarLetters}>{user.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.accountName}>{user.name}</Text>
                    <Text style={styles.accountEmail}>{user.email}</Text>
                  </View>
                  <Text style={styles.accountArrow}>{input === user.email ? '✓' : '→'}</Text>
                </Pressable>
              ))}
            </FadeIn>
            <Text style={styles.disclaimer}>DEMO MODE · Tap any account to test live facility service requests and maintenance flows.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* 2. Welcome Screen: Personalized WITHOUT Logo */}
      {screen === 'welcome' && (
        <View style={styles.welcomeContainer}>
          <FadeIn style={styles.welcomeCenter}>
            <View style={[styles.welcomeUserOrb, { backgroundColor: currentUser?.color || '#D8E9F7' }]}>
              <Text style={styles.welcomeUserInitials}>{currentUser?.initials}</Text>
            </View>
            <View style={styles.welcomeCheckPill}>
              <Text style={styles.welcomeCheckPillText}>✓ AUTHENTICATED</Text>
            </View>
            <Text style={styles.welcomeTitle}>Welcome, {currentUser?.name}.</Text>
            <Text style={styles.welcomeText}>Your facility operations workspace is ready.</Text>
          </FadeIn>
          <View style={styles.welcomeFooter}>
            <Text style={{ color: '#A8BEB9', fontSize: 12 }}>NEXUS  /  FACILITY INTELLIGENCE</Text>
          </View>
        </View>
      )}

      {/* 3. Dashboard Screen: Without Replay Intro Button */}
      {screen === 'home' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.dashboardScroll}>
          <FadeIn>
            <View style={styles.topBar}>
              <Brand />
              <Pressable accessibilityRole="button" onPress={logout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Sign out ↗</Text>
              </Pressable>
            </View>
          </FadeIn>

          <FadeIn delay={70}>
            <Text style={styles.smallEyebrow}>YOUR WORKSPACE</Text>
            <Text style={styles.dashboardGreeting}>Good to see you,{'\n'}{currentUser?.name}<Text style={{ color: '#00B4D8' }}>.</Text></Text>
            <Text style={styles.dashboardSubtitle}>Nexus Operations Control · Active Facility Session</Text>
          </FadeIn>

          <FadeIn delay={140}>
            <View style={styles.highlightCard}>
              <Text style={styles.highlightEyebrow}>OPERATIONS SNAPSHOT</Text>
              <Text style={styles.highlightTitle}>A clearer view of{'\n'}every moving part.</Text>
              <View style={styles.highlightBottom}>
                <Text style={styles.highlightSmall}>View cases, log photo service requests, and keep facilities operating smoothly.</Text>
                <Text style={styles.highlightDecoration}>✳</Text>
              </View>
            </View>
          </FadeIn>

          <FadeIn delay={190}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>At a glance</Text>
              <Text style={styles.sectionCaption}>LIVE METRICS</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>08</Text>
                <Text style={styles.statName}>Open requests</Text>
                <Text style={styles.statDelta}>↗ 2 new today</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statName}>Active work orders</Text>
                <Text style={[styles.statDelta, { color: C.muted }]}>Across 3 facilities</Text>
              </View>
            </View>
          </FadeIn>

          <FadeIn delay={230}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Explore Nexus Modules</Text>
              <Text style={styles.sectionCaption}>{MODULES.length} INTERACTIVE MODULES</Text>
            </View>
            <View style={styles.moduleGrid}>
              {MODULES.map((module) => (
                <Pressable
                  key={module.title}
                  accessibilityRole="button"
                  onPress={() => openModule(module)}
                  style={({ pressed }) => [
                    styles.moduleCard,
                    { backgroundColor: module.color },
                    pressed && { opacity: 0.78, transform: [{ scale: 0.98 }] }
                  ]}
                >
                  <Text style={styles.moduleIcon}>{module.icon}</Text>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                  <Text style={styles.moduleCount}>{module.count}</Text>
                  <Text style={styles.moduleArrow}>↗</Text>
                </Pressable>
              ))}
            </View>
          </FadeIn>
          <Text style={styles.bottomNotice}>Nexus v0.1 · Facility Operations Platform</Text>
        </ScrollView>
      )}

      {/* 4. Interactive Modules Screens */}
      {screen === 'module' && selectedModule.title === 'Service requests' && (
        <ServiceRequestsModule
          currentUser={{ name: currentUser?.name || 'Anto', email: currentUser?.email || 'anto@gmail.com' }}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'module' && selectedModule.title === 'Work orders' && (
        <WorkOrdersView onBack={() => setScreen('home')} />
      )}

      {screen === 'module' && selectedModule.title === 'Spaces & assets' && (
        <AssetsView onBack={() => setScreen('home')} />
      )}

      {screen === 'module' && selectedModule.title === 'Inspections' && (
        <InspectionsView onBack={() => setScreen('home')} />
      )}

      {screen === 'module' && selectedModule.title === 'Inventory' && (
        <InventoryView onBack={() => setScreen('home')} />
      )}

      {screen === 'module' && selectedModule.title === 'Reports' && (
        <ReportsView onBack={() => setScreen('home')} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: C.cream },
  loginContainer: { flexGrow: 1, paddingHorizontal: 26, paddingTop: 20, paddingBottom: 35, maxWidth: 650, width: '100%', alignSelf: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandLogoWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#070A0F',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
    shadowColor: '#00E8FF',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  brandEmblem: { width: '100%', height: '100%' },
  brandName: { fontSize: 24, fontWeight: '800', letterSpacing: -1.1, color: C.navy },
  loginHero: { marginTop: 42, marginBottom: 30 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00D4FF' },
  eyebrowText: { fontSize: 10, letterSpacing: 1.65, fontWeight: '800', color: C.muted },
  heroTitle: { marginTop: 18, fontSize: width > 410 ? 41 : 36, fontWeight: '800', lineHeight: 46, letterSpacing: -2, color: C.navy },
  heroDescription: { marginTop: 15, maxWidth: 340, fontSize: 14, lineHeight: 23, color: '#687772' },
  loginPanel: { backgroundColor: C.white, borderRadius: 25, padding: 23, borderWidth: 1, borderColor: '#E8EBE7', shadowColor: '#263D35', shadowOpacity: 0.055, shadowRadius: 24, elevation: 3 },
  panelTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.8, color: C.ink },
  panelSub: { marginTop: 6, fontSize: 13, color: C.muted, lineHeight: 20 },
  inputLabel: { fontSize: 10, letterSpacing: 1.6, fontWeight: '800', color: '#85918B', marginTop: 24, marginBottom: 10 },
  textInputWrap: { borderWidth: 1, borderColor: '#DDE5DE', height: 53, borderRadius: 13, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  inputIcon: { fontSize: 17, color: '#83938C', marginRight: 11 },
  textInput: { flex: 1, height: '100%', fontSize: 14, color: C.ink },
  error: { fontSize: 12, color: C.red, marginTop: 8 },
  primaryButton: { marginTop: 16, backgroundColor: '#112229', borderRadius: 14, minHeight: 53, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 19 },
  primaryText: { fontSize: 14, color: C.white, fontWeight: '700' },
  buttonArrow: { color: C.white, fontSize: 20 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 11, marginTop: 25, marginBottom: 8 },
  hairline: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { fontSize: 9, letterSpacing: 1.3, fontWeight: '800', color: '#A1AAA5' },
  accountRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 10, borderRadius: 14, gap: 12 },
  accountSelected: { backgroundColor: '#F0F5EF' },
  avatar: { width: 38, height: 38, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  avatarLetters: { fontSize: 12, fontWeight: '800', color: C.ink },
  accountName: { fontSize: 14, fontWeight: '800', color: C.ink },
  accountEmail: { fontSize: 11, color: C.muted, marginTop: 2 },
  accountArrow: { fontSize: 19, color: C.forest },
  disclaimer: { marginTop: 19, fontSize: 10, lineHeight: 16, textAlign: 'center', color: '#9AA69F' },
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#070C12' },
  welcomeCenter: { alignItems: 'center' },
  welcomeUserOrb: {
    height: 104,
    width: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#00F0FF',
    shadowColor: '#00F0FF',
    shadowOpacity: 0.6,
    shadowRadius: 22,
    elevation: 8,
  },
  welcomeUserInitials: {
    fontSize: 40,
    fontWeight: '900',
    color: '#070C12',
    letterSpacing: -1,
  },
  welcomeCheckPill: {
    backgroundColor: 'rgba(0, 240, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.3)',
    marginBottom: 14,
  },
  welcomeCheckPillText: { fontSize: 10, color: '#00F0FF', fontWeight: '900', letterSpacing: 2 },
  welcomeTitle: { fontSize: 32, color: C.white, letterSpacing: -1.3, fontWeight: '800', marginTop: 8, textAlign: 'center' },
  welcomeText: { fontSize: 14, color: '#B7C7C0', marginTop: 8, textAlign: 'center' },
  welcomeFooter: { position: 'absolute', bottom: 35 },
  dashboardScroll: { padding: 24, paddingTop: 18, paddingBottom: 50, maxWidth: 750, width: '100%', alignSelf: 'center' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  logoutButton: { padding: 8 },
  logoutText: { fontSize: 12, color: C.forest, fontWeight: '700' },
  smallEyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '800', color: '#799087', marginTop: 28 },
  dashboardGreeting: { fontSize: 34, fontWeight: '800', color: C.navy, marginTop: 8, letterSpacing: -1.6, lineHeight: 41 },
  dashboardSubtitle: { fontSize: 13, color: C.muted, marginTop: 8 },
  highlightCard: { marginTop: 26, padding: 24, borderRadius: 24, backgroundColor: '#13282D', overflow: 'hidden', minHeight: 185 },
  highlightEyebrow: { color: '#00E8FF', fontSize: 9, letterSpacing: 1.7, fontWeight: '800' },
  highlightTitle: { color: C.white, fontSize: 24, letterSpacing: -0.9, fontWeight: '800', lineHeight: 31, marginTop: 18 },
  highlightBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18 },
  highlightSmall: { color: '#B3C8C2', fontSize: 11, lineHeight: 17, maxWidth: 220 },
  highlightDecoration: { fontSize: 36, color: '#00E8FF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 28, marginBottom: 12 },
  sectionTitle: { fontSize: 18, color: C.ink, fontWeight: '800', letterSpacing: -0.4 },
  sectionCaption: { fontSize: 9, letterSpacing: 1.4, color: C.muted, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, borderWidth: 1, borderColor: C.border, backgroundColor: C.white, borderRadius: 18, padding: 18 },
  statNumber: { fontSize: 34, fontWeight: '800', color: C.navy, letterSpacing: -1.5 },
  statName: { fontSize: 12, fontWeight: '700', color: C.ink, marginTop: 8 },
  statDelta: { fontSize: 10, color: '#25855A', marginTop: 8 },
  moduleGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  moduleCard: { width: '48%', minHeight: 155, borderRadius: 19, padding: 17, position: 'relative' },
  moduleIcon: { fontSize: 24, color: C.forest },
  moduleTitle: { fontSize: 15, fontWeight: '800', color: C.navy, marginTop: 14, maxWidth: '95%' },
  moduleCount: { fontSize: 11, color: '#72817B', marginTop: 5 },
  moduleArrow: { position: 'absolute', top: 13, right: 15, fontSize: 20, color: C.forest },
  bottomNotice: { fontSize: 11, color: C.muted, textAlign: 'center', marginTop: 30 },
});
