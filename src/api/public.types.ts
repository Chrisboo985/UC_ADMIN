namespace ApiPublicTypes {
  /** 配置项对应的key值 */
  export const enum ConfigItemKey {
    /** 预售开始时间戳 */
    PreSaleStartDate = 'pre_sale_start_date',

    /** 认购奖金池比例 */
    PurchaseBonusRate = 'purchase_bonus_rate',

    /** 节点是否开启购买 */
    NodeSaleSwitch = 'node_sale_switch',

    /** nft启动购买 */
    NftSaleSwitch = 'nft_sale_switch',

    /** nft开售时间 */
    NftSaleStartTime = 'nft_sale_start_time',
  }
}

export default ApiPublicTypes