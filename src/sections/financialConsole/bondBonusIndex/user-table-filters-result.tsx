import type { IUserTableFiltersForList } from 'src/types/user';
import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'src/hooks/use-set-state';

import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = {
  totalResults: number;
  sx?: SxProps<Theme>;
  filters: any;
};

export function UserTableFiltersResult({ filters, totalResults, sx }: Props) {
  const handleRemoveAddress = useCallback(() => {
    filters.setState({ member_address: '' });
  }, [filters]);

  const handleRemoveHash = useCallback(() => {
    filters.setState({ hash: '' });
  }, [filters]);

  const handleReset = useCallback(() => {
    filters.setState({ member_address: '', hash: '' });
  }, [filters]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="会员地址:" isShow={!!filters.state.member_address}>
        <Chip {...chipProps} label={filters.state.member_address} onDelete={handleRemoveAddress} />
      </FiltersBlock>

      <FiltersBlock label="交易Hash:" isShow={!!filters.state.hash}>
        <Chip {...chipProps} label={filters.state.hash} onDelete={handleRemoveHash} />
      </FiltersBlock>
    </FiltersResult>
  );
}
