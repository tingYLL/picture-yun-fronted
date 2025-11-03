/**
 * 评论通知 SSE 服务
 * 用于管理 Server-Sent Events 连接，接收实时评论通知
 */

type MessageHandler = (data: any) => void
type ErrorHandler = (error: Event) => void

class CommentSseService {
  private eventSource: EventSource | null = null
  private messageHandlers: MessageHandler[] = []
  private errorHandlers: ErrorHandler[] = []
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private isManualClose = false

  /**
   * 建立 SSE 连接
   */
  connect(): void {
    if (this.eventSource) {
      console.warn('[CommentSSE] 连接已存在')
      return
    }

    this.isManualClose = false
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8123'
    const sseUrl = `${baseURL}/api/comment/sse/connect`

    console.log('[CommentSSE] 正在建立连接...', sseUrl)

    try {
      // 创建 EventSource 连接
      // withCredentials 确保发送 cookie 进行身份验证
      this.eventSource = new EventSource(sseUrl, {
        withCredentials: true,
      })

      // 监听连接打开事件
      this.eventSource.onopen = () => {
        console.log('[CommentSSE] 连接已建立')
        this.reconnectAttempts = 0
      }

      // 监听连接成功事件
      //SSE 规范中：
      //如果没有指定 name，事件类型默认是 message，会触发 onmessage
      //如果指定了 name（如 "newNotification"），必须用 addEventListener 监听，onmessage 不会触发
      this.eventSource.addEventListener('connected', (event) => {
        console.log('[CommentSSE] 连接成功:', event.data)
        // 连接成功消息不需要通知处理器，仅用于确认连接
      })

      // 监听新通知事件
      this.eventSource.addEventListener('newNotification', (event) => {
        console.log('[CommentSSE] 收到新通知:', event.data)

        try {
          const data = JSON.parse(event.data)
          this.notifyMessageHandlers(data)
        } catch (error) {
          console.error('[CommentSSE] 新通知解析失败:', error)
        }
      })

      // 监听未读数量更新事件
      this.eventSource.addEventListener('unreadCount', (event) => {
        console.log('[CommentSSE] 未读数量更新:', event.data)

        try {
          // unreadCount 是纯数字，不是 JSON
          const count = parseInt(event.data, 10)
          this.notifyMessageHandlers({ type: 'unreadCount', count })
        } catch (error) {
          console.error('[CommentSSE] 未读数量解析失败:', error)
        }
      })

      // 监听错误事件
      this.eventSource.onerror = (error) => {
        console.error('[CommentSSE] 连接错误:', error)
        this.notifyErrorHandlers(error)

        // 关闭当前连接
        this.eventSource?.close()
        this.eventSource = null

        // 如果不是手动关闭，则尝试重连
        if (!this.isManualClose) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      console.error('[CommentSSE] 创建连接失败:', error)
      this.attemptReconnect()
    }
  }

  /**
   * 尝试重新连接
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[CommentSSE] 达到最大重连次数，停止重连')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts

    console.log(
      `[CommentSSE] 将在 ${delay}ms 后尝试第 ${this.reconnectAttempts} 次重连...`
    )

    setTimeout(() => {
      if (!this.isManualClose) {
        this.connect()
      }
    }, delay)
  }

  /**
   * 断开 SSE 连接
   */
  disconnect(): void {
    console.log('[CommentSSE] 正在断开连接...')
    this.isManualClose = true

    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    // 重置重连计数
    this.reconnectAttempts = 0
  }

  /**
   * 注册消息处理器
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.push(handler)
    console.log(`[CommentSSE] 已注册消息处理器，当前处理器数量: ${this.messageHandlers.length}`)

    // 返回取消注册的函数
    return () => {
      const index = this.messageHandlers.indexOf(handler)
      if (index > -1) {
        this.messageHandlers.splice(index, 1)
        console.log(`[CommentSSE] 已取消消息处理器，剩余处理器数量: ${this.messageHandlers.length}`)
      }
    }
  }

  /**
   * 注册错误处理器
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.push(handler)

    // 返回取消注册的函数
    return () => {
      const index = this.errorHandlers.indexOf(handler)
      if (index > -1) {
        this.errorHandlers.splice(index, 1)
      }
    }
  }

  /**
   * 通知所有消息处理器
   */
  private notifyMessageHandlers(data: any): void {
    console.log(`[CommentSSE] 准备通知 ${this.messageHandlers.length} 个消息处理器`)
    this.messageHandlers.forEach((handler, index) => {
      try {
        console.log(`[CommentSSE] 正在执行第 ${index + 1} 个消息处理器`)
        handler(data)
        console.log(`[CommentSSE] 第 ${index + 1} 个消息处理器执行成功`)
      } catch (error) {
        console.error(`[CommentSSE] 第 ${index + 1} 个消息处理器执行失败:`, error)
      }
    })
  }

  /**
   * 通知所有错误处理器
   */
  private notifyErrorHandlers(error: Event): void {
    this.errorHandlers.forEach((handler) => {
      try {
        handler(error)
      } catch (err) {
        console.error('[CommentSSE] 错误处理器执行失败:', err)
      }
    })
  }

  /**
   * 获取连接状态
   */
  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN
  }
}

// 导出单例实例
export const commentSseService = new CommentSseService()
