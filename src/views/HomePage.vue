<template>
  <ion-page>
    <ion-header mode="ios">
  <ion-toolbar color="primary">
    <!--ion-title>Barcode Scanner</ion-title-->
    <ion-searchbar placeholder="Scan een barcode of zoek op artikelnummer" mode="ios" class="ion-margin-top" v-model="searchValue" @ionInput="searchMe"></ion-searchbar>
  </ion-toolbar>
</ion-header>

<ion-content>
  <StreamBarcodeReader v-if="!isSupported && showScan" @decode="getResults" @loaded="onLoaded"></StreamBarcodeReader>
  <ion-list v-if="barcodes.length && !showScan">
    <ion-item v-for="(barcode, index) in barcodes" :key="index">
      <ion-img slot="start" :src="barcode.image" style="height:80px"></ion-img>
      <ion-label>{{ barcode.number }} {{ barcode.name }}
        <p>{{ barcode.brand }} | {{ barcode.size }}</p>
      </ion-label>
      <ion-label slot="end">&euro; 3,99 <br>
        <ion-note>{{ barcode.unit }}</ion-note>
      </ion-label>
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
import { ref, onMounted, watch, nextTick } from 'vue';
import { alertController, IonContent,IonSearchbar,IonNote, IonPage, IonItem, IonHeader,IonImg, IonToolbar, IonLabel,IonFab,IonList,IonFabButton,IonInput, IonIcon } from '@ionic/vue'; 
import {  scan, close } from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { StreamBarcodeReader } from "vue-barcode-reader";
import {searchProduct} from "@/plugins/interfaceControler"

// State variables
const isSupported = ref(false);
const showScan = ref(false);
const barcodes = ref([]);
const searchValue = ref()
const iFrame = ref()
const shopUrl = ref()
// Check if barcode scanning is supported when the component mounts
onMounted(async () => {
  const result = await BarcodeScanner.isSupported();
  isSupported.value = result.supported;
});

watch(searchValue,(value)=>searchMe(value))

let timer
async function searchMe(evt){
  if (!searchValue.value) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(async ()=>{
      const product = await searchProduct(searchValue.value)
      if (!product) return alert(`Product ${searchValue.value} kan niet gevonden worden`)
      barcodes.value.push(product)
      searchValue.value = ''
  },400)
  
  //
}

function onLoaded(){
  console.log('cameraReady')
}
function getResults(a, b, c) {
  showScan.value = false
  searchValue.value = a
  searchMe()
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
  //barcodes.value.push(...scannedBarcodes);
  searchValue.value = scannedBarcodes.barcode || scannedBarcodes.rawValue
  searchMe()
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
iframe {
  border:0;
  width:100%;
  height:99%;
}
</style>