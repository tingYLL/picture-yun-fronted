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
  // 心跳检测相关
  private lastHeartbeatTime = 0
  private heartbeatCheckInterval: number | null = null
  private readonly heartbeatTimeout = 60000 // 60秒没有收到心跳则认为连接断开
  // 连接状态标志 - 防止并发连接
  private isConnecting = false

  /**
   * 建立 SSE 连接
   */
  connect(): void {
    // 如果正在连接中，避免重复调用
    if (this.isConnecting) {
      console.warn('[CommentSSE] 连接正在建立中，忽略重复调用')
      return
    }

    // 如果已存在连接，先强制关闭旧连接
    if (this.eventSource) {
      console.warn('[CommentSSE] 检测到已存在的连接，先关闭旧连接再建立新连接')
      try {
        this.eventSource.close()
      } catch (error) {
        console.error('[CommentSSE] 关闭旧连接时出错:', error)
      }
      this.eventSource = null
      // 停止旧的心跳检测
      this.stopHeartbeatCheck()
    }

    // 设置连接中标志
    this.isConnecting = true
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
        console.log('[CommentSSE] ✅ 连接已建立成功')
        this.reconnectAttempts = 0
        this.lastHeartbeatTime = Date.now()
        this.startHeartbeatCheck()
        // 连接建立成功，重置标志
        this.isConnecting = false
      }

      // 监听连接成功事件
      //SSE 规范中：
      //如果没有指定 name，事件类型默认是 message，会触发 onmessage
      //如果指定了 name（如 "newNotification"），必须用 addEventListener 监听，onmessage 不会触发
      this.eventSource.addEventListener('connected', (event) => {
        console.log('[CommentSSE] ✅ 收到连接成功事件:', event.data)
        this.lastHeartbeatTime = Date.now()
        // 连接成功消息不需要通知处理器，仅用于确认连接
      })

      // 监听心跳事件
      this.eventSource.addEventListener('heartbeat', (event) => {
        console.log('[CommentSSE] 收到心跳:', new Date().toLocaleTimeString())
        this.lastHeartbeatTime = Date.now()
      })

      // 监听新通知事件
      this.eventSource.addEventListener('newNotification', (event) => {
        console.log('[CommentSSE] 收到新通知:', event.data)
        this.lastHeartbeatTime = Date.now() // 收到消息也更新心跳时间

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
        this.lastHeartbeatTime = Date.now() // 收到消息也更新心跳时间

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

        // 重置连接中标志
        this.isConnecting = false

        // 停止心跳检测
        this.stopHeartbeatCheck()

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
      this.isConnecting = false
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
   * 启动心跳检测
   */
  private startHeartbeatCheck(): void {
    // 清除之前的定时器
    this.stopHeartbeatCheck()

    console.log('[CommentSSE] 启动心跳检测')

    // 每 20 秒检查一次心跳
    this.heartbeatCheckInterval = window.setInterval(() => {
      const now = Date.now()
      const timeSinceLastHeartbeat = now - this.lastHeartbeatTime

      console.log(
        `[CommentSSE] 心跳检测: 距离上次心跳 ${Math.floor(timeSinceLastHeartbeat / 1000)} 秒`
      )

      // 如果超过心跳超时时间没有收到任何消息，则认为连接已断开
      if (timeSinceLastHeartbeat > this.heartbeatTimeout) {
        console.warn('[CommentSSE] 心跳超时，连接可能已断开，准备重连')

        // 停止心跳检测
        this.stopHeartbeatCheck()

        // 关闭当前连接
        if (this.eventSource) {
          this.eventSource.close()
          this.eventSource = null
        }

        // 尝试重连
        if (!this.isManualClose) {
          this.reconnectAttempts = 0 // 重置重连计数，因为这不是错误导致的重连
          this.attemptReconnect()
        }
      }
    }, 20000) // 每 20 秒检查一次
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeatCheck(): void {
    if (this.heartbeatCheckInterval) {
      console.log('[CommentSSE] 停止心跳检测')
      clearInterval(this.heartbeatCheckInterval)
      this.heartbeatCheckInterval = null
    }
  }

  /**
   * 断开 SSE 连接
   */
  disconnect(): void {
    console.log('[CommentSSE] 正在断开连接...')
    this.isManualClose = true
    this.isConnecting = false

    // 停止心跳检测
    this.stopHeartbeatCheck()

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
    // 如果 eventSource 不存在，返回 false
    if (!this.eventSource) {
      return false
    }

    // EventSource.readyState 状态：
    // 0 (CONNECTING) - 连接正在建立中，这是正常状态
    // 1 (OPEN) - 连接已建立
    // 2 (CLOSED) - 连接已关闭，需要清理

    // 只清理已关闭的连接，不要清理正在建立中的连接
    if (this.eventSource.readyState === EventSource.CLOSED) {
      console.warn('[CommentSSE] 检测到已关闭的连接，进行清理')
      this.eventSource = null
      this.isConnecting = false
      this.stopHeartbeatCheck()
      return false
    }

    // 连接正在建立中 (CONNECTING) 或已建立 (OPEN) 都返回相应状态
    return this.eventSource.readyState === EventSource.OPEN
  }
}

// 导出单例实例
export const commentSseService = new CommentSseService()
