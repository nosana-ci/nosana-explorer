const jobs: Ref<Array<any> | undefined> = ref(undefined);
const runs: Ref<Array<any> | undefined> = ref(undefined);

const { nosana, network } = useSDK();

watch(network, () => {
  jobs.value = undefined;
  runs.value = undefined;
});
const loadingJobs = ref(false);

const getJobs = async (market?: string) => {
  console.log('retrieving jobs..');
  loadingJobs.value = true;
  try {
    let allJobs = await nosana.value.jobs.all(market ? { market } : undefined);
    const allRuns = await nosana.value.jobs.getActiveRuns();
    runs.value = allRuns;
    await getActiveRuns();
    for (let i = 0; i < allRuns.length; i++) {
      const job = allJobs.find(
        (j) =>
          j.pubkey.toString() === allRuns[i].account.job.toString() &&
          j.state === 0,
      );
      if (job) {
        job.state = 1;
        job.timeStart = allRuns[i].account.time;
      }
    }
    allJobs = allJobs.filter((j) => {
      // check if running
      return j.state !== 3 && (j.timeStart || j.state < 2);
    });
    allJobs = allJobs.sort((a, b) => {
      if (a.timeStart === 0) return 1;
      if (b.timeStart === 0) return -1;
      return b.timeStart - a.timeStart;
    });
    if (!market) {
      jobs.value = allJobs;
    }
    loadingJobs.value = false;
    return allJobs;
  } catch (e) {
    console.error(e);
  }
  loadingJobs.value = false;
};

const getActiveRuns = async () => {
  console.log('retrieving all active runs..');
  try {
    runs.value = await nosana.value.jobs.getActiveRuns();
  } catch (e) {
    console.error(e);
  }
};

export const useJobs = () => {
  return {
    jobs,
    getJobs,
    loadingJobs,
    runs,
    getActiveRuns,
  };
};
