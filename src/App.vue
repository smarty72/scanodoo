<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { StatusBar, Style } from '@capacitor/status-bar';
StatusBar.setBackgroundColor({color: '#31a64a'})

</script>
