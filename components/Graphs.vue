<template>
  <div>
    <div class="columns">
      <div class="column">
        <div class="box">
          <h2 class="title is-5">
            Jobs
            <span>
              <count-up v-if="jobs" :end-val="jobs.length"></count-up>
              <span v-else-if="loadingJobs">...</span>
              <span v-else>-</span>
            </span>
          </h2>

          <Line
            :options="lineOptions"
            :data="jobData"
            style="height: 200px; width: 100%"
          />
        </div>
      </div>
      <div class="column">
        <div class="box">
          <h2 class="title is-5">
            Nodes
            <span>
              <count-up v-if="nodes" :end-val="nodes.length"></count-up>
              <span v-else-if="loadingNodes">...</span>
              <span v-else>-</span>
            </span>
          </h2>
          <Bar
            :options="barOptions"
            :data="nodeData"
            style="height: 200px; width: 100%"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import CountUp from 'vue-countup-v3';
import { Bar, Line } from 'vue-chartjs';
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';

import {
  Chart as Chartjs,
  ChartData,
  ChartOptions,
  TimeScale,
  CategoryScale,
  LinearScale,
  LineController,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  BarController,
  BarElement,
  Interaction,
} from 'chart.js';
import { CrosshairPlugin, Interpolate } from 'chartjs-plugin-crosshair';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
dayjs.extend(isoWeek);

declare module 'chart.js' {
  interface InteractionModeMap {
    interpolate: Interpolate;
  }
}

const { jobs, loadingJobs } = useJobs();
const { nodes, loadingNodes } = useNodes();
Interaction.modes.interpolate = Interpolate;

Chartjs.register(
  TimeScale,
  LineElement,
  LineController,
  CategoryScale,
  BarController,
  LinearScale,
  PointElement,
  BarElement,
  Filler,
  Tooltip,
  CrosshairPlugin,
);

const nodeData = computed<ChartData<'bar'>>(() => {
  const data: Array<any> = nodes.value ? nodes.value : [];
  const updatedData: Array<any> = [];
  const labels: Array<any> = [];
  data.forEach((n) => {
    if (labels.includes(n.country)) {
      const index = labels.indexOf(n.country);
      const element = updatedData[index];
      updatedData[index] = element + 1;
    } else {
      labels.push(n.country);
      updatedData.push(1);
    }
  });
  // test data:
  labels.push(
    'Test Country 1',
    'Test Country 2',
    'Test Country 3',
    'Test Country 4',
    'Test Country 5',
  );
  updatedData.push(
    Math.floor(Math.random() * 10) + 1,
    Math.floor(Math.random() * 10) + 1,
    Math.floor(Math.random() * 10) + 1,
    Math.floor(Math.random() * 10) + 1,
    Math.floor(Math.random() * 10) + 1,
  );
  return {
    labels,
    datasets: [
      {
        label: 'Nodes',
        borderWidth: 3,
        borderColor: '#2feb2b',
        backgroundColor: '#2feb2b45',
        data: updatedData,
      },
    ],
  };
});

const jobData = computed<ChartData<'line'>>(() => {
  const data: Array<any> = jobs.value ? [...jobs.value] : [];
  const updatedData: Array<any> = [];
  const tempDateCollection: Array<any> = [];

  data
    .sort((a, b) => b.timeStart - a.timeStart)
    .forEach((j) => {
      const timestamp = j.timeStart * 1000;
      if (timestamp) {
        const formatedDate = dayjs(timestamp).format('MMM/YYYY');
        const currentDate = new Date(timestamp);
        const startDate = new Date(currentDate.getFullYear(), 0, 1);
        const days = Math.floor(
          (currentDate - startDate) / (24 * 60 * 60 * 1000),
        );

        const weekNumber = Math.ceil(days / 7);

        if (tempDateCollection.includes(weekNumber + formatedDate)) {
          const index = tempDateCollection.indexOf(weekNumber + formatedDate);
          const element = updatedData[index];
          updatedData[index] = {
            x: updatedData[index].x,
            y: element.y + 1,
          };
        } else {
          tempDateCollection.push(weekNumber + formatedDate);
          updatedData.push({
            x: timestamp,
            y: 1,
          });
        }
      }
    });
  return {
    datasets: [
      {
        fill: true,
        cubicInterpolationMode: 'monotone',
        label: 'Jobs',
        borderColor: '#2feb2b',
        showLine: true,
        backgroundColor: '#2feb2b45',
        data: updatedData,
        interpolate: true,
      },
    ],
  };
});

// @ts-ignore
const barOptions = computed<ChartOptions<'bar'>>(() => ({
  // responsive: true,
  interaction: {
    intersect: false,
  },
  plugins: {
    crosshair: false,
  },
  scales: {
    x: {
      grid: {
        display: false,
        tickBorderDash: [2, 4],
      },
      border: {
        dash: [2, 4],
      },
    },
    y: {
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

const lineOptions = computed<ChartOptions<'line'>>(() => ({
  // responsive: true,
  interaction: {
    intersect: false,
  },
  plugins: {
    tooltip: {
      intersect: false,
      mode: 'index',
    },
    crosshair: {
      sync: {
        enable: false,
      },
      line: {
        color: '#2feb2b', // crosshair line color
      },
      zoom: {
        enabled: true, // enable zooming
        zoomButtonText: 'Reset Zoom', // reset zoom button text
        zoomButtonClass: 'button is-small is-outlined reset-zoom', // reset zoom button class
      },
    },
  },
  scales: {
    x: {
      type: 'time',

      grid: {
        tickBorderDash: [2, 4],
      },
      border: {
        dash: [2, 4],
      },
      time: {
        unit: 'month',
        // round: 'day',
        tooltipFormat: '[Week] W MMM YYYY',
      },
    },
    y: {
      beginAtZero: true,
      border: {
        dash: [2, 4],
      },
      grid: {
        tickBorderDash: [2, 4],
      },
    },
  },
}));
</script>

<style lang="scss" scoped>
.countup-wrap {
  display: inline;
}
</style>
<style lang="scss">
.reset-zoom {
  position: absolute;
  top: 20px;
  right: 20px;
}
</style>
