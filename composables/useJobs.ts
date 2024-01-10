const jobs: Ref<Array<any> | undefined> = ref(undefined);
const runs: Ref<Array<any> | undefined> = ref(undefined);
const jsonJobs: Ref<any> = ref(undefined);

const { nosana, network } = useSDK();

watch(network, () => {
  jobs.value = undefined;
  runs.value = undefined;
});
const loadingJobs = ref(false);

const importJobsJson = async () => {
  try {
    jsonJobs.value = await import(`@/static/${network.value}-jobs.json`);
  } catch (error) {
    console.error('import of json failed', error);
  }
};

const getJobs = async (filters?: any) => {
  console.log('retrieving jobs..');
  loadingJobs.value = true;
  try {
    await importJobsJson();
  } catch (e) {}

  try {
    let allJobs = await nosana.value.jobs.all(filters);
    const allRuns = await nosana.value.jobs.getActiveRuns();
    const ids = new Set(allJobs.map((d) => d.pubkey.toString()));

    console.log('Start matching runs', allRuns.length);
    runs.value = allRuns;
    for (let i = 0; i < allRuns.length; i++) {
      if (filters && filters.node) {
        if (allRuns[i].account.node.toString() === filters.node) {
          allJobs.push({
            state: 1,
            pubkey: allRuns[i].account.job,
            timeStart: allRuns[i].account.time,
            timeEnd: 0,
          });
        }
      } else {
        // this also gets really slow when there are a lot of jobs
        // but not sure how to improve this if we still wanna show running jobs
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
    }
    console.log('Done matching runs');

    // get unique jobs from both rpc and json
    allJobs = [
      ...allJobs,
      ...jsonJobs.value.default.filter(
        (d: any) => !ids.has(d.pubkey.toString()),
      ),
    ];

    allJobs = allJobs.filter((j) => {
      // check if running
      return j.state !== 3 && (j.timeStart || j.state < 2);
    });

    allJobs = allJobs.sort((a, b) => {
      if (a.timeStart === 0) return 1;
      if (b.timeStart === 0) return -1;
      return b.timeStart - a.timeStart;
    });

    if (!filters) {
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

// should only be used to export jobs
const getAllJobs = async () => {
  console.log('retrieving ALL jobs..');
  loadingJobs.value = true;
  try {
    const allJobs = await nosana.value.jobs.allFullJobs();
    loadingJobs.value = false;
    return allJobs;
  } catch (e) {
    console.error(e);
  }
  loadingJobs.value = false;
};

export const useJobs = () => {
  return {
    jobs,
    getJobs,
    loadingJobs,
    runs,
    getActiveRuns,
    getAllJobs,
  };
};
