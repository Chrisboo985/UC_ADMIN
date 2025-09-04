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
    filters.setState({ address: '' });
  }, [filters]);

  const handleRemoveID = useCallback(() => {
    filters.setState({ id: '' });
  }, [filters]);

  const handleRemoveRemark = useCallback(() => {
    filters.setState({ remark: '' });
  }, [filters]);

  const handleReset = useCallback(() => {
    filters.setState({ id: '', address: '', remark: '' });
  }, [filters]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
    <FiltersBlock label="地址:" isShow={!!filters.state.address}>
      <Chip {...chipProps} label={filters.state.address} onDelete={handleRemoveAddress} />
    </FiltersBlock>
      <FiltersBlock label="备注:" isShow={!!filters.state.remark}>
        <Chip {...chipProps} label={filters.state.remark} onDelete={handleRemoveRemark} />
      </FiltersBlock>
      <FiltersBlock label="ID:" isShow={!!filters.state.id}>
        <Chip {...chipProps} label={filters.state.id} onDelete={handleRemoveID} />
      </FiltersBlock>
    </FiltersResult>
  );
}
