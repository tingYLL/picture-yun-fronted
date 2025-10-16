<template>
  <a-modal
    v-model:visible="visible"
    title="升级VIP会员"
    :footer="null"
    width="600px"
    @cancel="handleCancel"
  >
    <div class="payment-modal-content">
      <div class="user-benefits">
        <h3>会员权益对比</h3>
        <a-table :columns="columns" :data-source="data" :pagination="false" />
      </div>

      <div class="payment-section">
        <h3>支付方式</h3>
        <div class="qr-code-container">
          <div class="qr-code">
            <canvas ref="qrCodeCanvas" width="200" height="200" />
            <p>二维码有效期：<span class="countdown">{{ countdown }}</span></p>
          </div>
          <div class="redeem-section">
            <a-input v-model:value="redeemCode" placeholder="请输入兑换码" />
            <a-button type="primary" @click="handleRedeem">兑换</a-button>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted ,nextTick } from 'vue';
import QRCode from 'qrcode';

const visible = ref(false);
const countdown = ref<string>('05:00');
const redeemCode = ref<string>('');
let countdownInterval: number | null = null;

const startCountdown = () => {
  let minutes = 5;
  let seconds = 0;

  countdownInterval = setInterval(() => {
    if (seconds === 0) {
      if (minutes === 0) {
        clearInterval(countdownInterval as number);
        countdown.value = '已过期';
        return;
      }
      minutes--;
      seconds = 59;
    } else {
      seconds--;
    }

    countdown.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
};

const stopCountdown = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
};

const columns = [
  {
    title: '会员类型',
    dataIndex: 'type',
    key: 'type',
  },
  {
    title: '每日下载次数',
    dataIndex: 'downloads',
    key: 'downloads',
  },
  {
    title: '价格',
    dataIndex: 'price',
    key: 'price',
  },
];

const data = [
  {
    key: '1',
    type: '普通用户',
    downloads: '5次/天',
    price: '免费',
  },
  {
    key: '2',
    type: 'VIP会员',
    downloads: '50次/天',
    price: '10元/月',
  },
];

const handleCancel = () => {
  visible.value = false;
  stopCountdown();
};

const qrCodeCanvas = ref<HTMLCanvasElement | null>(null);

const openModal = () => {
  visible.value = true;
  countdown.value = '05:00';
  startCountdown();
  nextTick(() => {
    generateQRCode();
  });
};

// 生成支付二维码
const qrCodeUrl = ref<string>('https://www.bilibili.com');

const generateQRCode = () => {
  if (qrCodeCanvas.value) {
    QRCode.toCanvas(qrCodeCanvas.value, qrCodeUrl.value, {
      width: 200,
      margin: 1,
    }, (error) => {
      if (error) {
        console.error('生成二维码失败:', error);
        return;
      }
      console.log('二维码生成成功');
    });
  } else {
    // 这里的报错信息可以更具体
    console.error('Canvas 元素在 Modal 打开后仍然未找到');
  }
};

//不要用onMounted，因为onMounted在组件挂载后执行，而这里需要的是在Modal打开后执行
// onMounted(() => {
//   if (qrCodeCanvas.value) {
//     QRCode.toCanvas(qrCodeCanvas.value, 'https://example.com/payment-demo', {
//       width: 200,
//       margin: 1,
//     }, (error) => {
//       if (error) {
//         console.error('生成二维码失败:', error);
//         return;
//       }
//       console.log('二维码生成成功');
//     });
//   } else {
//     console.error('Canvas 元素未找到');
//   }
// });

const handleRedeem = () => {
  if (redeemCode.value.trim() === '') {
    alert('请输入兑换码');
    return;
  }
  // 兑换逻辑
  alert(`兑换码：${redeemCode.value} 已提交`);
};
// 暴露函数给父组件
defineExpose({
  openModal,
})
</script>

<style scoped>
.payment-modal-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-benefits {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-benefits h3 {
  margin-bottom: 12px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.payment-section {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-section h3 {
  margin-bottom: 12px;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.qr-code-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.qr-code {
  text-align: center;
  flex: 1;
}

.qr-code canvas {
  width: 200px;
  height: 200px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
}

.countdown {
  color: #ff4d4f;
  font-weight: 500;
}

.redeem-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.redeem-section .ant-input {
  border-radius: 4px;
  padding: 8px 12px;
}

.redeem-section .ant-btn {
  border-radius: 4px;
  font-weight: 500;
}
</style>
