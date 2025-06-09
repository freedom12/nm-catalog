<template>
  <div style="margin-top: 3rem">
    <input type="file" multiple @change="handleFiles" accept=".xlsx" :disabled="loading" />
  </div>
  <div>
    <label>
      <input type="checkbox" name="desc" v-model="desc" :disabled="loading" />
      第一个工作表游戏排序为发布倒序
    </label>
  </div>
  <div style="text-align: right">
    <button @click="uploadFiles" :disabled="loading">上传</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const files = ref([]);
const desc = ref(false);
const loading = ref(false);

const handleFiles = (event: any) => {
  files.value = Array.from(event.target.files);
};

const uploadFiles = async () => {
  loading.value = true;

  const formData = new FormData();
  files.value.forEach((file) => formData.append('files', file));
  formData.append('desc', desc.value.toString());

  try {
    const res = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    console.log(res.data);
    alert('上传成功');
  } catch (err) {
    console.error(err);
    alert('上传失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
div {
  width: 300px;
  margin: 15px auto;
}
label {
  display: flex;
  align-items: center;
  font-size: 12px;
}
</style>
