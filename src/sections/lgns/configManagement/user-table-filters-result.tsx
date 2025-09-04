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
    filters.setState({ bond_id: '' });
  }, [filters]);

  const handleRemoveID = useCallback(() => {
    filters.setState({ member_id: '' });
  }, [filters]);

  const handleReset = useCallback(() => {
    filters.setState({ bond_id: '', member_id: '' });
  }, [filters]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="债券ID:" isShow={!!filters.state.bond_id}>
        <Chip {...chipProps} label={filters.state.bond_id} onDelete={handleRemoveAddress} />
      </FiltersBlock>
      <FiltersBlock label="会员ID:" isShow={!!filters.state.member_id}>
        <Chip {...chipProps} label={filters.state.member_id} onDelete={handleRemoveID} />
      </FiltersBlock>
    </FiltersResult>
  );
}
