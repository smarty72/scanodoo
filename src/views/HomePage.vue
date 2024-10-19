<template>
  <div>
  <ion-menu content-id="main-content">
    <ion-header mode="ios">
      <ion-toolbar color="primary">
        <ion-title>Menu</ion-title>
        <ion-menu-toggle slot="end">
        <ion-button>
          <ion-icon :icon="close"></ion-icon>
        </ion-button>
      </ion-menu-toggle>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding" color="dark">
      <ion-list color="dark" style="--ion-background-color:transparent">
        <ion-item color="dark" button detail @click="showSearch=false">
          <ion-icon :icon="home" slot="start"></ion-icon>
          <ion-label>Thuis</ion-label></ion-item>
          <ion-item color="dark" button detail @click="doScan();showSearch=false">
          <ion-icon :icon="barcodeOutline" slot="start"></ion-icon>
          <ion-label>Scannen</ion-label></ion-item>
          <ion-item color="dark" button detail @click="showSearch=!showSearch">
          <ion-icon :icon="search" slot="start"></ion-icon>
          <ion-label>Zoeken</ion-label></ion-item>
          <ion-item color="dark" button detail>
          <ion-icon :icon="cart" slot="start"></ion-icon>
          <ion-label>Winkelwagen</ion-label></ion-item>
          <ion-item color="dark" button detail>
          <ion-icon :icon="exit" slot="start"></ion-icon>
          <ion-label>Login</ion-label></ion-item>
      </ion-list>
    </ion-content>
  </ion-menu>
  <ion-page id="main-content">
    <ion-header mode="ios">
  <ion-toolbar color="primary">
    <ion-menu-toggle slot="start">
        <ion-button>
          <ion-icon :icon="menu"></ion-icon>
        </ion-button>
      </ion-menu-toggle>
      <ion-button slot="start" @click="doScan();showSearch=false">
          <ion-icon :icon="barcodeOutline"></ion-icon>
        </ion-button>
      <ion-img src="./img/logo.png" style="height:50px"></ion-img>
      <ion-button slot="end" @click="showSearch=!showSearch">
          <ion-icon :icon="search"></ion-icon>
        </ion-button>
        <ion-button slot="end">
          <ion-icon :icon="cart"></ion-icon>
        </ion-button>
    <!--ion-title>Barcode Scanner</ion-title-->
  </ion-toolbar>
  <ion-toolbar color="primary" v-if="showSearch">
    <ion-searchbar placeholder="Scan een barcode of zoek op artikelnummer" mode="ios" v-model="searchValue" @ionInput="searchMe"></ion-searchbar>
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
  <div v-else-if="!showScan" class="info">
  <ion-card >
    <ion-img src="./img/logoinvert.png"></ion-img>
    <ion-card-header>
      <ion-card-title class="ion-text-center">Welkom bij Tijssen</ion-card-title>
    </ion-card-header>
    <ion-card-content class="ion-text-center ion-padding">

      Deze app is speciaal ontwikkeld voor onze klanten. U kunt nu met uw mobiel telefoon of tablet door de winkel lopen, producten scannen en toevoegen aan uw winkelwagen. Vergeet niet in te loggen linksboven! 
      <br><br>
      De winkelwagen is gekoppeld met de winkelwagen in onze webshop. U kunt de app en de webshop dus naast elkaar gebruiken of apart. Net wat u fijn vindt.
      <br>Heeft u hulp nodig?
      <br>Schroom niet om ons te bellen<br>(071-3419125)
    </ion-card-content>
  </ion-card>
</div>
  <ion-fab slot="fixed" vertical="bottom" horizontal="end">
    <ion-fab-button @click="doScan()">
      <ion-icon :icon="close" v-if="showScan"></ion-icon>
      <ion-icon :icon="barcodeOutline" v-else></ion-icon>
    </ion-fab-button>
  </ion-fab>
</ion-content>
  </ion-page>
</div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { alertController,IonMenuToggle, IonTitle, IonMenu, IonButton, IonContent,IonSearchbar,IonNote, IonPage, IonItem, IonHeader,IonImg, IonToolbar, IonLabel,IonFab,IonList,IonFabButton,IonInput, IonIcon,
  IonCard,IonCardHeader,IonCardTitle, IonCardContent
 } from '@ionic/vue'; 
import {  barcodeOutline, close,home,search,cart,exit, menu  } from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { StreamBarcodeReader } from "vue-barcode-reader";
import {searchProduct} from "@/plugins/interfaceControler"

// State variables
const isSupported = ref(false);
const showScan = ref(false);
const showSearch= ref(false);
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
async function searchMe(search=searchValue.value){
  if (!search) return
  if (timer) clearTimeout(timer)
  timer = setTimeout(async ()=>{
      const product = await searchProduct(search)
      if (!product) return alert(`Product ${search} kan niet gevonden worden`)
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
  searchMe(a)
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

  
  const result = await BarcodeScanner.scan();
  try {
    if (result && result.barcodes.length > 0) {
      // Get the first barcode from the result
      const scannedBarcode = result.barcodes[0].rawValue;
      searchMe(scannedBarcode)
      
      console.log('Scanned Barcode: ', scannedBarcode);
      return scannedBarcode;
    } else {
      alert('Geen geldige basrcode gevonden' + scannedBarcode);
      alert(result)
      return null;
    }
    } catch (error) {
    console.error('Fout bij het scannen: ', error);
    return null;
    }

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
ion-icon[slot="start"]{
  margin-inline-end: 12px!important;
}
div.info {
  max-width: 500px;
  
  margin-left:auto;
  margin-right:auto;
}
</style>