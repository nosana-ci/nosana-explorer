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
} from 'chart.js';
import dayjs from 'dayjs';

const { jobs, loadingJobs } = useJobs();
const { nodes, loadingNodes } = useNodes();

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

        if (tempDateCollection.includes(formatedDate)) {
          const index = tempDateCollection.indexOf(formatedDate);
          const element = updatedData[index];
          updatedData[index] = {
            x: updatedData[index].x,
            y: element.y + 1,
          };
        } else {
          tempDateCollection.push(formatedDate);
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
        backgroundColor: '#2feb2b45',
        data: updatedData,
      },
    ],
  };
});

const barOptions = computed<ChartOptions<'bar'>>(() => ({
  // responsive: true,
  interaction: {
    intersect: false,
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
        round: 'month',
        tooltipFormat: 'MMM YYYY',
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
