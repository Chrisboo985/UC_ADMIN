import React from 'react';

import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { varAlpha, stylesMode } from 'src/theme/styles';
import type { ColorType } from 'src/theme/core/palette';
import { _mock } from 'src/_mock';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { Label } from 'src/components/label';
import { round } from 'lodash-es';
import { copyToClipboard } from 'src/utils/copy-to-clipboard';
import type { NodeProps } from './data';

// ----------------------------------------------------------------------

// 添加一个生成随机文本的辅助函数
const generateRandomText = () => {
  const texts = ['备注'];
  return texts[Math.floor(Math.random() * texts.length)];
};

// 模拟债券数据
const bondList = [
  {
    bond_name: '定期债券A',
    pad_ratio: 0,
  },
  {
    bond_name: '活期债券B',
    pad_ratio: 0,
  },
  {
    bond_name: '定期债券C',
    pad_ratio: 0,
  },
];

export const StandardNode = function StandardNode({
  ref,
  depth,
  id,
  parent_id,
  address,
  pad_ratio,
  pad_bonus,
  stake_amount,
  children,
  total_bond,
  pledge_total,
  remark,
  sx,
  all_stake_amount,
  loading = false,
}: NodeProps) {
  const my_all_stake_amount = Number(all_stake_amount);
  const theme = useTheme();
  const popover = usePopover();

  const isinitnode = id === 0 && children&& children?.length === 0;


  const styles = (color: ColorType) => ({
    color: theme.vars.palette[color].darker,
    bgcolor: varAlpha(theme.vars.palette[color].mainChannel, 0.08),
    border: `solid 1px ${varAlpha(theme.vars.palette[color].mainChannel, 0.24)}`,
    [stylesMode.dark]: { color: theme.vars.palette[color].lighter },
  });

  const isLabel = depth === 0;

  const onDelete = () => {
    popover.onClose();
    toast.warning(`onDelete: ${id}`);
  };

  const onEdit = () => {
    popover.onClose();
    toast.info(`onEdit: ${id}`);
  };

  return (
    <>
      <Card
        sx={{
          p: 2,
          minWidth: 200,
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
            data-id={id} // 添加节点ID
          >
            {/* {id} */}
            <IconButton
              color={popover.open ? 'inherit' : 'default'}
              onClick={popover.onOpen}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              <Iconify icon="eva:more-horizontal-fill" />
            </IconButton>

            <Avatar
              src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${id}&backgroundColor=dee2e5&size=64&scale=80&translateY=10`}
              // src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${id}`}
              sx={{ mr: 2, mb: 2, width: 48, height: 48 }}
            />

            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
              {remark || generateRandomText()}
            </Typography>

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
              </Typography>
            </Tooltip>

            <Divider sx={{ my: 1 }} />

            {bondList.map(
              (bond, index) =>
                bond.pad_ratio > 0 && (
                  <Typography
                    key={index}
                    variant="caption"
                    component="div"
                    noWrap
                    sx={{ color: 'text.secondary', mb: 0.5 }}
                  >
                    {bond.bond_name}帕点比例: {`${round(bond.pad_ratio, 2)}%`}
                  </Typography>
                )
            )}

            <Typography
              variant="caption"
              component="div"
              noWrap
              sx={{ color: 'text.secondary', mb: 0.5 }}
            >
              当前质押KSN:{' '}
              {`${stake_amount && round(parseFloat(stake_amount || '0'), 2) ? `${round(parseFloat(stake_amount || '0'), 2)}` : '0'}`}
            </Typography>

            <Typography
              variant="caption"
              component="div"
              noWrap
              sx={{ color: 'text.secondary', mb: 0.5 }}
            >
              债券总认购（USDT）:{' '}
              {`${total_bond && round(parseFloat(total_bond || '0'), 2) ? `${round(parseFloat(total_bond || '0'), 2)}` : '0'}`}
            </Typography>

            {/* <Typography variant="caption" component="div" noWrap sx={{ color: 'text.secondary' }}>
            用户备注：
          </Typography> */}
          </div>
        )}
      </Card>

      {/* <Stack sx={{ position: 'relative', display: 'inline-flex' }} alignItems="center">
        {depth && (
          <Avatar
            src={`https://api.dicebear.com/9.x/pixel-art/svg?seed=${id}&backgroundColor=dee2e5&size=64&scale=80&translateY=10`}
            sx={{
              mt: -3.5,
              zIndex: 9,
              width: 56,
              height: 56,
              position: 'absolute',
              border: `solid 4px ${theme.vars.palette.background.paper}`,
            }}
          />
        )}

        <Card
          sx={{
            pt: 5,
            pb: 3,
            minWidth: 200,
            borderRadius: 1.5,
            ...(isLabel && { py: 2 }),
            ...(isLabel && styles('primary')),
            ...sx,
          }}
        >
          <div
            className="org-node" // 添加类名
            data-id={id} // 添加节点ID
          >
            {depth && depth !== 0 && (
              <IconButton
                color={popover.open ? 'inherit' : 'default'}
                onClick={popover.onOpen}
                sx={{
                  top: 8,
                  right: 8,
                  position: 'absolute',
                  ...(isLabel && { display: 'none' }),
                }}
              >
                <Iconify icon="eva:more-horizontal-fill" />
              </IconButton>
            )}

            {depth && depth !== 0 && (
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  width: 1,
                  height: 4,
                  position: 'absolute',
                  borderRadius: 1.5,
                  bgcolor: 'primary.light',
                }}
              />
            )}

            <Typography variant={isLabel ? 'subtitle1' : 'subtitle2'} noWrap>
              <Label color="primary" sx={{ ml: 1 }}>
                {id}
              </Label>
            </Typography>

            <Typography
              noWrap
              component="div"
              variant="caption"
              sx={{ mt: 0.5, color: 'text.secondary' }}
            >
              {address}
            </Typography>
          </div>
        </Card>
      </Stack> */}

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'left-center' } }}
      >
        <MenuList>
          <MenuItem onClick={onDelete} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>

          <MenuItem onClick={onEdit}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
};
