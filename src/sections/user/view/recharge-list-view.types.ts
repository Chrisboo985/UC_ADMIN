import { getRechargeList } from 'src/api/user'

export type RechargeListParams = Parameters<typeof getRechargeList>[0]
export type RechargeListItem = Awaited<ReturnType<typeof getRechargeList>>['data']['list'][number]