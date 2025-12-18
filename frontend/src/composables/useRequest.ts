import { ref } from 'vue';

export const useRequest = () => {
  const loading = ref(false);

  const request = async <T>(promise: Promise<T>): Promise<T> => {
    loading.value = true;
    try {
      return await promise;
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return { loading, request };
};
