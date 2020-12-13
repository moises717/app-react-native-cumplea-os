import React, {useEffect, useState} from 'react';
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AddBirthday from './AddBirthday';
import ActionBar from './ActionBar';
import BirthDay from './BirthDay';
import firebase from '../utils/firebase';
import moment from 'moment';
import 'firebase/firestore';

firebase.firestore().settings({experimentalForceLongPolling: true});
const db = firebase.firestore(firebase);

export default function ListBirthday(props) {
  const {user} = props;
  const [showList, setShowList] = useState(true);
  const [birthday, setBirthday] = useState([]);
  const [pasatBirthday, setPasatBirthday] = useState([]);
  const [reloadData, setReloadData] = useState(false);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    setBirthday([]);
    setPasatBirthday([]);
    setLoader(true);
    db.collection(user.uid)
      .orderBy('dateBirth', 'asc')
      .get()
      .then((response) => {
        const itemsArray = [];
        response.forEach((doc) => {
          const data = doc.data();
          data.id = doc.id;
          itemsArray.push(data);
        });
        formatData(itemsArray);
        setLoader(false);
      });
    setReloadData(false);
  }, [reloadData]);

  const formatData = (items) => {
    const currentDate = moment().set({
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

    const birthdayTempArray = [];
    const pasatBirthdayTempArray = [];

    items.forEach((item) => {
      const dateBirth = new Date(item.dateBirth.seconds * 1000);
      const dateBrithday = moment(dateBirth);
      const currentYear = moment().get('year');
      dateBrithday.set({year: currentYear});

      const diffDate = currentDate.diff(dateBrithday, 'days');
      const itemTemp = item;
      itemTemp.dateBirth = dateBrithday;
      itemTemp.days = diffDate;

      if (diffDate <= 0) {
        birthdayTempArray.push(itemTemp);
      } else {
        pasatBirthdayTempArray.push(itemTemp);
      }
    });

    setBirthday(birthdayTempArray);
    setPasatBirthday(pasatBirthdayTempArray);
  };

  const detele = (birthday) => {
    Alert.alert(
      'Eliminar cumpleaños',
      `Estas seguro que quieres eliminar el cumpleaños de ${birthday.name} ${birthday.lastname}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => {
            db.collection(user.uid)
              .doc(birthday.id)
              .delete()
              .then(() => {
                setReloadData(true);
              });
          },
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  return (
    <View style={styles.container}>
      {loader ? (
        <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
      ) : (
        <Text></Text>
      )}
      {showList ? (
        <ScrollView style={styles.scrollView}>
          {birthday.map((item, index) => {
            return <BirthDay key={index} birthday={item} detele={detele} />;
          })}
          {pasatBirthday.map((item, index) => {
            return <BirthDay key={index} birthday={item} detele={detele} />;
          })}
        </ScrollView>
      ) : (
        <AddBirthday
          user={user}
          setShowList={setShowList}
          setReloadData={setReloadData}
        />
      )}

      <ActionBar setShowList={setShowList} showList={showList} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  scrollView: {},
  loader: {
    marginTop: '50%',
  },
});
