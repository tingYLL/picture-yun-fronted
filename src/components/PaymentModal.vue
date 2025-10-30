<template>
  <a-modal
    v-model:visible="visible"
    title="升级VIP会员"
    :footer="null"
    width="800px"
    @cancel="handleCancel"
  >
    <div class="payment-modal-content">
      <!-- 简化的VIP状态信息展示 -->
      <div class="vip-status-section">
        <div class="vip-status-content">
          <div class="vip-info-wrapper">
            <span class="status-label">当前状态：</span>
            <a-tag v-if="vipInfo.isVip" color="gold" class="vip-tag">VIP会员</a-tag>
            <a-tag v-else color="default" class="vip-tag">普通用户</a-tag>
            <span v-if="vipInfo.isVip && vipInfo.remainingDays !== undefined" class="vip-expiry">
              剩余{{ vipInfo.remainingDays }}天
            </span>
            <span v-else-if="!vipInfo.isVip" class="upgrade-prompt">
              升级VIP享受更多特权
            </span>
          </div>
        </div>
      </div>

      <!-- 优化后的主内容区域 -->
      <div class="main-content">
        <!-- 左侧：会员权益对比 + 兑换码 -->
        <div class="left-section">
          <!-- 会员权益对比 -->
          <div class="benefits-section">
            <h3>会员权益对比</h3>
            <div class="benefits-cards">
              <div class="benefit-card normal">
                <div class="benefit-header">
                  <a-tag color="default">普通用户</a-tag>
                  <span class="benefit-price">免费</span>
                </div>
                <div class="benefit-content">
                  <div class="benefit-item">
                    <DownloadOutlined />
                    <span>每日下载 5 次</span>
                  </div>
                  <div class="benefit-item">
                    <FileSearchOutlined />
                    <span>基础搜索功能</span>
                  </div>
<!--                <div class="benefit-item">-->
<!--                  <PictureOutlined />-->
<!--                  <span>标准图片上传</span>-->
<!--                </div>-->
                </div>
              </div>
              <div class="benefit-card vip">
                <div class="benefit-header">
                  <a-tag color="gold">VIP会员</a-tag>
                  <span class="benefit-price">10元/月</span>
                </div>
                <div class="benefit-content">
                  <div class="benefit-item">
                    <DownloadOutlined />
                    <span>每日下载 20 次</span>
                  </div>
                  <div class="benefit-item">
                    <FileSearchOutlined />
                    <span>高级搜索功能</span>
                  </div>
<!--                <div class="benefit-item">-->
<!--                  <PictureOutlined />-->
<!--                  <span>高清图片上传</span>-->
<!--                </div>-->
<!--                <div class="benefit-highlight">-->
<!--                  <CrownOutlined />-->
<!--                  <span>专享特权</span>-->
<!--                </div>-->
                </div>
              </div>
            </div>
          </div>

          <!-- 兑换码区域 -->
          <div class="redeem-section">
            <div class="redeem-header">
              <GiftOutlined />
              <span>兑换码激活</span>
            </div>
            <div class="redeem-content">
              <a-input
                v-model:value="redeemCode"
                placeholder="拥有兑换码？立即激活VIP会员"
                size="large"
                class="redeem-input"
              />
              <a-button
                type="primary"
                @click="handleRedeem"
                :loading="isRedeeming"
                size="large"
                class="redeem-button"
              >
                <GiftOutlined />
                立即兑换
              </a-button>
            </div>
          </div>
        </div>

        <!-- 右侧：支付区域 -->
        <div class="payment-section">
          <!-- 支付方式选择 -->
          <div class="payment-methods">
            <h3>选择支付方式</h3>
            <a-radio-group v-model:value="paymentMethod" button-style="solid" @change="handlePaymentMethodChange">
              <a-radio-button value="alipay">
                <div class="payment-method-option">
                  <AlipayCircleOutlined class="payment-icon alipay-icon" />
                  <span>支付宝</span>
                </div>
                <a-tag color="orange" class="recommend-badge">推荐</a-tag>
              </a-radio-button>
              <a-radio-button value="wechat">
                <div class="payment-method-option">
                  <WechatOutlined class="payment-icon wechat-icon" />
                  <span>微信支付</span>
                </div>
              </a-radio-button>
            </a-radio-group>
          </div>

          <!-- 二维码区域 -->
          <div class="qr-code-section">
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
                <canvas ref="qrCodeCanvas" width="180" height="180" />
                <!-- 过期遮罩 -->
                <div v-if="isExpired" class="qr-expired-overlay">
                  <div class="expired-content">
                    <CloseCircleOutlined class="expired-icon" />
                    <span class="expired-text">二维码已失效</span>
                    <a-button type="primary" size="small" @click="refreshQRCode" class="refresh-btn">
                      刷新二维码
                    </a-button>
                  </div>
                </div>
              </div>
              <p class="qr-tips">请使用{{ paymentMethod === 'alipay' ? '支付宝' : '微信' }}扫描二维码完成支付</p>
              <div class="qr-footer">
                <span class="amount">¥10.00</span>
                <span class="countdown">有效期：{{ countdown }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted ,nextTick } from 'vue';
import QRCode from 'qrcode';
import { redeemVipUsingPost, checkVipStatusUsingGet } from '@/api/vipController';
import { useLoginUserStore } from '@/stores/useLoginUserStore';
import { message } from 'ant-design-vue';
import { WechatOutlined, AlipayCircleOutlined, DownloadOutlined, CrownOutlined, GiftOutlined, FileSearchOutlined, PictureOutlined, InfoCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';

const loginUserStore = useLoginUserStore();

// VIP状态信息
const vipInfo = ref<API.VIPInfoVO>({});

const visible = ref(false);
const countdown = ref<string>('05:00');
const redeemCode = ref<string>('');
const isRedeeming = ref(false);
const isExpired = ref(false); // 二维码是否过期
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
        isExpired.value = true; // 设置过期状态
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

// 获取VIP状态信息
const fetchVipStatus = async () => {
  const userId = loginUserStore.loginUser?.id;
  if (!userId) {
    console.warn('用户未登录，无法获取VIP信息');
    return;
  }

  try {
    const res = await checkVipStatusUsingGet({ userId });
    if (res.data.code === 0 && res.data.data) {
      vipInfo.value = res.data.data;
    }
  } catch (error) {
    console.error('获取VIP状态失败:', error);
  }
};

const openModal = async () => {
  visible.value = true;
  countdown.value = '05:00';
  isExpired.value = false; // 重置过期状态
  startCountdown();
  // 获取VIP信息
  await fetchVipStatus();
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
  // 重置倒计时和过期状态
  stopCountdown();
  countdown.value = '05:00';
  isExpired.value = false; // 重置过期状态
  startCountdown();

  // 重新生成二维码
  nextTick(() => {
    generateQRCode();
  });

  // message.info(`已切换至${paymentMethod.value === 'alipay' ? '支付宝' : '微信'}支付`);
};

// 刷新二维码
const refreshQRCode = () => {
  // 重置过期状态
  isExpired.value = false;
  // 重置倒计时
  stopCountdown();
  countdown.value = '05:00';
  startCountdown();
  // 重新生成二维码
  nextTick(() => {
    generateQRCode();
  });
  message.success('二维码已刷新');
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

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* VIP状态区域 - 简化布局 */
.vip-status-section {
  background: #f8f9fa;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.vip-status-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.vip-info-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-label {
  color: #666;
  font-size: 14px;
}

.vip-tag {
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 4px;
  min-width: 60px;
  text-align: center;
}

.vip-expiry {
  color: #52c41a;
  font-size: 13px;
  font-weight: 500;
}

.upgrade-prompt {
  color: #ff4d4f;
  font-size: 13px;
  font-weight: 500;
}

/* 主要内容区域 - 优化横向布局 */
.main-content {
  display: flex;
  gap: 24px;
  flex: 1;
}

/* 会员权益区域 */
.benefits-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex: 1;
  min-width: 0;
}

.benefits-section h3 {
  margin-bottom: 20px;
  color: #1a1a1a;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.benefits-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.benefit-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.benefit-card.normal {
  border-color: #e8e8e8;
}

.benefit-card.vip {
  border-color: #ffd700;
  background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
  position: relative;
}

.benefit-card.vip::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  border-radius: 12px 12px 0 0;
}

.benefit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.benefit-price {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.benefit-card.vip .benefit-price {
  color: #d48806;
}

.benefit-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #666;
}

.benefit-item :deep(.anticon) {
  font-size: 16px;
  color: #1890ff;
}

.benefit-highlight {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fff7e6;
  border-radius: 8px;
  font-weight: 600;
  color: #d48806;
}

.benefit-highlight :deep(.anticon) {
  font-size: 18px;
  color: #d48806;
}

/* 支付区域 */
.payment-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.payment-section h3 {
  margin-bottom: 20px;
  color: #1a1a1a;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

/* 支付方式选择器 */
.payment-methods {
  margin-bottom: 24px;
}

.payment-methods :deep(.ant-radio-group) {
  width: 100%;
  display: flex;
  gap: 12px;
}

.payment-methods :deep(.ant-radio-button-wrapper) {
  flex: 1;
  height: auto;
  padding: 16px 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid #d9d9d9;
  background: white;
}

/* 专门处理Ant Design Radio Button的左边框问题 */
.payment-methods :deep(.ant-radio-button-wrapper:first-child) {
  border-left: 2px solid #d9d9d9;
}

.payment-methods :deep(.ant-radio-button-wrapper:not(:first-child)) {
  border-left: 2px solid #d9d9d9;
}

/* 专门处理Ant Design的默认样式冲突和粉色边框 */
.payment-methods :deep(.ant-radio-button-wrapper::before) {
  display: none !important;
}

/* 移除所有可能的伪元素和默认边框 */
.payment-methods :deep(.ant-radio-button-wrapper)::after,
.payment-methods :deep(.ant-radio-button-wrapper)::before {
  display: none !important;
}

/* 专门处理可能存在的粉色边框 */
.payment-methods :deep(.ant-radio-button-wrapper) {
  border-left: 2px solid #d9d9d9 !important;
}

/* 选中状态的边框处理 */
.payment-methods :deep(.ant-radio-button-wrapper-checked) {
  border-color: #1890ff;
  border-left: 2px solid #1890ff !important;
}

.payment-methods :deep(.ant-radio-button-wrapper-checked:not(:first-child)) {
  border-left: 2px solid #1890ff !important;
}

.payment-methods :deep(.ant-radio-button-wrapper:hover) {
  border-color: #40a9ff;
  border-left: 2px solid #40a9ff !important;
  color: rgba(0, 0, 0, 0.88);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.payment-methods :deep(.ant-radio-button-wrapper-checked) {
  border-color: #1890ff;
  background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
  color: rgba(0, 0, 0, 0.88);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.payment-methods :deep(.ant-radio-button-wrapper-checked:hover) {
  border-color: #1890ff;
  background: linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%);
  color: rgba(0, 0, 0, 0.88);
}

.payment-method-option {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
  min-width: 0;
}

.payment-method-option span {
  flex-shrink: 0;
}

/* 支付图标 */
.payment-icon {
  font-size: 22px;
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
  font-size: 11px;
  margin-left: 4px;
  border: none;
}

.recommend-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 10px;
  border: none;
  z-index: 10;
  padding: 2px 6px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 支付内容区域 */
.payment-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 二维码区域 */
.qr-code-section {
  flex: 1;
}

.qr-code {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.qr-code-header {
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 600;
}

.payment-name {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.alipay-text {
  color: #1677ff;
}

.wechat-text {
  color: #07c160;
}

.qr-code-wrapper {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  position: relative;
}

/* 二维码过期遮罩层 */
.qr-expired-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.expired-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.expired-icon {
  font-size: 48px;
  color: #ff4d4f;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.expired-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.refresh-btn {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.refresh-btn:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #1890ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.4);
}

.qr-code canvas {
  width: 180px;
  height: 180px;
  border-radius: 8px;
  background: white;
}

.qr-tips {
  color: #666;
  font-size: 13px;
  margin: 8px 0;
}

.qr-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.amount {
  font-size: 20px;
  font-weight: 700;
  color: #ff4d4f;
}

.countdown {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

/* 兑换码区域 */
.redeem-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  margin-top: 16px;
}

.redeem-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.redeem-header :deep(.anticon) {
  color: #52c41a;
  font-size: 18px;
}

.redeem-content {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.redeem-input {
  flex: 1;
}

.redeem-input :deep(.ant-input) {
  border-radius: 8px;
  height: 48px;
  font-size: 14px;
  border: 2px solid #d9d9d9;
  transition: all 0.3s ease;
}

.redeem-input :deep(.ant-input:focus) {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.redeem-button {
  min-width: 88px;
  height: 38px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 15px;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
}

.redeem-button:hover {
  background: linear-gradient(135deg, #73d13d 0%, #52c41a 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.redeem-button :deep(.anticon) {
  font-size: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    gap: 20px;
  }

  .benefits-section, .payment-section {
    padding: 16px;
  }

  .benefits-cards {
    gap: 12px;
  }

  .benefit-card {
    padding: 16px;
  }

  .payment-methods :deep(.ant-radio-group) {
    flex-direction: column;
    gap: 8px;
  }

  .payment-methods :deep(.ant-radio-button-wrapper) {
    padding: 12px 16px;
  }

  .qr-code {
    padding: 20px;
  }

  .qr-code canvas {
    width: 160px;
    height: 160px;
  }

  .redeem-section {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .payment-modal-content {
    padding: 16px;
    gap: 16px;
  }

  .vip-status-section {
    padding: 12px;
  }

  .benefits-section, .payment-section {
    padding: 12px;
  }

  .qr-code canvas {
    width: 140px;
    height: 140px;
  }
}
</style>
