<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <h2>添加订单</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>报价</label>
          <input
            v-model.number="formData.price"
            type="number"
            step="0.01"
            required
            placeholder="请输入报价"
          />
        </div>

        <div class="form-group">
          <label>支出</label>
          <input
            v-model.number="formData.cost"
            type="number"
            step="0.01"
            required
            placeholder="请输入支出"
          />
        </div>

        <div class="form-group">
          <label>平台分成 ({{ (formData.plat_share * 100).toFixed(0) }}%)</label>
          <input
            v-model.number="formData.plat_share"
            type="number"
            step="0.01"
            min="0"
            max="1"
            required
          />
        </div>

        <div class="form-group">
          <label>工作室抽成 ({{ (formData.studio_share * 100).toFixed(0) }}%)</label>
          <input
            v-model.number="formData.studio_share"
            type="number"
            step="0.01"
            min="0"
            max="1"
            required
          />
        </div>

        <div class="form-group">
          <label>联络员</label>
          <input
            v-model="formData.connector"
            type="text"
            required
            placeholder="请输入联络员用户名"
          />
        </div>

        <div class="form-group">
          <label>备注</label>
          <textarea
            v-model="formData.note"
            required
            placeholder="请输入备注"
          ></textarea>
        </div>

        <div class="developers-section">
          <h3>开发者贡献</h3>
          <div
            v-for="(dev, index) in developers"
            :key="index"
            class="developer-row"
          >
            <input
              v-model="dev.name"
              type="text"
              required
              placeholder="用户名"
            />
            <input
              v-model.number="dev.contrib_ratio"
              type="number"
              step="0.01"
              min="0"
              max="1"
              required
              placeholder="贡献比例"
            />
            <button
              v-if="developers.length > 1"
              type="button"
              class="btn btn-danger"
              @click="removeDeveloper(index)"
            >
              移除
            </button>
          </div>
          <button type="button" class="btn btn-secondary" @click="addDeveloper">
            添加开发者
          </button>
          <div class="total-ratio" :class="{ 'total-ratio--error': totalRatio !== 1 }">
            总贡献比例: {{ (totalRatio * 100).toFixed(0) }}%
            <span v-if="totalRatio !== 1" class="error-message">
              (必须为100%)
            </span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="handleClose">
            取消
          </button>
          <button type="submit" class="btn btn-primary" :disabled="totalRatio !== 1">
            提交
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'submit']);

const formData = ref({
  price: "",
  cost: 0,
  plat_share: 0.4,
  studio_share: 0.2,
  note: "",
  developers: [],
  connector: "",
});

const developers = ref([
  { name: "", contrib_ratio: 0 },
]);

const totalRatio = computed(() => {
  return developers.value.reduce((sum, dev) => sum + dev.contrib_ratio, 0);
});

const addDeveloper = () => {
  developers.value.push({ username: "", contrib_ratio: 0 });
};

const removeDeveloper = (index) => {
  if (developers.value.length > 1) {
    developers.value.splice(index, 1);
  }
};

const handleSubmit = () => {
  if (totalRatio.value !== 1) {
    alert("开发者贡献比例总和必须为100%");
    return;
  }

  const orderData = {
    ...formData.value,
    price: parseFloat(formData.value.price),
    cost: parseFloat(formData.value.cost),
    developers: developers.value,
  };

  emit('submit', orderData);
  resetForm();
};

const handleClose = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  formData.value = {
    price: "",
    cost: 0,
    plat_share: 0.4,
    studio_share: 0.2,
    note: "",
    developers: [],
    connector: "",
  };
  developers.value = [{ name: "", contrib_ratio: 0 }];
};

watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: $spacing-lg;
  animation: fadeIn 0.2s ease-in-out;
}

.modal-content {
  background-color: $bg-primary;
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease-out;
  padding: $spacing-xl;

  h2 {
    margin-bottom: $spacing-lg;
    font-size: $font-size-2xl;
    color: $text-primary;
  }

  h3 {
    margin: $spacing-lg 0 $spacing-md;
    font-size: $font-size-xl;
    color: $text-primary;
  }
}

.developers-section {
  margin: $spacing-xl 0;
  padding: $spacing-lg;
  background: $bg-secondary;
  border-radius: $radius-lg;
}

.developer-row {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;
}

.total-ratio {
  margin-top: $spacing-md;
  padding: $spacing-md;
  background: $bg-primary;
  border-radius: $radius-md;
  font-weight: 600;
  color: $text-primary;

  &--error {
    background: rgba($danger-color, 0.1);
    color: $danger-color;
  }
}

.error-message {
  font-size: $font-size-sm;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: $spacing-md;
  margin-top: $spacing-xl;
}

.form-actions .btn {
  flex: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
