import type { Theme, SxProps } from '@mui/material/styles';
import type { OrgChartBaseNode } from 'src/components/organizational-chart';

import { _mock } from 'src/_mock';

// ----------------------------------------------------------------------

// export type NodeProps = OrgChartBaseNode & {
//   id?: string;
//   name: string;
//   group?: string;
//   role?: string;
//   avatarUrl?: string;
//   children?: any;
//   sx?: SxProps<Theme>;
// };
export type NodeProps = OrgChartBaseNode & {
  id?: string;
  address: string;
  parent_id?: string;
  tron_address?: string;
  ref?: any;
  children?: any;
  sx?: SxProps<Theme>;
  pad_ratio?: number;
  pad_bonus?: number;
  pledge_total?: number;
  remark?: string;
  all_stake_amount: string;
  loading?: boolean;

  /**
   * 团队债券usdt
   */
  team_bond_stake_usdt?: number;

  /**
   * 团队债券usdt增长
   */
  team_bond_stake_usdt_increment?: number;

  /**
   * 团队质押tcash
   */
  team_stake_tcash?: number;

  /**
   * 团队质押tcash增长
   */
  team_stake_tcash_increment?: number;

  /**
   * 团队tgame债券usdt
   */
  tgame_team_bond_stake_usdt?: number;

  /**
   * 团队tgame债券usdt增长
   */
  tgame_team_bond_stake_usdt_increment?: number;

  /**
   * 团队tgame债券Tgame - 新增
   */
  tgame_team_bond_stake_tgame?: number;
  /**
   * 团队tgame债券Tgame增长 - 新增
   */
  tgame_team_bond_stake_tgame_increment?: number;

  /**
   * 团队债券tcash - 新增
   */
  team_bond_stake_tcash?: number;
  /**
   * 团队债券tcash增长 - 新增
   */
  team_bond_stake_tcash_increment?: number;



  // 类型

  type?: number;
  /**
   * KSP入金
   */
  ksp_receive?: number|string;
  /**
   * KSP出金
   */
  ksp_send?: number|string;
  /**
   * USDT入金
   */
  usdt_receive?: number|string;
  /**
   * USDT出金
   */
  usdt_send?: number|string;

  member_id?: number;
  team_remark?: string;

  /**
   * ksp债券购买数量
   */
  bond_ksp_amount?: number|string;
  /**
   * usdt债券购买数量
   */
  bond_usdt_amount?: number|string;
};

const rootNode = {
  group: 'root',
  role: 'ceo, co-founder',
  name: _mock.fullName(1),
  avatarUrl: _mock.image.avatar(1),
};

const group = { product: 'product design', development: 'development', marketing: 'marketing' };

// ----------------------------------------------------------------------

export const SIMPLE_DATA = {
  ...rootNode,
  children: [
    {
      role: 'Lead',
      id: _mock.id(2),
      name: _mock.fullName(2),
      avatarUrl: _mock.image.avatar(2),
      children: [
        {
          role: 'Senior',
          id: _mock.id(3),
          name: _mock.fullName(3),
          avatarUrl: _mock.image.avatar(3),
        },
      ],
    },
    {
      role: 'Senior',
      id: _mock.id(3),
      name: _mock.fullName(3),
      avatarUrl: _mock.image.avatar(3),
    },
    {
      role: 'Senior',
      id: _mock.id(3),
      name: _mock.fullName(3),
      avatarUrl: _mock.image.avatar(3),
    },
    {
      role: 'Senior',
      id: _mock.id(3),
      name: _mock.fullName(3),
      avatarUrl: _mock.image.avatar(3),
    },
    {
      role: 'Lead',
      id: _mock.id(4),
      name: _mock.fullName(4),
      avatarUrl: _mock.image.avatar(4),
      children: [
        {
          role: 'Senior',
          id: _mock.id(5),
          name: _mock.fullName(5),
          avatarUrl: _mock.image.avatar(5),
          children: [
            {
              role: 'Back end developer',
              id: _mock.id(6),
              name: _mock.fullName(6),
              avatarUrl: _mock.image.avatar(6),
              children: [
                {
                  role: 'Back end developer',
                  id: _mock.id(7),
                  name: _mock.fullName(7),
                  avatarUrl: _mock.image.avatar(7),
                  children: [
                    {
                      role: 'Back end developer',
                      id: _mock.id(7),
                      name: _mock.fullName(7),
                      avatarUrl: _mock.image.avatar(7),
                      children: [
                        {
                          role: 'Back end developer',
                          id: _mock.id(7),
                          name: _mock.fullName(7),
                          avatarUrl: _mock.image.avatar(7),
                          children: [
                            {
                              role: 'Back end developer',
                              id: _mock.id(7),
                              name: _mock.fullName(7),
                              avatarUrl: _mock.image.avatar(7),
                              children: [
                                {
                                  role: 'Back end developer',
                                  id: _mock.id(7),
                                  name: _mock.fullName(7),
                                  avatarUrl: _mock.image.avatar(7),
                                  children: [
                                    {
                                      role: 'Back end developer',
                                      id: _mock.id(7),
                                      name: _mock.fullName(7),
                                      avatarUrl: _mock.image.avatar(7),
                                      children: [
                                        {
                                          role: 'Back end developer',
                                          id: _mock.id(7),
                                          name: _mock.fullName(7),
                                          avatarUrl: _mock.image.avatar(7),
                                          children: [
                                            {
                                              role: 'Back end developer',
                                              id: _mock.id(7),
                                              name: _mock.fullName(7),
                                              avatarUrl: _mock.image.avatar(7),
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              role: 'Front end',
              id: _mock.id(8),
              name: _mock.fullName(8),
              avatarUrl: _mock.image.avatar(8),
            },
          ],
        },
      ],
    },
    {
      role: 'Lead',
      id: _mock.id(9),
      name: _mock.fullName(9),
      avatarUrl: _mock.image.avatar(9),
      children: [
        {
          role: 'Support',
          id: _mock.id(10),
          name: _mock.fullName(10),
          avatarUrl: _mock.image.avatar(10),
        },
        {
          role: 'Content writer',
          id: _mock.id(11),
          name: _mock.fullName(11),
          avatarUrl: _mock.image.avatar(11),
        },
      ],
    },
  ],
};
