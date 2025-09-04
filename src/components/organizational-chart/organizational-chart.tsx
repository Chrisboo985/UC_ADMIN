import { cloneElement, useEffect, useRef, useState, memo, useCallback } from 'react';

import { Tree, TreeNode } from 'react-organizational-chart';

import { useTheme } from '@mui/material/styles';

import { flattenArray } from 'src/utils/helper';

import type { OrgChartProps, OrgChartListProps, OrgChartSubListProps } from './types';

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
  console.warn('OrganizationalChart data:', data);
  const renderList = filterData(data.children, 'id');
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
      {renderList.map((item, index) => (
        <TreeList key={index} depth={1} data={item} nodeItem={nodeItem} />
      ))}
    </Tree>
  );
}, (prevProps, nextProps) => prevProps.data === nextProps.data);

// ----------------------------------------------------------------------

export function TreeList<T extends NodeData>({ data, depth, nodeItem }: OrgChartListProps<T>) {
  const [renderedChildren, setRenderedChildren] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cloneNode = (props: T) => cloneElement(nodeItem(props));

  const totalChildren = data.children ? flattenArray(data.children)?.length : 0;

  const label = cloneNode({ ...data, depth, totalChildren } as T);

  const idleCallback = useIdleCallback();

  useEffect(() => {
    // console.log(`TreeList data id<${data.id}>:`, data);
    if (data.children && currentIndex < data.children.length) {
      idleCallback(() => {
        // setRenderedChildren((prev) => filterData([...prev, data.children?.[currentIndex]], 'id'));
        // setCurrentIndex((prev) => prev + 1);
        setRenderedChildren(() => filterData(data.children!, 'id'));
      });
    }
  }, [data.children, currentIndex, idleCallback]);

  return (
    <TreeNode label={label}>
      {renderedChildren.map((item, index) => (
        <TreeList data={item} depth={depth + 1} key={index} nodeItem={nodeItem} />
      ))}
    </TreeNode>
  );
}

// ----------------------------------------------------------------------

function TreeSubList<T extends NodeData>({ data, depth, nodeItem }: OrgChartSubListProps<T>) {
  return (
    data &&
    data.map((item) => (
      <TreeList
        key={`${item.id}_${1}_${item.children?.length ?? 0}`}
        data={item}
        depth={depth}
        nodeItem={nodeItem}
      />
    ))
  );
}
