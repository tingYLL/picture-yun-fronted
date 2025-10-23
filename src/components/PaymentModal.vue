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
        <div class="payment-methods">
          <a-radio-group v-model:value="paymentMethod" button-style="solid" size="large" @change="handlePaymentMethodChange">
            <a-radio-button value="alipay">
              <div class="payment-method-option">
                <AlipayCircleOutlined class="payment-icon alipay-icon" />
                <span>支付宝</span>
                <a-tag color="orange" class="recommend-tag">推荐</a-tag>
              </div>
            </a-radio-button>
            <a-radio-button value="wechat">
              <div class="payment-method-option">
                <WechatOutlined class="payment-icon wechat-icon" />
                <span>微信支付</span>
              </div>
            </a-radio-button>
          </a-radio-group>
        </div>

        <div class="qr-code-container">
          <div class="qr-code">
            <div class="qr-code-header">
              <span v-if="paymentMethod === 'alipay'" class="payment-name alipay-text">
                <AlipayCircleOutlined class="payment-icon-small" />
                支付宝扫码支付
              </span>
              <span v-else class="payment-name wechat-text">
                <WechatOutlined class="payment-icon-small" />
                微信扫码支付
              </span>
            </div>
            <div class="qr-code-wrapper">
              <canvas ref="qrCodeCanvas" width="200" height="200" />
            </div>
            <p class="qr-tips">请使用{{ paymentMethod === 'alipay' ? '支付宝' : '微信' }}扫描二维码完成支付</p>
            <p>二维码有效期：<span class="countdown">{{ countdown }}</span></p>
          </div>
          <div class="redeem-section">
            <div class="redeem-header">
              <span>兑换码</span>
            </div>
            <a-input v-model:value="redeemCode" placeholder="请输入兑换码" size="large" />
            <a-button type="primary" @click="handleRedeem" :loading="isRedeeming" size="large" block>立即兑换</a-button>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted ,nextTick } from 'vue';
import QRCode from 'qrcode';
import { redeemVipUsingPost } from '@/api/vipController';
import { useLoginUserStore } from '@/stores/useLoginUserStore';
import { message } from 'ant-design-vue';
import { WechatOutlined, AlipayCircleOutlined } from '@ant-design/icons-vue';

const loginUserStore = useLoginUserStore();

const visible = ref(false);
const countdown = ref<string>('05:00');
const redeemCode = ref<string>('');
const isRedeeming = ref(false);
const paymentMethod = ref<'alipay' | 'wechat'>('alipay'); // 默认支付宝
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
    downloads: '20次/天',
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
const getQRCodeUrl = () => {
  // 模拟不同支付方式的二维码URL（实际使用时应该从后端获取）
  const timestamp = Date.now();
  if (paymentMethod.value === 'alipay') {
    return `https://qr.alipay.com/demo/vip-payment-${timestamp}`;
  } else {
    return `https://wxpay.wxutil.com/demo/vip-payment-${timestamp}`;
  }
};

const generateQRCode = () => {
  const qrCodeUrl = getQRCodeUrl();
  if (qrCodeCanvas.value) {
    QRCode.toCanvas(qrCodeCanvas.value, qrCodeUrl, {
      width: 200,
      margin: 1,
    }, (error) => {
      if (error) {
        console.error('生成二维码失败:', error);
        return;
      }
      console.log('二维码生成成功:', qrCodeUrl);
    });
  } else {
    console.error('Canvas 元素在 Modal 打开后仍然未找到');
  }
};

// 处理支付方式切换
const handlePaymentMethodChange = () => {
  // 重置倒计时
  stopCountdown();
  countdown.value = '05:00';
  startCountdown();

  // 重新生成二维码
  nextTick(() => {
    generateQRCode();
  });

  // message.info(`已切换至${paymentMethod.value === 'alipay' ? '支付宝' : '微信'}支付`);
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

const handleRedeem = async () => {
  if (redeemCode.value.trim() === '') {
    message.warning('请输入兑换码');
    return;
  }

  isRedeeming.value = true;

  try {
    const res = await redeemVipUsingPost({
      code: redeemCode.value.trim()
    });

    if (res.data.code === 0) {
      message.success('兑换成功！');
      // 刷新用户信息以更新VIP状态
      await loginUserStore.fetchLoginUser();
      // 清空兑换码
      redeemCode.value = '';
      // 关闭弹窗
      handleCancel();
    } else {
      message.error(res.data.message || '兑换失败，请检查兑换码是否正确');
    }
  } catch (error: any) {
    console.error('兑换VIP失败:', error);
    message.error(error.message || '兑换失败，请稍后重试');
  } finally {
    isRedeeming.value = false;
  }
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

/* 支付方式选择器 */
.payment-methods {
  margin-bottom: 20px;
}

.payment-methods :deep(.ant-radio-group) {
  width: 100%;
  display: flex;
  gap: 12px;
}

.payment-methods :deep(.ant-radio-button-wrapper) {
  flex: 1;
  height: auto;
  padding: 12px 20px;
  border-radius: 8px;
  transition: all 0.3s;
  border: 1px solid #d9d9d9;
}

.payment-methods :deep(.ant-radio-button-wrapper:hover) {
  border-color: #1890ff;
  color: rgba(0, 0, 0, 0.88);
}

.payment-methods :deep(.ant-radio-button-wrapper-checked) {
  border-color: #1890ff;
  background: #e6f7ff;
  color: rgba(0, 0, 0, 0.88);
}

.payment-methods :deep(.ant-radio-button-wrapper-checked:hover) {
  border-color: #1890ff;
  background: #e6f7ff;
  color: rgba(0, 0, 0, 0.88);
}

.payment-method-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
}

/* 支付图标 */
.payment-icon {
  font-size: 20px;
}

.payment-icon-small {
  font-size: 18px;
  margin-right: 6px;
}

.alipay-icon {
  color: #1677ff;
}

.wechat-icon {
  color: #07c160;
}

.recommend-tag {
  font-size: 12px;
  margin-left: 4px;
  border: none;
}

/* 二维码容器 */
.qr-code-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 30px;
  margin-top: 16px;
}

.qr-code {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.qr-code-header {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
}

.payment-name {
  display: flex;
  align-items: center;
}

.alipay-text {
  color: #1677ff;
}

.wechat-text {
  color: #07c160;
}

.qr-code-wrapper {
  margin-bottom: 12px;
}

.qr-code canvas {
  width: 200px;
  height: 200px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  padding: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.qr-tips {
  color: #666;
  font-size: 13px;
  margin: 8px 0 4px 0;
}

.countdown {
  color: #ff4d4f;
  font-weight: 600;
  font-size: 14px;
}

/* 兑换码区域 */
.redeem-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.redeem-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  text-align: center;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.redeem-section :deep(.ant-input) {
  border-radius: 6px;
  height: 44px;
  font-size: 14px;
}

.redeem-section :deep(.ant-btn) {
  height: 44px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 15px;
  margin-top: auto;
}

/* 响应式 */
@media (max-width: 768px) {
  .qr-code-container {
    flex-direction: column;
  }

  .payment-methods :deep(.ant-radio-group) {
    flex-direction: column;
  }
}
</style>
