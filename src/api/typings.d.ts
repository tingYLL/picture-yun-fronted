declare namespace API {
  type BaseResponseBoolean_ = {
    code?: number
    data?: boolean
    message?: string
  }

  type BaseResponseCreateOutPaintingTaskResponse_ = {
    code?: number
    data?: CreateOutPaintingTaskResponse
    message?: string
  }

  type BaseResponseGetOutPaintingTaskResponse_ = {
    code?: number
    data?: GetOutPaintingTaskResponse
    message?: string
  }

  type BaseResponseInt_ = {
    code?: number
    data?: number
    message?: string
  }

  type BaseResponseListCategoryVO_ = {
    code?: number
    data?: CategoryVO[]
    message?: string
  }

  type BaseResponseListImageSearchResult_ = {
    code?: number
    data?: ImageSearchResult[]
    message?: string
  }

  type BaseResponseListPictureVO_ = {
    code?: number
    data?: PictureVO[]
    message?: string
  }

  type BaseResponseListSpace_ = {
    code?: number
    data?: Space[]
    message?: string
  }

  type BaseResponseListSpaceCategoryAnalyzeResponse_ = {
    code?: number
    data?: SpaceCategoryAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceLevel_ = {
    code?: number
    data?: SpaceLevel[]
    message?: string
  }

  type BaseResponseListSpaceSizeAnalyzeResponse_ = {
    code?: number
    data?: SpaceSizeAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceTagAnalyzeResponse_ = {
    code?: number
    data?: SpaceTagAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceUserAnalyzeResponse_ = {
    code?: number
    data?: SpaceUserAnalyzeResponse[]
    message?: string
  }

  type BaseResponseListSpaceUserVO_ = {
    code?: number
    data?: SpaceUserVO[]
    message?: string
  }

  type BaseResponseListVIPRedemptionCode_ = {
    code?: number
    data?: VIPRedemptionCode[]
    message?: string
  }

  type BaseResponseLoginUserVO_ = {
    code?: number
    data?: LoginUserVO
    message?: string
  }

  type BaseResponseLong_ = {
    code?: number
    data?: number
    message?: string
  }

  type BaseResponseMapStringObject_ = {
    code?: number
    data?: Record<string, any>
    message?: string
  }

  type BaseResponsePageCategoryVO_ = {
    code?: number
    data?: PageCategoryVO_
    message?: string
  }

  type BaseResponsePageDownloadHistoryVO_ = {
    code?: number
    data?: PageDownloadHistoryVO_
    message?: string
  }

  type BaseResponsePagePictureVO_ = {
    code?: number
    data?: PagePictureVO_
    message?: string
  }

  type BaseResponsePageScheduledTaskVO_ = {
    code?: number
    data?: PageScheduledTaskVO_
    message?: string
  }

  type BaseResponsePageSpace_ = {
    code?: number
    data?: PageSpace_
    message?: string
  }

  type BaseResponsePageSpaceVO_ = {
    code?: number
    data?: PageSpaceVO_
    message?: string
  }

  type BaseResponsePageUserVO_ = {
    code?: number
    data?: PageUserVO_
    message?: string
  }

  type BaseResponsePicture_ = {
    code?: number
    data?: Picture
    message?: string
  }

  type BaseResponsePictureVO_ = {
    code?: number
    data?: PictureVO
    message?: string
  }

  type BaseResponseSpace_ = {
    code?: number
    data?: Space
    message?: string
  }

  type BaseResponseSpaceUsageAnalyzeResponse_ = {
    code?: number
    data?: SpaceUsageAnalyzeResponse
    message?: string
  }

  type BaseResponseSpaceUser_ = {
    code?: number
    data?: SpaceUser
    message?: string
  }

  type BaseResponseSpaceVO_ = {
    code?: number
    data?: SpaceVO
    message?: string
  }

  type BaseResponseString_ = {
    code?: number
    data?: string
    message?: string
  }

  type BaseResponseUser_ = {
    code?: number
    data?: User
    message?: string
  }

  type BaseResponseUserVO_ = {
    code?: number
    data?: UserVO
    message?: string
  }

  type BaseResponseVIPRedemptionCode_ = {
    code?: number
    data?: VIPRedemptionCode
    message?: string
  }

  type Category = {
    createTime?: string
    editTime?: string
    id?: number
    isDelete?: number
    name?: string
    parentId?: number
    updateTime?: string
    useNum?: number
    userId?: number
  }

  type CategoryAddRequest = {
    name?: string
    parentId?: number
  }

  type CategoryQueryRequest = {
    categoryId?: number
    current?: number
    multipleSort?: boolean
    name?: string
    pageSize?: number
    parentId?: number
    sort?: Sort
    sortField?: string
    sortOrder?: string
    sorts?: Sort[]
    useNum?: number
    userId?: number
  }

  type CategoryUpdateRequest = {
    id?: number
    name?: string
    parentId?: number
    useNum?: number
  }

  type CategoryVO = {
    createTime?: string
    id?: number
    name?: string
    parentId?: number
    useNum?: number
    userId?: number
  }

  type checkVIPStatusUsingGETParams = {
    /** userId */
    userId: number
  }

  type CreateOutPaintingTaskResponse = {
    code?: string
    message?: string
    output?: Output
    requestId?: string
  }

  type CreatePictureOutPaintingTaskRequest = {
    parameters?: Parameters
    pictureId?: number
  }

  type DeleteRequest = {
    id?: number
  }

  type deleteUsingDELETEParams = {
    /** id */
    id: number
  }

  type downloadFileUsingPOSTParams = {
    /** fileId */
    fileId?: number
  }

  type DownloadHistoryVO = {
    downloadedAt?: string
    id?: number
    picture?: PictureVO
  }

  type DownloadRequest = {
    current?: number
    endTime?: string
    id?: number
    interactionStatus?: number
    interactionType?: number
    multipleSort?: boolean
    pageSize?: number
    sort?: Sort
    sortField?: string
    sortOrder?: string
    sorts?: Sort[]
    startTime?: string
  }

  type generateCodeUsingPOSTParams = {
    /** count */
    count?: number
    /** type */
    type?: string
  }

  type getByIdUsingGETParams = {
    /** id */
    id: number
  }

  type GetOutPaintingTaskResponse = {
    output?: Output1
    requestId?: string
  }

  type getPictureByIdUsingGETParams = {
    /** id */
    id?: number
  }

  type getPictureOutPaintingTaskUsingGETParams = {
    /** taskId */
    taskId?: string
  }

  type getPictureVOByIdUsingGETParams = {
    /** id */
    id?: number
  }

  type getSpaceByIdUsingGETParams = {
    /** id */
    id?: number
  }

  type getSpaceVOByIdUsingGETParams = {
    /** id */
    id?: number
  }

  type getUserByIdUsingGETParams = {
    /** id */
    id?: number
  }

  type getUserVOByIdUsingGETParams = {
    /** id */
    id?: number
  }

  type ImageSearchResult = {
    fromUrl?: string
    thumbUrl?: string
  }

  type LoginUserVO = {
    createTime?: string
    editTime?: string
    id?: number
    updateTime?: string
    userAccount?: string
    userAvatar?: string
    userName?: string
    userProfile?: string
    userRole?: string
  }

  type Output = {
    taskId?: string
    taskStatus?: string
  }

  type Output1 = {
    code?: string
    endTime?: string
    message?: string
    outputImageUrl?: string
    scheduledTime?: string
    submitTime?: string
    taskId?: string
    taskMetrics?: TaskMetrics
    taskStatus?: string
  }

  type PageCategoryVO_ = {
    current?: number
    pages?: number
    records?: CategoryVO[]
    size?: number
    total?: number
  }

  type PageDownloadHistoryVO_ = {
    current?: number
    pages?: number
    records?: DownloadHistoryVO[]
    size?: number
    total?: number
  }

  type PagePictureVO_ = {
    current?: number
    pages?: number
    records?: PictureVO[]
    size?: number
    total?: number
  }

  type PageScheduledTaskVO_ = {
    current?: number
    pages?: number
    records?: ScheduledTaskVO[]
    size?: number
    total?: number
  }

  type PageSpace_ = {
    current?: number
    pages?: number
    records?: Space[]
    size?: number
    total?: number
  }

  type PageSpaceVO_ = {
    current?: number
    pages?: number
    records?: SpaceVO[]
    size?: number
    total?: number
  }

  type PageUserVO_ = {
    current?: number
    pages?: number
    records?: UserVO[]
    size?: number
    total?: number
  }

  type Parameters = {
    addWatermark?: boolean
    angle?: number
    bestQuality?: boolean
    bottomOffset?: number
    leftOffset?: number
    limitImageSize?: boolean
    outputRatio?: string
    rightOffset?: number
    topOffset?: number
    xScale?: number
    yScale?: number
  }

  type Picture = {
    category?: string
    categoryId?: number
    collectQuantity?: number
    createTime?: string
    downloadQuantity?: number
    editTime?: string
    expandStatus?: number
    id?: number
    introduction?: string
    isDelete?: number
    isShare?: number
    likeQuantity?: number
    name?: string
    picColor?: string
    picFormat?: string
    picHeight?: number
    picScale?: number
    picSize?: number
    picWidth?: number
    recommendScore?: number
    resourceStatus?: number
    reviewMessage?: string
    reviewStatus?: number
    reviewTime?: string
    reviewerId?: number
    shareQuantity?: number
    spaceId?: number
    tags?: string
    thumbnailUrl?: string
    updateTime?: string
    url?: string
    userId?: number
    viewQuantity?: number
  }

  type PictureEditByBatchRequest = {
    category?: string
    nameRule?: string
    pictureIdList?: number[]
    spaceId?: number
    tags?: string[]
  }

  type PictureEditRequest = {
    categoryId?: number
    id?: number
    introduction?: string
    name?: string
    tags?: string[]
  }

  type PictureInteractionRequest = {
    interactionStatus?: number
    interactionType?: number
    pictureId?: number
  }

  type PictureQueryRequest = {
    categoryId?: number
    current?: number
    endEditTime?: string
    id?: number
    introduction?: string
    multipleSort?: boolean
    name?: string
    nullSpaceId?: boolean
    pageSize?: number
    picFormat?: string
    picHeight?: number
    picScale?: number
    picSize?: number
    picWidth?: number
    reviewMessage?: string
    reviewStatus?: number
    reviewTime?: string
    reviewerId?: number
    searchText?: string
    sort?: Sort
    sortField?: string
    sortOrder?: string
    sorts?: Sort[]
    spaceId?: number
    startEditTime?: string
    tags?: string[]
    userId?: number
  }

  type PictureReviewRequest = {
    category?: string
    id?: number
    introduction?: string
    name?: string
    reviewMessage?: string
    reviewStatus?: number
    tags?: string[]
  }

  type PictureUpdateRequest = {
    categoryId?: number
    id?: number
    introduction?: string
    name?: string
    tags?: string[]
  }

  type PictureUploadByBatchRequest = {
    count?: number
    namePrefix?: string
    searchText?: string
  }

  type PictureUploadRequest = {
    fileUrl?: string
    id?: number
    picName?: string
    spaceId?: number
  }

  type PictureVO = {
    categoryId?: number
    categoryInfo?: Category
    categoryName?: string
    collectQuantity?: number
    contextPathTemp?: string
    createTime?: string
    downloadQuantity?: number
    editTime?: string
    expandStatus?: number
    id?: number
    introduction?: string
    isShare?: number
    likeQuantity?: number
    localEnableTemp?: boolean
    loginUserIsCollect?: boolean
    loginUserIsLike?: boolean
    name?: string
    permissionList?: string[]
    picColor?: string
    picFormat?: string
    picHeight?: number
    picScale?: number
    picSize?: number
    picWidth?: number
    portTemp?: string
    recommendScore?: number
    resourceStatus?: number
    reviewMessage?: string
    reviewStatus?: number
    reviewTime?: string
    reviewerId?: number
    shareQuantity?: number
    spaceId?: number
    tagList?: string[]
    thumbnailUrl?: string
    updateTime?: string
    url?: string
    user?: UserVO
    userId?: number
    viewQuantity?: number
  }

  type RedeemCodeRequest = {
    code?: string
    userId?: number
  }

  type redeemCodeUsingPOSTParams = {
    /** code */
    code: string
  }

  type ScheduledTaskAddRequest = {
    taskBean?: string
    taskCron?: string
    taskDesc?: string
    taskName?: string
  }

  type ScheduledTaskQueryRequest = {
    createTime?: string
    current?: number
    editTime?: string
    id?: number
    multipleSort?: boolean
    pageSize?: number
    sort?: Sort
    sortField?: string
    sortOrder?: string
    sorts?: Sort[]
    taskBean?: string
    taskCron?: string
    taskDesc?: string
    taskKey?: string
    taskName?: string
    taskStatus?: number
  }

  type ScheduledTaskUpdateRequest = {
    id?: number
    taskBean?: string
    taskCron?: string
    taskDesc?: string
    taskKey?: string
    taskName?: string
    taskStatus?: number
  }

  type ScheduledTaskVO = {
    createTime?: string
    editTime?: string
    id?: number
    taskBean?: string
    taskCron?: string
    taskDesc?: string
    taskKey?: string
    taskName?: string
    taskStatus?: number
  }

  type SearchPictureByColorRequest = {
    picColor?: string
    spaceId?: number
  }

  type SearchPictureByPictureRequest = {
    pictureId?: number
  }

  type Sort = {
    asc?: boolean
    field?: string
  }

  type Space = {
    createTime?: string
    editTime?: string
    id?: number
    isDelete?: number
    maxCount?: number
    maxSize?: number
    spaceLevel?: number
    spaceName?: string
    spaceType?: number
    totalCount?: number
    totalSize?: number
    updateTime?: string
    userId?: number
  }

  type SpaceAddRequest = {
    spaceLevel?: number
    spaceName?: string
    spaceType?: number
  }

  type SpaceCategoryAnalyzeRequest = {
    queryAll?: boolean
    queryPublic?: boolean
    spaceId?: number
  }

  type SpaceCategoryAnalyzeResponse = {
    category?: string
    count?: number
    totalSize?: number
  }

  type SpaceEditRequest = {
    id?: number
    spaceName?: string
  }

  type SpaceLevel = {
    maxCount?: number
    maxSize?: number
    text?: string
    value?: number
  }

  type SpaceQueryRequest = {
    current?: number
    id?: number
    multipleSort?: boolean
    pageSize?: number
    sort?: Sort
    sortField?: string
    sortOrder?: string
    sorts?: Sort[]
    spaceLevel?: number
    spaceName?: string
    spaceType?: number
    userId?: number
  }

  type SpaceRankAnalyzeRequest = {
    topN?: number
  }

  type SpaceSizeAnalyzeRequest = {
    queryAll?: boolean
    queryPublic?: boolean
    spaceId?: number
  }

  type SpaceSizeAnalyzeResponse = {
    count?: number
    sizeRange?: string
  }

  type SpaceTagAnalyzeRequest = {
    queryAll?: boolean
    queryPublic?: boolean
    spaceId?: number
  }

  type SpaceTagAnalyzeResponse = {
    count?: number
    tag?: string
  }

  type SpaceUpdateRequest = {
    id?: number
    maxCount?: number
    maxSize?: number
    spaceLevel?: number
    spaceName?: string
  }

  type SpaceUsageAnalyzeRequest = {
    queryAll?: boolean
    queryPublic?: boolean
    spaceId?: number
  }

  type SpaceUsageAnalyzeResponse = {
    countUsageRatio?: number
    maxCount?: number
    maxSize?: number
    sizeUsageRatio?: number
    usedCount?: number
    usedSize?: number
  }

  type SpaceUser = {
    createTime?: string
    id?: number
    spaceId?: number
    spaceRole?: string
    updateTime?: string
    userId?: number
  }

  type SpaceUserAddRequest = {
    spaceId?: number
    spaceRole?: string
    userId?: number
  }

  type SpaceUserAnalyzeRequest = {
    queryAll?: boolean
    queryPublic?: boolean
    spaceId?: number
    timeDimension?: string
    userId?: number
  }

  type SpaceUserAnalyzeResponse = {
    count?: number
    period?: string
  }

  type SpaceUserEditRequest = {
    id?: number
    spaceRole?: string
  }

  type SpaceUserQueryRequest = {
    id?: number
    spaceId?: number
    spaceRole?: string
    userId?: number
  }

  type SpaceUserVO = {
    createTime?: string
    id?: number
    space?: SpaceVO
    spaceId?: number
    spaceRole?: string
    updateTime?: string
    user?: UserVO
    userId?: number
  }

  type SpaceVO = {
    createTime?: string
    editTime?: string
    id?: number
    maxCount?: number
    maxSize?: number
    permissionList?: string[]
    spaceLevel?: number
    spaceName?: string
    spaceType?: number
    totalCount?: number
    totalSize?: number
    updateTime?: string
    user?: UserVO
    userId?: number
  }

  type TaskMetrics = {
    failed?: number
    succeeded?: number
    total?: number
  }

  type testDownloadFileUsingGETParams = {
    /** filepath */
    filepath?: string
  }

  type uploadPictureUsingPOSTParams = {
    fileUrl?: string
    id?: number
    picName?: string
    spaceId?: number
  }

  type User = {
    balance?: number
    birthday?: string
    createTime?: string
    editTime?: string
    id?: number
    inviteUserId?: number
    isDelete?: number
    isDisabled?: number
    shareCode?: string
    updateTime?: string
    userAccount?: string
    userAvatar?: string
    userEmail?: string
    userName?: string
    userPassword?: string
    userPhone?: string
    userProfile?: string
    userRole?: string
    vipCode?: string
    vipExpireTime?: string
    vipNnumber?: number
    vipSign?: string
  }

  type UserAddRequest = {
    userAccount?: string
    userAvatar?: string
    userName?: string
    userProfile?: string
    userRole?: string
  }

  type UserEditPasswordRequest = {
    confirmPassword?: string
    newPassword?: string
    originPassword?: string
  }

  type UserLoginRequest = {
    userAccount?: string
    userPassword?: string
  }

  type UserQueryRequest = {
    current?: number
    id?: number
    multipleSort?: boolean
    pageSize?: number
    sort?: Sort
    sortField?: string
    sortOrder?: string
    sorts?: Sort[]
    userAccount?: string
    userEmail?: string
    userName?: string
    userPhone?: string
    userProfile?: string
    userRole?: string
  }

  type UserRegisterRequest = {
    checkPassword?: string
    userAccount?: string
    userPassword?: string
  }

  type UserUpdateRequest = {
    birthday?: string
    id?: number
    isDisabled?: number
    userAccount?: string
    userAvatar?: string
    userEmail?: string
    userName?: string
    userPhone?: string
    userProfile?: string
    userRole?: string
  }

  type UserVO = {
    birthday?: string
    createTime?: string
    id?: number
    inviteUserId?: number
    isDisabled?: number
    shareCode?: string
    userAccount?: string
    userAvatar?: string
    userEmail?: string
    userName?: string
    userPhone?: string
    userProfile?: string
    userRole?: string
    vipCode?: string
    vipExpireTime?: string
    vipNnumber?: number
    vipSign?: string
  }

  type validateCodeUsingGETParams = {
    /** code */
    code: string
  }

  type VIPRedemptionCode = {
    code?: string
    createdAt?: string
    id?: number
    isUsed?: boolean
    updatedAt?: string
    usedAt?: string
    userId?: number
  }

  type VIPRedemptionCodeDTO = {
    code?: string
    id?: number
    isUsed?: boolean
    usedAt?: string
    userId?: number
  }
}
