import React, { useState } from 'react';

import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import Box from '@mui/material/Box';
import { useTheme, styled } from '@mui/material/styles';

import { varAlpha, stylesMode } from 'src/theme/styles';
import type { ColorType } from 'src/theme/core/palette';
import { _mock } from 'src/_mock';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { AnimateCountUp } from 'src/components/animate';
import { Label } from 'src/components/label';
import { round } from 'lodash-es';
import { copyToClipboard } from 'src/utils/copy-to-clipboard';
import type { NodeProps } from './data';

// ----------------------------------------------------------------------

// 添加一个生成随机文本的辅助函数
const generateRandomText = () => {
  const texts = ['备注'];
  return texts[0];
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

export const StandardNode = function StandardNode({
  ref,
  depth,
  id,
  parent_id,
  address,
  pad_ratio,
  pad_bonus,
  pledge_total,
  remark,
  sx,
  all_stake_amount,
  loading = false,
  team_bond_stake_usdt,
  team_bond_stake_usdt_increment,

  team_stake_tcash,
  team_stake_tcash_increment,

  tgame_team_bond_stake_usdt,
  tgame_team_bond_stake_usdt_increment,
  /**
   * 团队tgame债券Tgame - 新增
   */
  tgame_team_bond_stake_tgame,
  /**
   * 团队tgame债券Tgame增长 - 新增
   */
  tgame_team_bond_stake_tgame_increment,

  /**
   * 团队债券tcash - 新增
   */
  team_bond_stake_tcash,
  /**
   * 团队债券tcash增长 - 新增
   */
  team_bond_stake_tcash_increment,
  team_remark,

  ksp_receive,
  ksp_send,
  usdt_receive,
  usdt_send,
  type,
  children,
  member_id,
  onEdit,
}: NodeProps & { onEdit: () => void }) {
  const my_all_stake_amount = Number(all_stake_amount);
  const theme = useTheme();
  const popover = usePopover();

  // 会员类型映射
  const memberTypeMap = {
    1: '默认',
    2: '运营中心',
    3: '社区',
  };



  const isinitnode =  Number(member_id) === 0 && children && children?.length === 0;

  const styles = (color: ColorType) => ({
    color: theme.vars.palette[color].darker,
    bgcolor: varAlpha(theme.vars.palette[color].mainChannel, 0.08),
    border: `solid 1px ${varAlpha(theme.vars.palette[color].mainChannel, 0.24)}`,
    [stylesMode.dark]: { color: theme.vars.palette[color].lighter },
  });

  const isRoot = Number(parent_id) === 0;

  const handleDelete = () => {
    popover.onClose();
    toast.warning(`onDelete: ${id}`);
  };

  const handleEdit = () => {
    popover.onClose();
    onEdit();
  };

  return (
    <>
      <Card
        sx={{
          p: 2,
          minWidth: 500,
          borderRadius: 1.5,
          textAlign: 'left',
          position: 'relative',
          display: 'inline-flex',
          flexDirection: 'column',
          ...sx,
        }}
      >
        {isinitnode ? (
          <Box className="org-node">
            <Typography textAlign="center" variant="subtitle2" sx={{ mb: 0.5 }}>
              请搜索在上方输入地址
            </Typography>
          </Box>
        ) : (
          <div
            // ref={ref}
            className="org-node" // 添加类名
            data-id={member_id} // 添加节点ID
          >
            {isinitnode}
            {/* {id} */}
            <IconButton
              color={popover.open ? 'inherit' : 'default'}
              onClick={popover.onOpen}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <Iconify icon="eva:more-horizontal-fill" />
            </IconButton>

            {/* <Avatar
              src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${id}&backgroundColor=dee2e5&size=64&scale=80&translateY=10`}
              sx={{ mr: 2, mb: 2, width: 48, height: 48 }}
            /> */}

            {/* <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {`${isRoot ? '公会名称' : '社区名称'}：${null}`}
            </Typography> */}

            <Tooltip title={address} arrow>
              <Typography
                variant="caption"
                component="div"
                noWrap
                sx={{
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': {
                    // textDecoration: 'underline',
                    color: 'primary.main',
                  },
                }}
                onClick={() => {
                  copyToClipboard(address);
                  toast.success('地址已复制到剪贴板');
                }}
              >
                {address}
                {/* <span style={{ color: 'gray' }}>[{remark}]</span> */}
              </Typography>
            </Tooltip>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ width: '100%' }}>
              <Grid container spacing={0}>
                <Grid item xs={6}>
                  <Item style={{ fontSize: 13 }}>
                    <Tooltip title={`KSN入金:${Number(ksp_receive).toFixed(2)}`} arrow>
                      <Typography
                        variant="caption"
                        component="span"
                        noWrap
                        sx={{
                          color: 'text.secondary',
                          cursor: 'pointer',
                          '&:hover': {
                            // textDecoration: 'underline',
                            color: 'primary.main',
                          },
                        }}
                        onClick={() => {
                          copyToClipboard(`${Number(ksp_receive).toFixed(2)}`);
                          toast.success('KSN入金已复制到剪贴板');
                        }}
                      >
                        KSN入金:{' '}
                        <span style={{ color: '#00A76F' }}>{Number(ksp_receive).toFixed(2)}</span>
                      </Typography>
                    </Tooltip>
                  </Item>
                </Grid>
                <Grid item xs={6}>
                  <Item style={{ fontSize: 13 }}>
                    <Tooltip title={`KSN出金:${Number(ksp_send).toFixed(2)}`} arrow>
                      <Typography
                        variant="caption"
                        component="span"
                        noWrap
                        sx={{
                          color: 'text.secondary',
                          cursor: 'pointer',
                          '&:hover': {
                            // textDecoration: 'underline',
                            color: 'primary.main',
                          },
                        }}
                        onClick={() => {
                          copyToClipboard(`${Number(ksp_send).toFixed(2)}`);
                          toast.success('KSN出金已复制到剪贴板');
                        }}
                      >
                        KSN出金:{' '}
                        <span style={{ color: '#00A76F' }}>{Number(ksp_send).toFixed(2)}</span>
                      </Typography>
                    </Tooltip>
                  </Item>
                </Grid>
                <Grid item xs={6}>
                  <Item style={{ fontSize: 13 }}>
                    <Tooltip title={`USDT入金:${Number(usdt_receive).toFixed(2)}`} arrow>
                      <Typography
                        variant="caption"
                        component="span"
                        noWrap
                        sx={{
                          color: 'text.secondary',
                          cursor: 'pointer',
                          '&:hover': {
                            // textDecoration: 'underline',
                            color: 'primary.main',
                          },
                        }}
                        onClick={() => {
                          copyToClipboard(`${Number(usdt_receive).toFixed(2)}`);
                          toast.success('USDT入金已复制到剪贴板');
                        }}
                      >
                        USDT入金:{' '}
                        <span style={{ color: '#00A76F' }}>{Number(usdt_receive).toFixed(2)}</span>
                      </Typography>
                    </Tooltip>
                  </Item>
                </Grid>
                <Grid item xs={6}>
                  <Item style={{ fontSize: 13 }}>
                    <Tooltip title={`USDT出金:${Number(usdt_send).toFixed(2)}`} arrow>
                      <Typography
                        variant="caption"
                        component="span"
                        noWrap
                        sx={{
                          color: 'text.secondary',
                          cursor: 'pointer',
                          '&:hover': {
                            // textDecoration: 'underline',
                            color: 'primary.main',
                          },
                        }}
                        onClick={() => {
                          copyToClipboard(`${Number(usdt_send).toFixed(2)}`);
                          toast.success('USDT出金已复制到剪贴板');
                        }}
                      >
                        USDT出金:{' '}
                        <span style={{ color: '#00A76F' }}>{Number(usdt_send).toFixed(2)}</span>
                      </Typography>
                    </Tooltip>
                  </Item>
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ width: '100%' }}>
              <Grid container spacing={0}>
                <Grid item xs={6}>
                  <Item style={{ fontSize: 13 }}>
                    <Tooltip
                      title={`会员类型: ${memberTypeMap[type as keyof typeof memberTypeMap] || '未知'}`}
                      arrow
                    >
                      <Typography
                        variant="caption"
                        component="span"
                        noWrap
                        sx={{
                          color: 'text.secondary',
                          cursor: 'pointer',
                          '&:hover': {
                            // textDecoration: 'underline',
                            color: 'primary.main',
                          },
                        }}
                        onClick={() => {
                          copyToClipboard(
                            `${memberTypeMap[type as keyof typeof memberTypeMap] || '未知'} (${type})`
                          );
                          toast.success('会员类型已复制到剪贴板');
                        }}
                      >
                        会员类型:{' '}
                        <span style={{ color: '#00A76F' }}>
                          {memberTypeMap[type as keyof typeof memberTypeMap] || '未知'}
                        </span>
                      </Typography>
                    </Tooltip>
                  </Item>
                </Grid>
              </Grid>
            </Box>
          </div>
        )}
      </Card>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'left-center' } }}
      >
        <MenuList>
          {/* <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem> */}

          {/* <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            修改备注
          </MenuItem> */}
        </MenuList>
      </CustomPopover>
    </>
  );
};
