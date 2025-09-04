import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { throttle } from 'lodash-es';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { getMemberIndexAPI, MemberListData } from 'src/api/user';
import { useSetState } from 'src/hooks/use-set-state';
import { OrganizationalChart, useIdleCallback } from 'src/components/organizational-chart';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { StandardNode } from './standard-node';
import { ComponentBlock } from './component-block';

// Constants
const EXPIRED_TIME = 60 * 1000;
const PAGINATION = { page: 1, pageSize: 99999 };
const VIEWPORT_MARGIN = 200;
const INITIAL_DEPTH_LIMIT = 4;
const INITIAL_ROOT_NODE = { id: 1, address: '', parent_id: 0, children: [] };

// Types
interface DataCache {
  expiredAt: number;
  data: MemberListData;
}

interface RequestStatus {
  promise: Promise<MemberListData>;
  expiredAt: number;
}

// Data Cache and Request Status
const dataCache = new Map<string, DataCache>();
const requestStatus = new Map<string, RequestStatus>();

const fetchData = async (params: any) => {
  const cacheKey = JSON.stringify(params);
  if (dataCache.has(cacheKey)) {
    const cachedData = dataCache.get(cacheKey);
    if (cachedData && cachedData.expiredAt > Date.now()) {
      // console.log(`Cache hit for params: ${cacheKey}`);
      return cachedData.data;
    }
    dataCache.delete(cacheKey);
  }

  if (requestStatus.has(cacheKey)) {
    const request = requestStatus.get(cacheKey);
    if (request && request.expiredAt > Date.now()) {
      // console.log(`Request in progress for params: ${cacheKey}`);
      return request.promise;
    }
    requestStatus.delete(cacheKey);
  }

  // console.log(`Fetching data for params: ${cacheKey}`);
  const promise = getMemberIndexAPI(params).then((res) => {
    const data = res.data;
    const code = res.code;
    if (code === 0) {
      dataCache.set(cacheKey, { expiredAt: Date.now() + EXPIRED_TIME, data });
      return data;
    }
    throw new Error('Failed to fetch data');
  });

  requestStatus.set(cacheKey, { promise, expiredAt: Date.now() + EXPIRED_TIME });
  return promise;
};

export function OrganizationalChartView() {
  const theme = useTheme();
  const [mapData, setMapData] = useState(new Map());
  const [treeData, setTreeData] = useState<typeof INITIAL_ROOT_NODE>(INITIAL_ROOT_NODE);
  const [rootId, setRootId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleNodes, setVisibleNodes] = useState<number[]>([]);
  const filtersForEdit = useSetState({ address: '', id: '' });
  const scrollableNodeRef = useRef(null);
  const fullScreenHandle = useFullScreenHandle();
  const idleCallback = useIdleCallback();

  async function fetchNodes(parentId: number) {
    checkVisibleNodes();
    if (!visibleNodes.includes(parentId)) {
      console.log(`Node ${parentId} is not visible, skipping...`);
      return;
    }
    setIsLoading(true);
    try {
      const params = {
        parent_id: parentId,
        page: PAGINATION.page,
        page_size: PAGINATION.pageSize,
      };
      const data = await fetchData(params);
      console.log(`Fetched nodes for parent ${parentId}:`, data.list);
      updateSreenNodes(data, parentId);
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function updateSreenNodes(data: any, parentId: number) {
    console.log('Updating screen nodes...');
    setMapData((prev) => {
      const newMap = new Map(prev);
      newMap.set(parentId, data.list);
      console.log('Updated map data:', JSON.stringify([...newMap.keys()]));
      return newMap;
    });
  }

  function generateTreeData() {
    const buildTree = (parentId = rootId) => {
      const nodes = mapData.get(parentId) || [];
      // console.log(`Building tree for parent ${parentId}...`);
      return nodes.map((node: any) => ({
        ...node,
        children: buildTree(node.id).length > 0 ? buildTree(node.id) : null,
      }));
    };
    setTreeData((prev) => ({
      ...prev,
      children: buildTree(),
    }));
    // console.log('Generated tree data:', treeData);
  }

  function checkVisibleNodes() {
    if (!scrollableNodeRef.current) return;
    console.log('Checking visible nodes...');
    const container = scrollableNodeRef.current as HTMLElement;
    const containerRect = container.getBoundingClientRect();
    const extendedRect = {
      top: containerRect.top - VIEWPORT_MARGIN,
      bottom: containerRect.bottom + VIEWPORT_MARGIN,
      left: containerRect.left - VIEWPORT_MARGIN,
      right: containerRect.right + VIEWPORT_MARGIN,
    };

    const _visibleNodes = Array.from(container.querySelectorAll('.org-node'))
      .filter((node) => {
        const nodeRect = node.getBoundingClientRect();
        return (
          nodeRect.top < extendedRect.bottom &&
          nodeRect.bottom > extendedRect.top &&
          nodeRect.left < extendedRect.right &&
          nodeRect.right > extendedRect.left
        );
      })
      .map((node) => parseInt(node.getAttribute('data-id') || '0', 10))
      .filter((id) => id > 0);
    setVisibleNodes(_visibleNodes);
  }

  async function handleSearch() {
    console.log('Searching nodes...');
    // dataCache.clear();
    const node = await getRootNode({
      address: filtersForEdit.state.address,
      id: filtersForEdit.state.address ? undefined : 1,
    });
    if (node) {
      setTreeData({ ...node, children: [] });
      setRootId(Number(node.id));
      fetchNodes(Number(node.id));
    }
  }

  async function getRootNode(params: { address?: string; id?: number }) {
    try {
      const { address, id } = params;
      if (!address && !id && id !== 0) return null;
      const res = await getMemberIndexAPI({ ...params, page: PAGINATION.page, page_size: 1 });
      const data = res.data;
      if (res.code === 0 && Array.isArray(data.list) && data.list.length > 0) {
        return data.list[0];
      }
    } catch (error) {
      console.error('Failed to fetch node by address:', error);
      return null;
    }
  }

  function initRootNode() {
    console.log('Initializing root node...');
    setIsLoading(true);
    getRootNode({ id: 1 })
      .then((node) => {
        if (node) {
          setTreeData({ ...node, children: [] });
          setRootId(node.id);
          checkVisibleNodes();
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  // function clearCache() {
  //   dataCache.clear();
  //   requestStatus.clear();

  // }

  // function refreshData() {
  //   filtersForEdit.setState({ address:'' })
  //   clearCache();
  //   handleSearch();
  // }

  useEffect(initRootNode, []);

  useEffect(generateTreeData, [mapData]);

  useEffect(() => {
    visibleNodes.forEach((nodeId) => {
      if (mapData.has(nodeId)) return;
      console.log(`Node ${nodeId} is visible, fetching...`);
      fetchNodes(nodeId);
    });
  }, [visibleNodes]);

  useEffect(() => {
    const handleScroll = throttle(checkVisibleNodes, 500);
    const dom = scrollableNodeRef.current as HTMLElement | null;
    if (dom) {
      dom.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      window.addEventListener('scroll', handleScroll);
    }
    return () => {
      dom?.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel();
    };
  }, [scrollableNodeRef.current]);

  const renderNode = useCallback(
    (props: any) => (
      <StandardNode
        {...props}
        sx={{
          width: 300,
          opacity: 1,
        }}
      />
    ),
    []
  );

  return (
    <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="网体查询"
        links={[
          { name: '控制台', href: paths.dashboard.root },
          { name: '会员', href: paths.dashboard.user.root },
          { name: '网体查询' },
        ]}
        sx={{ mb: { xs: 2, md: 5 } }}
      />

      <Stack
        spacing={2}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ mb: 4 }}
      >
        <FormControl sx={{ flex: 1, maxWidth: 300 }}>
          <TextField
            fullWidth
            value={filtersForEdit.state.address}
            onChange={(e) => {
              filtersForEdit.setState({ address: e.target.value });
            }}
            placeholder="请输入地址"
            InputProps={{
              startAdornment: <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />,
            }}
          />
        </FormControl>

        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={isLoading}
          sx={{ minWidth: 120 }}
        >
          {isLoading ? '加载中...' : '查询'}
        </Button>
        {/* <Button
          variant="contained"
          onClick={refreshData}
          disabled={isLoading}
          sx={{ minWidth: 120 }}
        >
          {isLoading ? '加载中...' : '强制刷新'}
        </Button> */}
      </Stack>

      <ComponentBlock
        title="标准网体"
        sx={{
          flexGrow: 1,
          '& .header-action': {
            display: 'flex',
            alignItems: 'center',
          },
        }}
      >
        <Stack sx={{ height: 690, width: '100%', overflow: 'hidden' }}>
          <Scrollbar
            ref={scrollableNodeRef}
            sx={{
              height: fullScreenHandle.active ? '80vh' : '100%',
              '& .fullscreen': {
                bgcolor: 'background.paper',
                position: 'relative',
              },
            }}
          >
            <OrganizationalChart lineHeight="40px" data={treeData} nodeItem={renderNode} />
          </Scrollbar>
        </Stack>
      </ComponentBlock>
    </DashboardContent>
  );
}
