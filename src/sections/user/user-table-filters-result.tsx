import type { Theme, SxProps } from '@mui/material/styles';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';
import dayjs from 'dayjs';

// ----------------------------------------------------------------------

type Props = {
  totalResults: number;
  sx?: SxProps<Theme>;
  filters: any;
};

export function UserTableFiltersResult({ filters, totalResults, sx }: Props) {
  const handleRemoveAddress = useCallback(() => {
    filters.setState({ address: '' });
  }, [filters]);

  const handleRemoveMemberCode = useCallback(() => {
    filters.setState({ member_code: '' });
  }, [filters]);

  const handleRemoveRemark = useCallback(() => {
    filters.setState({ remark: '' });
  }, [filters]);

  const handleReset = useCallback(() => {
    filters.setState({
      member_code: '',
      address: '',
      remark: '',
      created_at_start: undefined,
      created_at_end: undefined,
    });
  }, [filters]);

  const handleRemoveDateRange = useCallback(() => {
    filters.setState({ created_at_start: undefined, created_at_end: undefined });
  }, [filters]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
    <FiltersBlock label="地址:" isShow={!!filters.state.address}>
      <Chip {...chipProps} label={filters.state.address} onDelete={handleRemoveAddress} />
    </FiltersBlock>
      <FiltersBlock label="备注:" isShow={!!filters.state.remark}>
        <Chip {...chipProps} label={filters.state.remark} onDelete={  handleRemoveRemark} />
      </FiltersBlock>
      <FiltersBlock label="用户编码:" isShow={!!filters.state.member_code}>
        <Chip {...chipProps} label={filters.state.member_code} onDelete={handleRemoveMemberCode} />
      </FiltersBlock>
      <FiltersBlock label="时间范围:" isShow={!!filters.state.created_at_start && !!filters.state.created_at_end}>
        <Chip
          {...chipProps}
          label={`${ dayjs.unix(filters.state.created_at_start).format('YYYY-MM-DD HH:mm:ss') } - ${ dayjs.unix(filters.state.created_at_end).format('YYYY-MM-DD HH:mm:ss') }`}
          onDelete={handleRemoveDateRange}
        />
      </FiltersBlock>
      {/* <FiltersBlock label="时间范围:" isShow={!!filters.state.address}>
        <Chip {...chipProps} label={filters.state.address} onDelete={handleRemoveKeyword} />
      </FiltersBlock> */}
    </FiltersResult>
  );
}
