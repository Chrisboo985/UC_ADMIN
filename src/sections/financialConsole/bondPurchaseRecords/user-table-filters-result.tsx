import type { IUserTableFiltersForList } from 'src/types/user';
import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'src/hooks/use-set-state';

import { useCallback, useMemo } from 'react';

import { getBondIndexAPI, BondData } from 'src/api/lgns';
import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = {
  totalResults: number;
  sx?: SxProps<Theme>;
  bonds: BondData[];
  filters: {
    state: {
      bond_id: string;
      member_id: string;
      member_address: string;
    };
    setState: (state: any) => void;
  };
};

export function UserTableFiltersResult({ filters, totalResults, sx, bonds }: Props) {
  const handleRemoveAddress = useCallback(() => {
    filters.setState({ bond_id: '' });
  }, [filters]);

  const handleRemoveID = useCallback(() => {
    filters.setState({ member_id: '' });
  }, [filters]);

  const handleRemoveMemberAddress = useCallback(() => {
    filters.setState({ member_address: '' });
  }, [filters]);

  const handleReset = useCallback(() => {
    filters.setState({ bond_id: '', member_id: '', member_address: '' });
  }, [filters]);

  const bondLabel = useMemo(() => {
    if (!filters.state.bond_id) return '';
    const bond = bonds.find((b) => b.id === Number(filters.state.bond_id));
    return bond ? `${bond.name} (${filters.state.bond_id})` : filters.state.bond_id;
  }, [filters.state.bond_id, bonds]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
      <FiltersBlock label="债券:" isShow={!!filters.state.bond_id}>
        <Chip {...chipProps} label={bondLabel} onDelete={handleRemoveAddress} />
      </FiltersBlock>
      <FiltersBlock label="会员ID:" isShow={!!filters.state.member_id}>
        <Chip {...chipProps} label={filters.state.member_id} onDelete={handleRemoveID} />
      </FiltersBlock>
      <FiltersBlock label="会员地址:" isShow={!!filters.state.member_address}>
        <Chip
          {...chipProps}
          label={filters.state.member_address}
          onDelete={handleRemoveMemberAddress}
        />
      </FiltersBlock>
    </FiltersResult>
  );
}
