import React from 'react';
import {
  StatusBar,
  Text,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import LinearGradient from 'react-native-linear-gradient';

const App = () => {
  // Replace `URL` below with LocalTunnel URL in the format : https://{subdomain}.loca.lt
  const URL = ' https://silent-termite-48.loca.lt'; //'https://tru-id.loca.lt';
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sentCode, setSentCode] = React.useState(null);
  const [code, setCode] = React.useState('');

  const errorHandler = ({title, message}) => {
    return Alert.alert(title, message, [
      {
        text: 'Close',
        onPress: () => console.log('Alert closed'),
      },
    ]);
  };

  const onPressHandler = async () => {
    try {
      const body = {phone_number: phoneNumber};
      console.log('tru.ID: Creating SIMCheck for', body);
      const response = await fetch(`${URL}/sim-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      console.log('tru.ID: SIMCheck created', data);

      if (data.no_sim_change === false) {
        errorHandler({
          title: 'SIM Change Detected',
          message: 'SIM changed too recently. Please contact support.',
        });
        return;
      }

      console.log('Firebase: signInWithPhoneNumber');
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      console.log('Firebase: signInWithPhoneNumber result', confirmation);

      setLoading(false);
      setSentCode(confirmation);
    } catch (e) {
      console.error(e);
      setLoading(false);

      errorHandler({
        title: 'Something went wrong',
        message: e.message,
      });
    }
  };

  const confirmationHandler = async () => {
    try {
      setLoading(true);

      const resp = await sentCode.confirm(code);
      setLoading(false);

      if (resp) {
        Alert.alert('Successfully logged in', '✅', [
          {
            text: 'Close',
            onPress: () => console.log('Alert closed'),
          },
        ]);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      // set `sentCode` to null resetting the UI
      setSentCode(null);
      errorHandler({
        title: 'Something went wrong',
        message: e.message,
      });
    }
  };

  return (
    <LinearGradient
      colors={['rgba(25, 85, 255, 40)', 'rgba(10, 10, 50, 66)']}
      useAngle={true}
      angle={0}
      style={{
        flex: 1,
      }}>
      <SafeAreaView style={styles.backgroundStyle}>
        <StatusBar barStyle="light-content" />
        <View style={styles.box}>
          <Image
            style={styles.logo}
            source={require('./images/tru-logo.png')}
          />
          <Text style={styles.heading}>tru.ID + Firebase Auth</Text>
          {sentCode ? (
            <View style={styles.center}>
              <TextInput
                style={styles.textInput}
                placeholder="OTP"
                placeholderTextColor="#d3d3d3"
                onChangeText={text => setCode(text)}
                value={code}
              />
              {loading ? (
                <ActivityIndicator
                  style={styles.spinner}
                  size="large"
                  color="#00ff00"
                />
              ) : (
                <TouchableOpacity
                  onPress={confirmationHandler}
                  style={styles.button}>
                  <Text style={styles.buttonText}>Verify</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.center}>
              <TextInput
                style={styles.textInput}
                keyboardType="phone-pad"
                placeholder="ex. +448023432345"
                placeholderTextColor="#d3d3d3"
                onChangeText={text => setPhoneNumber(text.replace(/\s+/g, ''))}
              />

              {loading ? (
                <ActivityIndicator
                  style={styles.spinner}
                  size="large"
                  color="#00ff00"
                />
              ) : (
                <TouchableOpacity
                  onPress={onPressHandler}
                  style={styles.button}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  box: {
    width: '90%',
    borderRadius: 3,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0.5, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 0.7 * Dimensions.get('window').height,
    padding: 15,
  },
  logo: {
    marginTop: 10,
    width: 0.5 * Dimensions.get('window').width,
    height: 200,
  },
  heading: {
    fontSize: 50,
  },
  form: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1955ff',
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#1955ff',
    marginTop: 17,
    width: '40%',
  },
  buttonText: {
    color: '#fff',
  },
  paragraph: {
    fontSize: 12,
    borderBottomColor: '#e67e22',
  },
  textInput: {
    padding: 15,
    borderRadius: 3,
    backgroundColor: '#fff',
    borderColor: '#858585',
    borderWidth: 0.4,
    elevation: 7,
    shadowColor: '#858585',
    shadowOffset: {width: 0.5, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 1,
    color: '#000',
    width: 0.7 * Dimensions.get('window').width,
  },
  spinner: {
    marginTop: 20,
  },
});

export default App;
