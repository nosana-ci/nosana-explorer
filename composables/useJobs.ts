const jobs: Ref<Array<any> | undefined> = ref(undefined);

export const useJobs = () => {
  return jobs;
};
