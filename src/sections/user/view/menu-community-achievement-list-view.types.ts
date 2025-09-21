import { getMenuCommunityAchievementList } from 'src/api/user'

export type RechargeListParams = Parameters<typeof getMenuCommunityAchievementList>[0]
export type RechargeListItem = Awaited<ReturnType<typeof getMenuCommunityAchievementList>>['data']['list'][number]