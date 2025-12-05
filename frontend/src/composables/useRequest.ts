import { ref } from 'vue';

export const useRequest = () => {
  const loading = ref(false);

  const request = async <T>(promise: Promise<T>): Promise<T> => {
    loading.value = true;
    try {
      return await promise;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { loading, request };
};
