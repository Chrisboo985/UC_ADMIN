import { TableRow, TableCell, Checkbox, Typography, Chip, Box } from '@mui/material';

import { type ParentListItem } from 'src/api/user';
import { Label } from 'src/components/label';
import { CellWithTooltipCopy } from './user-table-cell';

// ----------------------------------------------------------------------

type Props = {
  row: ParentListItem;
  selected: boolean;
  onSelectRow: VoidFunction;
  onCapitalFlow: (type: string) => void;
};

export function ParentListTableRow({ row, selected, onSelectRow, onCapitalFlow }: Props) {
  const {
    member_code,
    h_username,
    h_nickname,
    address,
    address_status,
    parent_level,
    level,
    virtual_level,
    status,
    withdraw_status,
    is_active,
    is_business,
    star_level,
    mc,
    power,
    large_team_power_total,
    small_team_power_total,
    team_power_total,
    total_power,
    hp,
    tp,
    up,
    wapd,
    apd,
    apd_to_usdt_amount,
    bp,
    cp,
    rp,
    xapd,
    xapd_to_usdt_amount,
    id,
  } = row;

  const getStatusColor = (statusValue?: string) => {
    switch (statusValue) {
      case 'normal':
        return 'success';
      case 'blocked':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (statusValue?: string) => {
    switch (statusValue) {
      case 'normal':
        return '正常';
      case 'blocked':
        return '封禁';
      default:
        return statusValue || '未知';
    }
  };

  const getLevelDisplay = (levelValue?: number) => {
    if (!levelValue) return '-';
    if (levelValue <= 5) return `P${levelValue}`;
    return `D${levelValue - 5}`;
  };

  return (
    <TableRow hover>
      <TableCell>
        {parent_level ? (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 60,
              height: 32,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              px: 1.5,
              boxShadow: 1,
            }}
          >
            第{parent_level}级
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        )}
      </TableCell>

      <TableCell>
        <CellWithTooltipCopy value={member_code || '-'} />
      </TableCell>

      <TableCell>
        <CellWithTooltipCopy value={h_username || '-'} />
      </TableCell>

      <TableCell>
        <CellWithTooltipCopy value={h_nickname || '-'} />
      </TableCell>

      <TableCell>
        <CellWithTooltipCopy 
          value={address || '-'} 
          props={{ displayLength: 16 }}
        />
      </TableCell>

      <TableCell>
        <Chip
          label={getStatusText(address_status)}
          color={getStatusColor(address_status)}
          variant="soft"
          size="small"
        />
      </TableCell>

      <TableCell>
        <Label variant="soft" color={is_active === 'active' ? 'success' : 'error'}>
          {is_active === 'active' ? '已激活' : '未激活'}
        </Label>
      </TableCell>

      <TableCell>
        <Chip
          label={getStatusText(status)}
          color={getStatusColor(status)}
          variant="soft"
          size="small"
        />
      </TableCell>

      <TableCell>
        <Chip
          label={getStatusText(withdraw_status)}
          color={getStatusColor(withdraw_status)}
          variant="soft"
          size="small"
        />
      </TableCell>

      <TableCell>
        <Label variant="soft" color={is_business ? 'success' : 'error'}>
          {is_business ? '是' : '否'}
        </Label>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {getLevelDisplay(level)}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {getLevelDisplay(virtual_level)}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {star_level || 0}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {mc || 0}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {power || 0}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {large_team_power_total || 0}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {small_team_power_total || 0}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {team_power_total || 0}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {total_power || 0}
        </Typography>
      </TableCell>

      <TableCell>
        <Box
          onClick={() => onCapitalFlow('hp')}
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            '&:hover': {
              color: 'primary.dark',
              backgroundColor: 'action.hover',
              borderRadius: 1,
              px: 0.5,
            },
          }}
        >
          <CellWithTooltipCopy
            onClick={() => onCapitalFlow('hp')}
            value={hp || 0}
          />
        </Box>
      </TableCell>

      <TableCell>
        <Box
          onClick={() => onCapitalFlow('tp')}
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            '&:hover': {
              color: 'primary.dark',
              backgroundColor: 'action.hover',
              borderRadius: 1,
              px: 0.5,
            },
          }}
        >
          <CellWithTooltipCopy
            onClick={() => onCapitalFlow('tp')}
            value={tp || 0}
          />
        </Box>
      </TableCell>

      <TableCell>
        <Box
          onClick={() => onCapitalFlow('up')}
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            '&:hover': {
              color: 'primary.dark',
              backgroundColor: 'action.hover',
              borderRadius: 1,
              px: 0.5,
            },
          }}
        >
          <CellWithTooltipCopy
            onClick={() => onCapitalFlow('up')}
            value={up || 0}
          />
        </Box>
      </TableCell>

      <TableCell>
        <Box
          onClick={() => onCapitalFlow('wapd')}
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            '&:hover': {
              color: 'primary.dark',
              backgroundColor: 'action.hover',
              borderRadius: 1,
              px: 0.5,
            },
          }}
        >
          <CellWithTooltipCopy
            onClick={() => onCapitalFlow('wapd')}
            value={wapd || 0}
          />
        </Box>
      </TableCell>

      <TableCell>
        <Box
          onClick={() => onCapitalFlow('apd')}
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            '&:hover': {
              color: 'primary.dark',
              backgroundColor: 'action.hover',
              borderRadius: 1,
              px: 0.5,
            },
          }}
        >
          <CellWithTooltipCopy
            onClick={() => onCapitalFlow('apd')}
            value={apd || 0}
          />
        </Box>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {apd_to_usdt_amount || 0}
        </Typography>
      </TableCell>

      <TableCell>
        <Box
          onClick={() => onCapitalFlow('bp')}
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            '&:hover': {
              color: 'primary.dark',
              backgroundColor: 'action.hover',
              borderRadius: 1,
              px: 0.5,
            },
          }}
        >
          <CellWithTooltipCopy
            onClick={() => onCapitalFlow('bp')}
            value={bp || 0}
          />
        </Box>
      </TableCell>

      <TableCell>
        <Box
          onClick={() => onCapitalFlow('cp')}
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            '&:hover': {
              color: 'primary.dark',
              backgroundColor: 'action.hover',
              borderRadius: 1,
              px: 0.5,
            },
          }}
        >
          <CellWithTooltipCopy
            onClick={() => onCapitalFlow('cp')}
            value={cp || 0}
          />
        </Box>
      </TableCell>

      <TableCell>
        <Box
          onClick={() => onCapitalFlow('rp')}
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            '&:hover': {
              color: 'primary.dark',
              backgroundColor: 'action.hover',
              borderRadius: 1,
              px: 0.5,
            },
          }}
        >
          <CellWithTooltipCopy
            onClick={() => onCapitalFlow('rp')}
            value={rp || 0}
          />
        </Box>
      </TableCell>

      <TableCell>
        <Box
          onClick={() => onCapitalFlow('xapd')}
          sx={{
            color: 'primary.main',
            cursor: 'pointer',
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            '&:hover': {
              color: 'primary.dark',
              backgroundColor: 'action.hover',
              borderRadius: 1,
              px: 0.5,
            },
          }}
        >
          <CellWithTooltipCopy
            onClick={() => onCapitalFlow('xapd')}
            value={xapd || 0}
          />
        </Box>
      </TableCell>

      <TableCell>
        <Typography variant="body2" noWrap>
          {xapd_to_usdt_amount || 0}
        </Typography>
      </TableCell>

      <TableCell>
        <CellWithTooltipCopy value={id} />
      </TableCell>
    </TableRow>
  );
}