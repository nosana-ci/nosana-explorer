<template>
  <div>
    <div style="height: 200px">
      <Bar :options="barOptions" :data="queueData" style="width: 100%" />
    </div>
    <table class="table is-fullwidth is-striped">
      <tbody>
        <tr>
          <td><b>Total Job Queue</b></td>
          <td>
            <span v-if="markets">
              {{
                markets.reduce(
                  (a, b) => a + (b.queueType === 0 ? b.queue.length : 0),
                  0,
                )
              }}
              jobs
            </span>
            <span v-else-if="loadingMarkets">...</span>
            <span v-else>-</span>
          </td>
        </tr>
        <tr>
          <td><b>Total Node Queue</b></td>
          <td>
            <span v-if="markets">
              {{
                markets.reduce(
                  (a, b) => a + (b.queueType === 1 ? b.queue.length : 0),
                  0,
                )
              }}
              nodes
            </span>
            <span v-else-if="loadingMarkets">...</span>
            <span v-else>-</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="!loadingMarkets && !markets">Could not load markets</div>
  </div>
</template>

<script lang="ts" setup>
import { Bar } from 'vue-chartjs';
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';

import {
  Chart as Chartjs,
  ChartData,
  ChartOptions,
  Tooltip,
  BarController,
  Legend,
  BarElement,
} from 'chart.js';

Chartjs.register(BarController, BarElement, Tooltip, Legend);

const { markets, loadingMarkets, getMarkets } = useMarkets();

// @ts-ignore
const queueData = computed<ChartData<'bar'>>(() => {
  const data: Array<any> = markets.value
    ? markets.value.filter((m) => m.queue.length)
    : [];
  return {
    labels: data.map((m) => m.address.toString().slice(0, 7) + '...'),
    datasets: [
      {
        label: 'Nodes',
        borderWidth: 3,
        borderColor: '#2feb2b',
        backgroundColor: '#2feb2b45',
        data: data.map((m) => (m.queueType === 1 ? m.queue.length : 0)),
      },
      {
        label: 'Jobs',
        borderWidth: 3,
        borderColor: '#f9d54b',
        backgroundColor: '#f9d54b45',
        data: data.map((m) => (m.queueType === 0 ? -m.queue.length : 0)),
      },
    ],
  };
});

// @ts-ignore
const barOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  // barThickness: 20,
  interaction: {
    intersect: false,
  },
  indexAxis: 'y',
  plugins: {
    legend: {
      position: 'bottom',
      onClick: () => {},
    },
    tooltip: {
      callbacks: {
        label: (tooltipItem) =>
          `${tooltipItem.dataset.label}: ${Math.abs(
            tooltipItem.formattedValue,
          )}`,
      },
    },
    crosshair: false,
  },
  scales: {
    x: {
      stacked: true,
      grid: {
        lineWidth: (v) => {
          return v.tick?.value === 0 ? 1 : 0;
        },
        color: '#000000',
      },
      ticks: {
        precision: 0,
        callback: function (value) {
          return Math.abs(value);
        },
      },
    },
    y: {
      stacked: true,
      border: {
        dash: [2, 4],
      },
      ticks: {
        precision: 0,
      },
      grid: {
        tickBorderDash: [2, 4],
      },
    },
  },
}));

// Fetch markets every 30 seconds
useIntervalFn(getMarkets, 30000);
</script>
