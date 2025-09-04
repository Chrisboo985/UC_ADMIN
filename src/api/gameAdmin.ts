import { axiosForApi } from 'src/utils/axios';

const axios = axiosForApi;


/**
 * responses.PagedResponse-array_models_PlaneGameRecordEvent
 */
export interface GetEventListResponse {
    list?: ModelsPlaneGameRecordEvent[];
    total?: number;
    [property: string]: any;
}

/**
 * models.PlaneGameRecordEvent
 */
export interface ModelsPlaneGameRecordEvent {
    /**
     * 飞机id
     */
    airportId?: number;
    created_at?: number;
    created_at_string?: string;
    /**
     * 事件描述
     */
    desc?: string;
    /**
     * 事件类型
     */
    event_type?: string;
    id?: number;
    /**
     * 飞机游戏记录ID
     */
    plane_game_record_id?: number;
    /**
     * 上报时间
     */
    reported_at?: number;
    reported_at_string?: string;
    /**
     * 步骤
     */
    step?: number;
    /**
     * 事件时间戳
     */
    timestamp?: number;
    [property: string]: any;
}

// 获取机场事件列表
export const getEventListAPI = (data: any) => axios.post('/admin/plane_game/event_index', data);





/**
 * responses.PagedResponse-array_models_PlaneGameRecord
 */
export interface GetRecordListResponse {
    list?: ModelsPlaneGameRecord[];
    total?: number;
    [property: string]: any;
}

/**
 * models.PlaneGameRecord
 */
export interface ModelsPlaneGameRecord {
    /**
     * 投注钥匙数量
     */
    amount?: number;
    created_at?: number;
    created_at_string?: string;
    /**
     * 结束类型：user-手动结束 auto-自动结束
     */
    end_type?: string;
    /**
     * 结束类型描述
     */
    end_type_string?: string;
    /**
     * 结束时间
     */
    ended_at?: number;
    ended_at_string?: string;
    id?: number;
    /**
     * 是否作弊：0-否 1-是
     */
    is_cheat?: number;
    /**
     * 作弊状态描述
     */
    is_cheat_string?: string;
    /**
     * 最后上报时间
     */
    last_reported_at?: number;
    last_reported_at_string?: string;
    /**
     * 会员地址
     */
    member_address?: string;
    /**
     * 会员ID
     */
    member_id?: number;
    /**
     * 奖励金额
     */
    reward_amount?: number;
    /**
     * 奖励类型
     */
    reward_type?: string;
    /**
     * 状态 1开始 2结束
     */
    status?: number;
    /**
     * 状态描述
     */
    status_string?: string;
    /**
     * 起飞成功次数
     */
    take_off_success_count?: number;
    updated_at?: number;
    updated_at_string?: string;
    [property: string]: any;
}

// 获取机场游戏记录列表
export const getRecordListAPI = (data: any) => axios.post('/admin/plane_game/record_index', data);


// 设置审核状态
export const setAuditStatusAPI = (data: any) => axios.post('/admin/plane_game/audit', data);


// 飞机游戏统计
export const getPlaneGameStatisticAPI = (data: any) => axios.post('/admin/plane_game/statistic', data);


// 飞机游戏排名
export const getPlaneGameRankingAPI = (data: any) => axios.post('/admin/plane_game/rank_index', data);


