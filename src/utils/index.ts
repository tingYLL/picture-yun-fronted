import {saveAs} from "file-saver";
import { message } from 'ant-design-vue'
export const formatSize = (size?: number) => {
  if (!size) return '未知'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 下载图片
 * @param url 图片下载地址
 * @param fileName 要保存为的文件名
 */
export function downloadImage(url?: string, fileName?: string) {
  if (!url) {
    return
  }
  saveAs(url, fileName)
}
/**
 * 将颜色值转换为标准 #RRGGBB 格式
 * @param input
 */
export function toHexColor(input: string) {
  // 去掉 0x 前缀
  const colorValue = input.startsWith('0x') ? input.slice(2) : input

  // 将剩余部分解析为十六进制数，再转成 6 位十六进制字符串
  const hexColor = parseInt(colorValue, 16).toString(16).padStart(6, '0')

  // 返回标准 #RRGGBB 格式
  return `#${hexColor}`
}

/**
 * 处理拖拽图片
 *
 * 需要用在 <div> 元素上，并设置 draggable="true"</div>
 * @param event
 */
export function handleDragStart(event) {
  event.preventDefault() // 阻止默认拖拽行为
}


type ValidatorOptions = {
  maxSizeMB?: number
  allowedTypes?: string[]
}

export const imageValidator = (
  file: File,
  options: ValidatorOptions = {
    maxSizeMB: 2,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  },
) => {
  // 解构配置参数
  const { maxSizeMB = 2, allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] } = options

  // 校验图片格式
  const isValidType = allowedTypes.includes(file.type)
  if (!isValidType) {
    message.error(`仅支持 ${allowedTypes.join(', ').replace(/image\//g, '')} 格式的图片`)
    return false
  }

  // 校验图片大小
  const isSizeValid = file.size / 1024 / 1024 < maxSizeMB
  if (!isSizeValid) {
    message.error(`图片大小不能超过 ${maxSizeMB}MB`)
    return false
  }

  return true
}
