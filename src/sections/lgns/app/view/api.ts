/**
 * responses.AdminAllOutlineRes
 */
export interface ApifoxModel {
    /**
     * 代数奖APD
     */
    admin_algebra_reward_apd_res?: AdminAlgebraRewardApdRes;
    /**
     * 代数奖CP
     */
    admin_algebra_reward_cp_res?: AdminAlgebraRewardCpRes;
    /**
     * 极差奖励APD
     */
    admin_diff_reward_apd_res?: AdminDiffRewardApdRes;
    /**
     * 极差奖励CP
     */
    admin_diff_reward_cp_res?: AdminDiffRewardCpRes;
    /**
     * 升级奖励APD
     */
    admin_level_up_apd_res?: AdminLevelUpApdRes;
    /**
     * 升级奖励CP
     */
    admin_level_up_cp_res?: AdminLevelUpCpRes;
    /**
     * 用户统计
     */
    admin_member_res?: AdminMemberRes;
    /**
     * 矿机统计
     */
    admin_power_log_res?: AdminPowerLogRes;
    /**
     * 黑卡统计
     */
    admin_power_type_black_res?: Res;
    /**
     * 铂金卡统计
     */
    admin_power_type_diamond_res?: Res;
    /**
     * 金卡统计
     */
    admin_power_type_gold_res?: Res;

    /**
     * 矿机类型统计
     */
    admin_power_type_normal_res?: Res;
    /**
     * 挖矿APD
     */
    admin_rebase_apd_res?: AdminRebaseApdRes;
    /**
     * 挖矿CP
     */
    admin_rebase_cp_res?: AdminRebaseCpRes;
    /**
     * 充值奖励TP
     */
    admin_top_up_tp_res?: AdminTopUpTpRes;
    [property: string]: any;
}

/**
 * 代数奖APD
 *
 * responses.AdminAlgebraRewardAPDRes
 */
export interface AdminAlgebraRewardApdRes {
    month_profit?: number;
    today_profit?: number;
    week_profit?: number;
    [property: string]: any;
}

/**
 * 代数奖CP
 *
 * responses.AdminAlgebraRewardCPRes
 */
export interface AdminAlgebraRewardCpRes {
    month_profit?: number;
    today_profit?: number;
    week_profit?: number;
    [property: string]: any;
}

/**
 * 极差奖励APD
 *
 * responses.AdminDiffRewardAPDRes
 */
export interface AdminDiffRewardApdRes {
    month_profit?: number;
    today_profit?: number;
    week_profit?: number;
    [property: string]: any;
}

/**
 * 极差奖励CP
 *
 * responses.AdminDiffRewardCPRes
 */
export interface AdminDiffRewardCpRes {
    month_profit?: number;
    today_profit?: number;
    week_profit?: number;
    [property: string]: any;
}

/**
 * 升级奖励APD
 *
 * responses.AdminLevelUpAPDRes
 */
export interface AdminLevelUpApdRes {
    month_profit?: number;
    today_profit?: number;
    week_profit?: number;
    [property: string]: any;
}

/**
 * 升级奖励CP
 *
 * responses.AdminLevelUpCPRes
 */
export interface AdminLevelUpCpRes {
    month_profit?: number;
    today_profit?: number;
    week_profit?: number;
    [property: string]: any;
}

/**
 * 用户统计
 *
 * responses.AdminMemberRes
 */
export interface AdminMemberRes {
    /**
     * 本月新增会员数量（从本月1日开始计算）
     */
    month_new_members?: number;
    /**
     * 今日新增会员数量
     */
    today_new_members?: number;
    /**
     * 会员总数量
     */
    total_members?: number;
    /**
     * 本周新增会员数量（从本周一开始计算）
     */
    week_new_members?: number;
    [property: string]: any;
}

/**
 * 矿机统计
 *
 * responses.AdminPowerLogRes
 */
export interface AdminPowerLogRes {
    /**
     * 本月认购
     */
    month_purchase?: number;
    /**
     * 今日认购
     */
    today_purchase?: number;
    /**
     * 本周认购
     */
    week_purchase?: number;
    [property: string]: any;
}

/**
 * responses.AdminPowerTypeRes
 *
 * 矿机类型统计
 */
export interface Res {
    month_power_type_purchase?: number;
    today_power_type_purchase?: number;
    week_power_type_purchase?: number;
    [property: string]: any;
}

/**
 * 挖矿APD
 *
 * responses.AdminRebaseAPDRes
 */
export interface AdminRebaseApdRes {
    month_profit?: number;
    today_profit?: number;
    week_profit?: number;
    [property: string]: any;
}

/**
 * 挖矿CP
 *
 * responses.AdminRebaseCPRes
 */
export interface AdminRebaseCpRes {
    month_profit?: number;
    today_profit?: number;
    week_profit?: number;
    [property: string]: any;
}

/**
 * 充值奖励TP
 *
 * responses.AdminTopUpTPRes
 */
export interface AdminTopUpTpRes {
    month_profit?: number;
    today_profit?: number;
    week_profit?: number;
    [property: string]: any;
}
