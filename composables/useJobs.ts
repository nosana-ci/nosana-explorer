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
    jobs.value = await nosana.value.jobs.all();
  } catch (e) {
    console.error(e);
  }
  loadingJobs.value = false;
};
getJobs();

export const useJobs = () => {
  return { jobs, getJobs, loadingJobs };
};
