const jobs: Ref<Array<any> | undefined> = ref(undefined);

const { nosana, network } = useSDK();

watch(network, () => {
  jobs.value = undefined;
  getJobs();
});

const loadingJobs = ref(false);

const getJobs = async () => {
  console.log('retrieving all jobs..');
  loadingJobs.value = true;
  try {
    jobs.value = await nosana.value.jobs.getAll();
  } catch (e) {
    console.error(e);
  }
  loadingJobs.value = false;
};

export const useJobs = () => {
  getJobs();
  return { jobs, getJobs, loadingJobs };
};
