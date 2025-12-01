import { ref } from 'vue';

export const useRequest = () => {
  const loading = ref(false);

  const request = async (promise: Promise<any>): Promise<any> => {
    loading.value = true;
    try {
      const res = await promise;
      return res.data;
    } catch (err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  return { loading, request };
};
