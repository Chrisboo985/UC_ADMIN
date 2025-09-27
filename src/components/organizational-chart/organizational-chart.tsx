import { Tree, TreeNode } from 'react-organizational-chart';
import { memo, useRef, useMemo, useEffect, useCallback, cloneElement } from 'react';

import { useTheme } from '@mui/material/styles';

import { flattenArray } from 'src/utils/helper';

import type { OrgChartProps, OrgChartListProps } from './types';

// ----------------------------------------------------------------------

// 检查浏览器是否有用空闲实现的方法
export function useIdleCallback() {
  const idleCallbackRef = useRef<(callback: () => any) => number>();

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      idleCallbackRef.current = (cb) => window.requestIdleCallback(cb);
    } else if ('requestAnimationFrame' in window) {
      idleCallbackRef.current = (cb) => window.requestAnimationFrame(cb);
    } else {
      idleCallbackRef.current = (cb) => setTimeout(cb, 0) as unknown as number;
    }
  }, []);

  const callback = useCallback(
    (cb: () => any) => {
      if (idleCallbackRef.current) {
        idleCallbackRef.current(cb);
      }
    },
    [idleCallbackRef]
  );

  return callback;
}

// ----------------------------------------------------------------------

// 过滤重复数据项
export function filterData<T extends Record<string, any>>(data: T[], key: keyof T): T[] {
  const seen = new Set();
  return data.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}
// ----------------------------------------------------------------------

export interface NodeData {
  id: string | number;
  children?: NodeData[];
  [key: string]: any;
}

export const OrganizationalChart = memo(function OrganizationalChart<T extends NodeData>({
  data,
  nodeItem,
  ...other
}: OrgChartProps<T>) {
  const theme = useTheme();

  const cloneNode = (props: T) => cloneElement(nodeItem(props));

  const label = cloneNode({ ...data } as unknown as T);
  // console.warn('OrganizationalChart data:', data);
  const renderList = useMemo(() => filterData(data.children ?? [], 'id'), [data.children]);
  return (
    <Tree
      lineWidth="1.5px"
      nodePadding="4px"
      lineBorderRadius="24px"
      lineColor={theme.vars.palette.divider}
      label={label}
      {...other}
      key={data.id}
    >
      {renderList.map((item) => (
        <TreeList key={String(item.id)} depth={1} data={item as unknown as T} nodeItem={nodeItem} />
      ))}
    </Tree>
  );
}, (prevProps, nextProps) => prevProps.data === nextProps.data);

// ----------------------------------------------------------------------

export function TreeList<T extends NodeData>({ data, depth, nodeItem }: OrgChartListProps<T>) {
  const cloneNode = (props: T) => cloneElement(nodeItem(props));

  const totalChildren = useMemo(
    () => (data.children ? flattenArray(data.children)?.length : 0),
    [data.children]
  );

  const label = cloneNode({ ...data, depth, totalChildren } as T);

  const childrenList = useMemo(() => filterData(data.children ?? [], 'id'), [data.children]);

  return (
    <TreeNode label={label}>
      {childrenList.map((item) => (
        <TreeList data={item as unknown as T} depth={depth + 1} key={String(item.id)} nodeItem={nodeItem} />
      ))}
    </TreeNode>
  );
}

// ----------------------------------------------------------------------

