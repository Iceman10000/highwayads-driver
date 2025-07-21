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

/* ───────────────────────────────────────────────────────── helpers ── */
const bannerGreen  = '#0f3e46';            // same as Home header
const primaryDark  = Colors.primary;       // text & icons
const cardBg       = '#e9f5f1cc';          // frosted‑glass card

const isLikelyEmail  = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validUsername  = (v: string) => /^[A-Za-z0-9_]{3,32}$/.test(v);

/* ───────────────────────────────────────────────────────── component */
export default function LoginScreen() {
  /* auth + colour scheme */
  const { login }     = useAuth();
  const colorScheme   = useColorScheme();
  const isDark        = colorScheme === 'dark';

  /* external urls */
  const LOST_PASSWORD_URL = 'https://highwayads.net/my-account/lost-password/';
  const REGISTER_URL      = 'https://highwayads.net/register/';
  const PRIVACY_URL       = 'https://highwayads.net/privacy-policy/';

  const openExternal = (url: string) =>
    Platform.OS === 'web' ? window.open(url, '_blank', 'noopener') : Linking.openURL(url);

  /* theme palette derived from global / dark‑mode */
  const theme = useMemo(() => {
    /* light */
    if (!isDark) {
      return {
        bg: Colors.background,
        bannerBg: bannerGreen,
        bannerText: Colors.white,
        panelBorder: Colors.border,
        inputBg: '#f5fffb',
        inputBorder: Colors.highlight,
        inputText: primaryDark,
        placeholder: primaryDark + '99',
        link: Colors.highlight,
        error: '#b03021',
        btnBg: Colors.highlight,
        btnBgDisabled: '#d9dddd',
        btnText: '#ffffff',
        btnTextDisabled: '#7a7f80',
        subtle: primaryDark,
        gradient: ['#ffffff', '#f3fcfa'] as [string, string],
        checkboxBorder: Colors.highlight,
        footerText: primaryDark,
        shadowColor: '#000',
        capsWarnBg: '#fff8e1',
        capsWarnText: '#8a5a00',
      };
    }
    /* dark */
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
      gradient: ['#142b26', '#10231f'] as [string, string],
      checkboxBorder: '#35b190',
      footerText: '#b4d7ce',
      shadowColor: '#000',
      capsWarnBg: '#372c00',
      capsWarnText: '#ffcf4d',
    };
  }, [isDark]);

  /* ─────── state */
  const [username, setUsername]                 = useState('');
  const [password, setPassword]                 = useState('');
  const [showPassword, setShowPassword]         = useState(false);
  const [rememberMe, setRememberMe]             = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [errors, setErrors]                     = useState<{ username?: string; password?: string }>({});
  const [touched, setTouched]                   = useState<{ username?: boolean; password?: boolean }>({});
  const [submitError, setSubmitError]           = useState<string | null>(null);
  const [capsLockOn, setCapsLockOn]             = useState(false);
  const [passwordFocused, setPasswordFocused]   = useState(false);

  /* shake animation */
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 60, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 400, easing: Easing.elastic(3), useNativeDriver: true }),
    ]).start();
  };
  const shakeTranslate = shakeAnim.interpolate({
    inputRange: [0, .25, .5, .75, 1],
    outputRange:  [0,-14, 14, -10, 0],
  });

  /* validation helpers */
  const validateField = useCallback(
    (field: 'username'|'password', val: string) => {
      let msg = '';
      if (field==='username') {
        if (!val.trim()) msg = 'Username or email is required.';
        else if (!isLikelyEmail(val) && !validUsername(val))
          msg = 'Enter a valid email or username (3‑32 chars).';
      } else {
        if (!val) msg='Password is required.';
        else if (val.length<6) msg='Must be at least 6 characters.';
      }
      setErrors(p=>({...p,[field]:msg||undefined}));
      return msg;
    },[]
  );
  const validateAll = () =>
    !validateField('username', username) && !validateField('password', password);

  /* caps‑lock detector (web) */
  useEffect(()=>{
    if (Platform.OS!=='web') return;
    const h = (e: KeyboardEvent)=> setCapsLockOn(Boolean(e.getModifierState?.('CapsLock')));
    window.addEventListener('keydown',h);
    window.addEventListener('keyup',h);
    return ()=>{ window.removeEventListener('keydown',h); window.removeEventListener('keyup',h); };
  },[]);

  /* login handler */
  const handleLogin = async () => {
    setSubmitError(null);
    setTouched({username:true,password:true});
    if (!validateAll()) { triggerShake(); return; }
    if (loading) return;
    setLoading(true);
    try {
      const { success, token } = await login(username.trim(), password);
      if (!success || !token) {
        setSubmitError('Invalid credentials. Please try again.');
        triggerShake(); return;
      }
      router.replace('/home');
    } catch {
      setSubmitError('An unexpected error occurred.');
      triggerShake();
    } finally { setLoading(false); }
  };

  const disabled =
    loading || !username || !password || !!errors.username || !!errors.password;
  const showCaps =
    Platform.OS==='web' && passwordFocused && capsLockOn;

  /* ─────────────────────────────────────────────── render */
  return (
    <View style={[styles.screen,{backgroundColor:theme.bg}]}>
      {/* top banner */}
      <View style={[styles.banner,{backgroundColor:theme.bannerBg}]}>
        <Text style={[styles.bannerText,{color:theme.bannerText}]}>
          WELCOME TO HIGHWAYADS APP
        </Text>
      </View>

      <KeyboardAvoidingView style={{flex:1}}
        behavior={Platform.OS==='ios'?'padding':undefined}>
        <ScrollView contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <Text style={[styles.pageTitle,{color:theme.inputText}]}>Login</Text>

          {/* frosted card */}
          <Animated.View style={[
            styles.cardShell,
            {shadowColor:theme.shadowColor},
            {transform:[{translateX:shakeTranslate}]},
          ]}>
            <LinearGradient
              /* ↓ cast shuts up TS (“readonly tuple”) */
              colors={theme.gradient as [string,string]}
              start={{x:0,y:0}} end={{x:0.15,y:1}}
              style={[styles.cardInner,{borderColor:theme.panelBorder}]}
            >
              {/* USERNAME ------------------------------------------------ */}
              <View style={styles.fieldBlock}>
                <View style={styles.labelRow}>
                  <Text style={[styles.fieldLabel,{color:theme.inputText}]}>Username or Email</Text>
                  <Text style={styles.reqStar}>*</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    {backgroundColor:theme.inputBg,
                     borderColor: errors.username?theme.error:theme.inputBorder,
                     color:theme.inputText},
                  ]}
                  placeholder="Email or Username"
                  placeholderTextColor={theme.placeholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={username}
                  onChangeText={v=>{
                    setUsername(v);
                    if (touched.username) validateField('username',v);
                  }}
                  onBlur={()=>validateField('username',username)}
                  textContentType="username"
                  returnKeyType="next"
                />
                {errors.username && touched.username && (
                  <Text style={[styles.fieldError,{color:theme.error}]}>
                    {errors.username}
                  </Text>
                )}
              </View>

              {/* PASSWORD ------------------------------------------------ */}
              <View style={styles.fieldBlock}>
                <View style={styles.labelRow}>
                  <Text style={[styles.fieldLabel,{color:theme.inputText}]}>Password</Text>
                  <Text style={styles.reqStar}>*</Text>
                </View>

                <View style={styles.passwordWrap}>
                  <TextInput
                    style={[
                      styles.input, styles.passwordInput,
                      {backgroundColor:theme.inputBg,
                       borderColor: errors.password?theme.error:theme.inputBorder,
                       color:theme.inputText},
                    ]}
                    placeholder="Password"
                    placeholderTextColor={theme.placeholder}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={v=>{
                      setPassword(v);
                      if (touched.password) validateField('password',v);
                    }}
                    onBlur={()=>{
                      validateField('password',password);
                      setPasswordFocused(false);
                    }}
                    onFocus={()=>setPasswordFocused(true)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    returnKeyType="done"
                    onSubmitEditing={()=>{ if (!disabled) handleLogin(); }}
                  />
                  <Pressable
                    style={({pressed})=>[
                      styles.toggleBtn,
                      pressed&&{transform:[{scale:0.9}],opacity:0.7},
                    ]}
                    onPress={()=>setShowPassword(p=>!p)}
                    hitSlop={10}>
                    <Text style={styles.toggleEmoji}>
                      {showPassword?'🐵':'🙈'}
                    </Text>
                  </Pressable>
                </View>

                {showCaps && (
                  <View style={[
                    styles.capsWarning,
                    {backgroundColor:theme.capsWarnBg,
                     borderColor:theme.capsWarnText+'44'},
                  ]}>
                    <Text style={[
                      styles.capsWarningTxt,{color:theme.capsWarnText}]}>
                      CAPS LOCK is ON
                    </Text>
                  </View>
                )}

                {errors.password && touched.password && (
                  <Text style={[styles.fieldError,{color:theme.error}]}>
                    {errors.password}
                  </Text>
                )}
              </View>

              {/* REMEMBER / FORGOT -------------------------------------- */}
              <View style={styles.rowBetween}>
                <Pressable
                  style={styles.rememberRow}
                  onPress={()=>setRememberMe(r=>!r)}
                  accessibilityRole="checkbox"
                  accessibilityState={{checked:rememberMe}}>
                  <View style={[
                    styles.checkBox,
                    {borderColor:theme.checkboxBorder,
                     backgroundColor:rememberMe?theme.btnBg:theme.inputBg},
                  ]}>
                    {rememberMe && <Text style={styles.checkTick}>✓</Text>}
                  </View>
                  <Text style={[styles.rememberTxt,{color:theme.inputText}]}>Remember Me</Text>
                </Pressable>

                <Text style={[styles.Link,{color:theme.link,fontSize:13}]}
                  onPress={()=>openExternal(LOST_PASSWORD_URL)}>
                  Lost your password?
                </Text>
              </View>

              {/* SUBMIT ERRORS */}
              {submitError && (
                <Text style={[styles.submitError,{color:theme.error}]}>
                  {submitError}
                </Text>
              )}

              {/* LOGIN BUTTON ------------------------------------------- */}
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={disabled}
                onPress={handleLogin}
                style={[
                  styles.loginBtn,
                  {backgroundColor:disabled?theme.btnBgDisabled:theme.btnBg,
                   shadowColor:theme.shadowColor},
                ]}>
                <Text style={[
                  styles.loginBtnTxt,
                  {color:disabled?theme.btnTextDisabled:theme.btnText}]}>
                  {loading?'Logging in…':'→  Login'}
                </Text>
              </TouchableOpacity>

              {loading && (
                <ActivityIndicator style={{marginTop:10}}
                  size="large" color={theme.btnBg}/>
              )}

              {/* POLICY + REGISTER LINKS */}
              <Text style={[styles.policyTxt,{color:theme.subtle,opacity:isDark?0.75:0.85}]}>
                By logging in, you agree to our{' '}
                <Text style={[styles.Link,{color:theme.link}]}
                  onPress={()=>openExternal(PRIVACY_URL)}>
                  Privacy Policy
                </Text>.
              </Text>

              <Text style={[styles.Link,{color:theme.link,marginTop:2}]}
                onPress={()=>openExternal(REGISTER_URL)}>
                ← Back to Register
              </Text>
            </LinearGradient>
          </Animated.View>

          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={[styles.footerTxt,{color:theme.footerText}]}>
              © {new Date().getFullYear()} Highway Ads. All rights reserved.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ─────────────────────────────────────────── styles */
const styles = StyleSheet.create({
  /* layout shells */
  screen:{flex:1},
  banner:{
    paddingVertical:10,
    alignItems:'center',
    justifyContent:'center',
    elevation:3,
    shadowOffset:{width:0,height:2},
    shadowRadius:4,
  },
  bannerText:{fontWeight:'700',fontSize:15,letterSpacing:1,color:'#fff'},
  scroll:{flexGrow:1,alignItems:'center',paddingHorizontal:24,paddingBottom:56},
  pageTitle:{fontSize:22,fontWeight:'700',marginTop:28,marginBottom:24},
  /* frosted card container */
  cardShell:{
    width:520,maxWidth:'100%',borderRadius:28,
    shadowColor:'#000',shadowOpacity:0.06,
    shadowRadius:18,shadowOffset:{width:0,height:10},
  },
  cardInner:{
    borderRadius:28,borderWidth:1,paddingHorizontal:48,paddingVertical:38,
    backgroundColor:cardBg,
  },
  /* text / label */
  fieldBlock:{marginBottom:20},
  labelRow:{flexDirection:'row',alignItems:'center',marginBottom:7},
  fieldLabel:{fontSize:13,fontWeight:'600',letterSpacing:0.2},
  reqStar:{marginLeft:4,color:'#d04a3b',fontSize:13,fontWeight:'700'},
   input: {
    width:'100%',
    paddingVertical:14,
    paddingHorizontal:22,
    borderRadius:999,
    borderWidth:2,
    fontSize:15.5,
    transitionDuration:'120ms',            /* smooth colour change (web) */
  },
  passwordWrap:{
  position:'relative',width:'100%'
},
  passwordInput:{
    paddingRight:60
  },
  toggleBtn:{
    position:'absolute',
    right:18,top:0,bottom:0,
    justifyContent:'center',
    alignItems:'center'
  },
  toggleEmoji:{
    fontSize:26,
    lineHeight:26
  },
  fieldError:{
    marginTop:6,
    fontSize:12.5,
    fontWeight:'500'
  },
  /* caps‑lock */
  capsWarning:{
    marginTop:8,
    paddingVertical:6,
    paddingHorizontal:12,
    borderRadius:10,
    borderWidth:1
  },
  capsWarningTxt:{
    fontSize:11.5,
    fontWeight:'600',
    letterSpacing:0.3
  },
  /* Remember / forgot row */
  rowBetween:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginTop:-2,
    marginBottom:24
  },
  rememberRow:{
    flexDirection:'row',
    alignItems:'center'
  },
  checkBox:{
    width:18,height:18,
    borderRadius:4,
    borderWidth:1.5,
    justifyContent:'center',
    alignItems:'center',
    marginRight:8
  },
  checkTick:{
    color:'#fff',
    fontSize:12,
    fontWeight:'700',
    lineHeight:12
  },
  rememberTxt:{
    fontSize:13},
  Link:{
    textAlign:'center',
    fontSize:13,
    fontWeight:'600',
    color:Colors.highlight,
  },
  /* submit */
  submitError:{
    textAlign:'center',
    fontSize:13.5,
    fontWeight:'600',
    marginBottom:14
  },
  loginBtn:{
    width:'100%',
    paddingVertical:16,
    borderRadius:999,
    alignItems:'center',
    shadowOpacity:0.08,
    shadowRadius:12,
    shadowOffset:{width:0,height:2},
    elevation:3
  },
  loginBtnTxt:{
    fontSize:16,
    fontWeight:'700',
    letterSpacing:0.6
  },
  policyTxt:{
    fontSize:12,
    lineHeight:17,
    textAlign:'center',
    marginBottom:16
  },
  /* footer */
  footer:{
    marginTop:54,
    alignItems:'center',
    paddingBottom:40
  },
  footerTxt:{
    fontSize:12,
    lineHeight:16,
    opacity:0.65
  },
  timestampRow:{
    flexDirection:'row',
    justifyContent:'flex-end'
  },
});