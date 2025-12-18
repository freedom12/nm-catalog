<template>
  <form class="container">
    <div>
      <input
        type="file"
        ref="fileInput"
        multiple
        @change="handleFiles"
        accept=".xlsx"
        :disabled="loading"
      />
    </div>
    <div>
      <label>
        <input type="checkbox" name="desc" v-model="desc" :disabled="loading" />
        In descending order
      </label>
    </div>
    <div>
      <label>
        <input
          type="checkbox"
          name="fullUpdate"
          v-model="fullUpdate"
          :disabled="loading"
        />
        Full update
      </label>
    </div>
    <div>
      <button @click="uploadFiles" :disabled="loading">Upload</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const fileInput = ref<HTMLInputElement | null>(null);
const files = ref([]);
const desc = ref(false);
const fullUpdate = ref(false);
const loading = ref(false);

const handleFiles = (event: any) => {
  files.value = Array.from(event.target.files);
};

const uploadFiles = async () => {
  if (!files.value.length) {
    alert('Please select files.');
    return;
  }

  loading.value = true;

  const formData = new FormData();
  files.value.forEach((file) => formData.append('files', file));
  formData.append('desc', desc.value.toString());
  formData.append('fullUpdate', fullUpdate.value.toString());

  try {
    const res = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log(res.data);
    alert(`Sucessfully added ${res.data.new} game(s), now ${res.data.total} in total.`);
    if (!!fileInput?.value) {
      files.value = [];
      fileInput.value.value = '';
    }
  } catch (error) {
    console.error(error);
    alert('Upload failed.');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.container {
  width: 400px;
  margin: 3em auto;
  border: 1px solid #535bf2;
  padding: 2rem;

  > div {
    margin-bottom: 0.5rem;
    text-align: left;

    &:first-child {
      margin-bottom: 3rem;
    }

    &:last-child {
      margin-top: 2rem;
      margin-bottom: 0;
      text-align: right;
    }
  }
}
</style>
