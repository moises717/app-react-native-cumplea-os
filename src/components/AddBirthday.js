import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import firebase from '../utils/firebase';
import 'firebase/firestore';

firebase.firestore().settings({experimentalForceLongPolling: true});
const db = firebase.firestore(firebase);
moment.locale('es');

export default function AddBirthday(props) {
  const {user, setShowList, setReloadData} = props;
  const [formData, setFormData] = useState({});
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [formError, setFormError] = useState({});
  const [loader, setLoader] = useState(false);

  const hidenDatePicker = () => {
    setDatePickerVisible(false);
  };
  const handleConfirm = (date) => {
    const dateBirthDay = date;
    dateBirthDay.setHours(0);
    dateBirthDay.setMinutes(0);
    dateBirthDay.setSeconds(0);
    setFormData({
      ...formData,
      dateBirth: dateBirthDay,
    });

    hidenDatePicker();
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const onChange = (e, type) => {
    setFormData({...formData, [type]: e.nativeEvent.text});
  };

  const onSubmit = () => {
    let errors = {};
    if (!formData.name || !formData.lastname || !formData.dateBirth) {
      if (!formData.name) errors.name = true;
      if (!formData.lastname) errors.lastname = true;
      if (!formData.dateBirth) errors.dateBirth = true;
    } else {
      const data = formData;
      data.dateBirth.setYear(0);
      setLoader(true);
      db.collection(user.uid)
        .add(data)
        .then(() => {
          setLoader(false);
          setReloadData(true);
          setShowList(true);
        })
        .catch((err) => {
          console.log(err);
          setFormError({name: true, lastname: true, dateBirth: true});
        });
    }
    setFormError(errors);
  };

  return (
    <>
      <View style={styles.container}>
        <TextInput
          style={[styles.input, formError.name && {borderColor: '#940c0c'}]}
          placeholder="Nombre"
          placeholderTextColor="#969696"
          onChange={(e) => onChange(e, 'name')}
        />
        <TextInput
          style={[styles.input, formError.lastname && {borderColor: '#940c0c'}]}
          placeholder="Apellido"
          placeholderTextColor="#969696"
          onChange={(e) => onChange(e, 'lastname')}
        />

        <View
          style={[
            styles.input,
            styles.datepicker,
            formError.dateBirth && {borderColor: '#940c0c'},
          ]}>
          <Text
            style={{
              color: formData.dateBirth ? '#fff' : '#969696',
              fontSize: 15,
            }}
            onPress={showDatePicker}>
            {formData.dateBirth
              ? moment(formData.dateBirth).format('LL')
              : 'Fecha de nacimiento'}
          </Text>
        </View>
        <TouchableOpacity onPress={onSubmit}>
          <Text style={styles.addButton}>Crear cumpleaños</Text>
        </TouchableOpacity>
        {loader ? (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#0000ff"
          />
        ) : (
          <Text></Text>
        )}
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hidenDatePicker}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    color: '#fff',
    width: '80%',
    marginBottom: 25,
    backgroundColor: '#1e3040',
    paddingHorizontal: 20,
    borderRadius: 18,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1e3040',
  },
  datepicker: {
    justifyContent: 'center',
  },
  addButton: {
    fontSize: 15,
    color: '#fff',
  },
});
