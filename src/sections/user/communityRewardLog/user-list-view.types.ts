import { getCommunityRewardsList } from 'src/api/user'

export type Prams = Parameters<typeof getCommunityRewardsList>[0]
export type Item = Awaited<ReturnType<typeof getCommunityRewardsList>>['data']['list'][number]