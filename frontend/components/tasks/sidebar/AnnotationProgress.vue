<template>
  <v-card>
    <v-card-title>Progress</v-card-title>
    <v-card-text>
      <v-list class="pt-0" dense>
        <v-list-item class="pa-0">
          <v-list-item-title>Total</v-list-item-title>
          <v-list-item-subtitle class="text-right" v-text="progress.total" />
        </v-list-item>
        <v-list-item class="pa-0">
          <v-list-item-title>Complete</v-list-item-title>
          <v-list-item-subtitle class="text-right" v-text="progress.complete" />
        </v-list-item>
      </v-list>
      <v-progress-linear :value="percentage" color="success" height="25">
        <template #default="{ value }">
          <strong>{{ value }}%</strong>
        </template>
      </v-progress-linear>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import type { PropType } from 'vue'
import Vue from 'vue'
import { MyProgress } from '@/domain/models/metrics/metrics'

export default Vue.extend({
  props: {
    progress: {
      type: Object as PropType<MyProgress>,
      required: true
    }
  },
  data() {
    return{
        toggleddev : false,
        startTime: new Date(),
        elapsedTime: '', 
        elapsedHours : 0,
        elapsedMinutes : 0,
        elapsedSeconds : 0,
        fullTime : 0,
    }
  },
  computed: {
    percentage(): number {
      return Math.ceil((this.progress.complete / this.progress.total) * 100)
    }
  },
  mounted() {
    
    setInterval(this.updateElapsedTime, 1000);
  },
  methods: {
    updateElapsedTime() {
      // Calculate the elapsed time
      const currentTime : Date = new Date();
      const k : Date = this.startTime
      const elapsedMilliseconds = currentTime.valueOf() - k.valueOf() 
      const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);

    //   console.log(elapsedMilliseconds)
      // Format the elapsed time (you can customize the formatting as needed)
      const hours = Math.floor(elapsedSeconds / 3600);
      const minutes = Math.floor((elapsedSeconds % 3600) / 60);
      const seconds = elapsedSeconds % 60;
      this.elapsedSeconds = seconds;
      this.elapsedHours = hours;
      this.elapsedMinutes = minutes;
      // Update the elapsedTime data property with the formatted time
      this.elapsedTime = `${hours}h ${minutes}m ${seconds}s`;
    //   console.log(this.elapsedTime)
    //   this.fullTime = elapsedSeconds;
    //   console.log(this.fullTime)
    },
  },
})
</script>
