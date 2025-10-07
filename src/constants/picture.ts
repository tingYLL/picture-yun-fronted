/**
 * 图片审核状态
 */
export const PIC_REVIEW_STATUS_ENUM = {
  REVIEWING: 0,
  PASS: 1,
  REJECT: 2,
}

export const PIC_INTERACTION_TYPE_ENUM = {
  LIKE: 0,
  COLLECT: 1,
}

/**
 * 图片审核状态文案
 */
export const PIC_REVIEW_STATUS_MAP = {
  0: '待审核',
  1: '通过',
  2: '拒绝',
}

export const PIC_STATUS_TAG_COLOR = {
  0: '#f50',
  1: '#87d068',
  2: '#616060',
}

export const PIC_FORMAT_STATUS_MAP = {
  jpeg: 'JPG/JPEG',
  png: 'PNG',
  gif: 'GIF',
  webp: 'WEBP',
  other: '其他',
}
export const PIC_FORMAT_STATUS_OPTIONS = Object.keys(PIC_FORMAT_STATUS_MAP).map((key) => {
  return {
    label: PIC_FORMAT_STATUS_MAP[key],
    value: key,
  }
})

/**
 * 图片审核下拉表单选项
 */
export const PIC_REVIEW_STATUS_OPTIONS = Object.keys(PIC_REVIEW_STATUS_MAP).map((key) => {
  return {
    label: PIC_REVIEW_STATUS_MAP[key],
    value: key,
  }
})
