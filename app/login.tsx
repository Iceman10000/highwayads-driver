// app/login.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useAuth } from '../components/AuthProvider';
import Colors from '../constants/Colors';

/* -------------------- THEME TYPES -------------------- */
type Theme = {
  bg: string; bannerBg: string; bannerText: string; panelBorder: string;
  inputBg: string; inputBorder: string; inputText: string; placeholder: string;
  link: string; error: string; btnBg: string; btnBgDisabled: string;
  btnText: string; btnTextDisabled: string; subtle: string;
  gradient: [string, string]; checkboxBorder: string; footerText: string;
  shadowColor: string; capsWarnBg: string; capsWarnText: string;
};

/* -------------------- HELPERS -------------------- */
function isLikelyEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function validUsername(value: string) {
  return /^[A-Za-z0-9_]{3,32}$/.test(value);
}

export default function LoginScreen() {
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const LOST_PASSWORD_URL = 'https://highwayads.net/my-account/lost-password/';
  const REGISTER_URL = 'https://highwayads.net/register/';
  const PRIVACY_URL = 'https://highwayads.net/privacy-policy/';

  const openExternal = (url: string) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank', 'noopener');
    } else {
      Linking.openURL(url);
    }
  };

  const theme: Theme = useMemo(() => {
    if (!isDark) {
      return {
        bg: Colors.background || '#f3fcfa',
        bannerBg: Colors.primary,
        bannerText: Colors.white,
        panelBorder: '#d8ece4',
        inputBg: '#e8faf3',
        inputBorder: Colors.highlight,
        inputText: Colors.primary,
        placeholder: (Colors.primary) + '99',
        link: Colors.highlight,
        error: '#b03021',
        btnBg: Colors.highlight,
        btnBgDisabled: '#d9dddd',
        btnText: '#ffffff',
        btnTextDisabled: '#7a7f80',
        subtle: Colors.primary,
        gradient: ['#f8fefc', '#eef9f4'],
        checkboxBorder: Colors.highlight,
        footerText: Colors.primary,
        shadowColor: '#000',
        capsWarnBg: '#fff8e1',
        capsWarnText: '#8a5a00',
      };
    }
    return {
      bg: '#0f1916',
      bannerBg: '#0d3e30',
      bannerText: '#e9fdf6',
      panelBorder: '#1d4d3d',
      inputBg: '#12372d',
      inputBorder: '#35b190',
      inputText: '#e2f7f1',
      placeholder: '#b1d6cc',
      link: '#35cba3',
      error: '#ff6b5e',
      btnBg: '#2fa787',
      btnBgDisabled: '#27493f',
      btnText: '#f3fffb',
      btnTextDisabled: '#6d9187',
      subtle: '#d2eee4',
      gradient: ['#142b26', '#10231f'],
      checkboxBorder: '#35b190',
      footerText: '#b4d7ce',
      shadowColor: '#000',
      capsWarnBg: '#372c00',
      capsWarnText: '#ffcf4d',
    };
  }, [isDark]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const validateField = useCallback(
    (field: 'username' | 'password', value: string) => {
      let message = '';
      if (field === 'username') {
        if (!value.trim()) message = 'Username or email is required.';
        else if (!isLikelyEmail(value) && !validUsername(value))
          message = 'Enter a valid email or username (3–32 chars).';
      } else {
        if (!value) message = 'Password is required.';
        else if (value.length < 6) message = 'Must be at least 6 characters.';
      }
      setErrors(prev => ({ ...prev, [field]: message || undefined }));
      return message;
    },
    []
  );

  const validateAll = useCallback(() => {
    const uErr = validateField('username', username);
    const pErr = validateField('password', password);
    return !uErr && !pErr;
  }, [username, password, validateField]);

  const onBlurField = (f: 'username' | 'password', v: string) => {
    setTouched(p => ({ ...p, [f]: true }));
    validateField(f, v);
  };
  const fieldHasError = (f: 'username' | 'password') => touched[f] && !!errors[f];

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e: KeyboardEvent) => {
      if (e.getModifierState) setCapsLockOn(e.getModifierState('CapsLock'));
    };
    window.addEventListener('keydown', handler);
    window.addEventListener('keyup', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('keyup', handler);
    };
  }, []);

  const triggerShake = useCallback(() => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 400, easing: Easing.elastic(3), useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const shakeTranslate = shakeAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -14, 14, -10, 0],
  });

  const toggleShowPassword = () => setShowPassword(p => !p);
  useEffect(() => {
    if (!showPassword) return;
    const t = setTimeout(() => setShowPassword(false), 15000);
    return () => clearTimeout(t);
  }, [showPassword]);

  const handleLogin = async () => {
    setSubmitError(null);
    const ok = validateAll();
    setTouched({ username: true, password: true });
    if (!ok) {
      triggerShake();
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      const { success, token } = await login(username.trim(), password);
      if (!success || !token) {
        setSubmitError('Invalid credentials. Please try again.');
        triggerShake();
        return;
      }
      // SPA route
      router.replace('/home');

      // (Alternative full page redirect for web – uncomment to use)
      /*
      if (Platform.OS === 'web') {
        const base = 'https://highwayads.net/driver-dashboard/';
        const param = `driver_jwt=${encodeURIComponent(token)}`;
        const rememberParam = rememberMe ? '&remember=1' : '';
        window.location.href = `${base}?${param}${rememberParam}`;
        return;
      } else {
        router.replace('/home');
      }
      */
    } catch (e: any) {
      setSubmitError('An unexpected error occurred.');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || !username || !password || !!errors.username || !!errors.password;
  const showCapsWarning = Platform.OS === 'web' && passwordFocused && capsLockOn;

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <View style={[styles.topBanner, { backgroundColor: theme.bannerBg }]}>
        <Text style={[styles.topBannerText, { color: theme.bannerText }]}>
          WELCOME TO HIGHWAYADS
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={[styles.pageTitle, { color: theme.inputText }]}>Login</Text>

          <Animated.View
            style={[
              styles.cardShadowWrapper,
              {
                shadowColor: theme.shadowColor,
                transform: [{ translateX: shakeTranslate }],
              },
            ]}
          >
            <LinearGradient
              colors={theme.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.15, y: 1 }}
              style={[styles.card, { borderColor: theme.panelBorder }]}
            >
              {/* Username */}
              <View style={styles.fieldBlock}>
                <View style={styles.labelRow}>
                  <Text style={[styles.fieldLabel, { color: theme.inputText }]}>Username or Email</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.inputBg,
                      borderColor: fieldHasError('username') ? theme.error : theme.inputBorder,
                      color: theme.inputText,
                    },
                  ]}
                  placeholder="Email or Username"
                  placeholderTextColor={theme.placeholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={username}
                  onChangeText={(v) => {
                    setUsername(v);
                    if (touched.username) validateField('username', v);
                  }}
                  onBlur={() => onBlurField('username', username)}
                  textContentType="username"
                  returnKeyType="next"
                  accessibilityLabel="Username or Email"
                />
                {fieldHasError('username') && (
                  <Text style={[styles.fieldError, { color: theme.error }]} accessibilityLiveRegion="polite">
                    {errors.username}
                  </Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.fieldBlock}>
                <View style={styles.labelRow}>
                  <Text style={[styles.fieldLabel, { color: theme.inputText }]}>Password</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <View style={styles.passwordWrap}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: fieldHasError('password') ? theme.error : theme.inputBorder,
                        color: theme.inputText,
                      },
                    ]}
                    placeholder="Password"
                    placeholderTextColor={theme.placeholder}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      if (touched.password) validateField('password', v);
                    }}
                    onBlur={() => {
                      onBlurField('password', password);
                      setPasswordFocused(false);
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      if (!disabled) handleLogin();
                    }}
                    accessibilityLabel="Password"
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.toggleBtn,
                      pressed && { transform: [{ scale: 0.9 }], opacity: 0.7 },
                    ]}
                    onPress={toggleShowPassword}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Text style={styles.toggleEmoji}>{showPassword ? '🐵' : '🙈'}</Text>
                  </Pressable>
                </View>

                {showCapsWarning && (
                  <View
                    style={[
                      styles.capsWarning,
                      { backgroundColor: theme.capsWarnBg, borderColor: theme.capsWarnText + '44' },
                    ]}
                  >
                    <Text style={[styles.capsWarningText, { color: theme.capsWarnText }]}>CAPS LOCK is ON</Text>
                  </View>
                )}

                {fieldHasError('password') && (
                  <Text style={[styles.fieldError, { color: theme.error }]} accessibilityLiveRegion="polite">
                    {errors.password}
                  </Text>
                )}
              </View>

              {/* Remember + Forgot */}
              <View style={styles.rowBetween}>
                <Pressable
                  style={styles.rememberRow}
                  onPress={() => setRememberMe((r) => !r)}
                  hitSlop={8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: rememberMe }}
                  accessibilityLabel="Remember Me"
                >
                  <View
                    style={[
                      styles.checkboxBox,
                      {
                        borderColor: theme.checkboxBorder,
                        backgroundColor: rememberMe ? theme.btnBg : theme.inputBg,
                      },
                    ]}
                  >
                    {rememberMe && (
                      <Text style={styles.checkboxTick} accessibilityLabel="Checked">
                        ✓
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.rememberText, { color: theme.inputText }]}>Remember Me</Text>
                </Pressable>

                <Text
                  style={[styles.link, styles.smallLink, { color: theme.link }]}
                  onPress={() => openExternal(LOST_PASSWORD_URL)}
                >
                  Lost your password?
                </Text>
              </View>

              {submitError && !fieldHasError('username') && !fieldHasError('password') && (
                <Text style={[styles.submitError, { color: theme.error }]} accessibilityLiveRegion="polite">
                  {submitError}
                </Text>
              )}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={disabled}
                style={[
                  styles.loginBtn,
                  {
                    backgroundColor: disabled ? theme.btnBgDisabled : theme.btnBg,
                    shadowColor: theme.shadowColor,
                    shadowOpacity: isDark ? 0.4 : 0.08,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ disabled }}
              >
                <Text
                  style={[
                    styles.loginBtnText,
                    { color: disabled ? theme.btnTextDisabled : theme.btnText },
                  ]}
                >
                  {loading ? 'Logging in…' : '→  Login'}
                </Text>
              </TouchableOpacity>

              {loading && (
                <ActivityIndicator style={{ marginTop: 10 }} size="large" color={theme.btnBg} />
              )}

              <Text
                style={[
                  styles.policyText,
                  { color: theme.subtle, opacity: isDark ? 0.75 : 0.85 },
                ]}
              >
                By logging in, you agree to our{' '}
                <Text
                  style={[styles.link, { color: theme.link }]}
                  onPress={() => openExternal(PRIVACY_URL)}
                >
                  Privacy Policy
                </Text>
                .
              </Text>

              <Text
                style={[styles.link, styles.backLink, { color: theme.link }]}
                onPress={() => openExternal(REGISTER_URL)}
              >
                ← Back to Register
              </Text>
            </LinearGradient>
          </Animated.View>

          <View style={styles.footer}>
            <Text
              style={[
                styles.footerText,
                { color: theme.footerText, opacity: isDark ? 0.55 : 0.65 },
              ]}
            >
              © {new Date().getFullYear()} Highway Ads. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  screen: { flex: 1 },
  topBanner: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  topBannerText: { fontWeight: '700', fontSize: 15, letterSpacing: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 56,
  },
  pageTitle: {
    fontSize: 22, fontWeight: '700',
    marginTop: Platform.OS === 'web' ? 28 : 22,
    marginBottom: 24,
  },
  cardShadowWrapper: {
    width: 520, maxWidth: '100%',
    borderRadius: 26,
    shadowOpacity: 0.11,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  card: {
    borderRadius: 26,
    paddingHorizontal: 46,
    paddingVertical: 34,
    borderWidth: 1,
  },
  fieldBlock: { marginBottom: 20 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  fieldLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  requiredStar: { marginLeft: 4, color: '#d04a3b', fontSize: 13, fontWeight: '700' },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 2,
    fontSize: 15.5,
  },
  passwordWrap: { position: 'relative', width: '100%' },
  passwordInput: { paddingRight: 60 },
  toggleBtn: {
    position: 'absolute',
    right: 18, top: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
  },
  toggleEmoji: { fontSize: 26, lineHeight: 26 },
  capsWarning: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  capsWarningText: { fontSize: 11.5, fontWeight: '600', letterSpacing: 0.3 },
  rowBetween: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: -2, marginBottom: 24,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center' },
  checkboxBox: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  checkboxTick: { color: '#fff', fontSize: 12, fontWeight: '700', lineHeight: 12 },
  rememberText: { fontSize: 13 },
  smallLink: { fontSize: 13 },
  fieldError: { marginTop: 6, fontSize: 12.5, fontWeight: '500' },
  submitError: { textAlign: 'center', fontSize: 13.5, fontWeight: '600', marginBottom: 14 },
  loginBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  loginBtnText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.6 },
  policyText: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 16,
    marginTop: -4,
  },
  backLink: { textAlign: 'center', fontSize: 13, fontWeight: '500' },
  link: { textDecorationLine: 'underline', fontWeight: '600' },
  footer: { marginTop: 54, alignItems: 'center', paddingBottom: 40 },
  footerText: { fontSize: 12, textAlign: 'center', lineHeight: 16 },
});
