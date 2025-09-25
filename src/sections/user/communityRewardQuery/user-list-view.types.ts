import { getCommunitySubsidy } from 'src/api/user'

export type Prams = Parameters<typeof getCommunitySubsidy>[0]
export type Item = Awaited<ReturnType<typeof getCommunitySubsidy>>['data']['list'][number]