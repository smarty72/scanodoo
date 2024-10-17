<template>
  <ion-page>
    <ion-header>
  <ion-toolbar>
    <ion-title>Barcode Scanner</ion-title>
  </ion-toolbar>
</ion-header>

<ion-content>
  <StreamBarcodeReader v-if="!isSupported && showScan" @decode="getResults" @loaded="onLoaded"></StreamBarcodeReader>
  <ion-list v-if="barcodes.length && !showScan">
    <ion-item v-for="(barcode, index) in barcodes" :key="index">
      <ion-label position="stacked">{{ barcode.format }}</ion-label>
      <ion-input type="text" v-model="barcode.rawValue"></ion-input>
    </ion-item>
  </ion-list>
  
  <ion-fab slot="fixed" vertical="bottom" horizontal="end">
    <ion-fab-button @click="doScan()">
      <ion-icon :icon="close" v-if="showScan"></ion-icon>
      <ion-icon :icon="scan" v-else></ion-icon>
    </ion-fab-button>
  </ion-fab>
</ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { alertController, IonContent, IonPage, IonItem, IonHeader,IonTitle, IonToolbar, IonLabel,IonFab,IonList,IonFabButton,IonInput, IonIcon } from '@ionic/vue'; 
import {  scan, close } from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { StreamBarcodeReader } from "vue-barcode-reader";

// State variables
const isSupported = ref(false);
const showScan = ref(false);
const barcodes = ref([]);

// Check if barcode scanning is supported when the component mounts
onMounted(async () => {
  const result = await BarcodeScanner.isSupported();
  isSupported.value = result.supported;
});

function onLoaded(){
  console.log('cameraReady')
}
function getResults(a, b, c) {
  console.log(a, b, c);
  showScan.value = false
  barcodes.value.push({format: a,rawValue:b,c })
}

// Function to request camera permissions and scan barcodes
const doScan = async () => {
  if (!isSupported.value) {
    return showScan.value = !showScan.value
  }
  const granted = await requestPermissions();
  if (!granted) {
    presentAlert();
    return;
  }

  const { barcodes: scannedBarcodes } = await BarcodeScanner.scan();
  barcodes.value.push(...scannedBarcodes);
};

// Function to request camera permissions
const requestPermissions = async () => {
  const { camera } = await BarcodeScanner.requestPermissions();
  return camera === 'granted' || camera === 'limited';
};

// Function to present an alert if camera permission is denied
const presentAlert = async () => {
  const alert = await alertController.create({
    header: 'Permission denied',
    message: 'Please grant camera permission to use the barcode scanner.',
    buttons: ['OK'],
  });
  await alert.present();
};
</script>

<style scoped>
.home-page {
  padding: 20px;
  text-align: center;
}

button {
  padding: 10px 20px;
  font-size: 16px;
}

ul {
  margin-top: 20px;
}

li {
  font-size: 14px;
  list-style-type: none;
  padding: 5px;
}
</style>