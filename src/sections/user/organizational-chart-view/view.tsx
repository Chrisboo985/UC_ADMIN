import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { throttle, debounce, map } from 'lodash-es';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { getMemberNetworkAPI, MemberListData } from 'src/api/user';
import { useSetState } from 'src/hooks/use-set-state';
import {
  NodeData,
  OrganizationalChart,
  useIdleCallback,
} from 'src/components/organizational-chart';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { StandardNode } from './standard-node';
import { ComponentBlock } from './component-block';
import { NodeProps } from './data';

// Constants
const EXPIRED_TIME = 60 * 1000;
const PAGINATION = { page: 1, pageSize: 99999 };
const VIEWPORT_MARGIN = 200;
const INITIAL_DEPTH_LIMIT = 4;
const INITIAL_ROOT_NODE = { id: 0, address: '', parent_id: 0, children: [] };

// Types
interface DataCache {
  expiredAt: number;
  data: MemberListData;
}

interface RequestStatus {
  promise: Promise<MemberListData>;
  expiredAt: number;
}


class NodeManager {
  private dataCache: Map<string, DataCache>;
  private requestStatus: Map<string, RequestStatus>;

  constructor() {
    this.dataCache = new Map<string, DataCache>();
    this.requestStatus = new Map<string, RequestStatus>();
  }

  async fetchNode(params: any): Promise<any> {
    const cacheKey = JSON.stringify(params);
    if (this.dataCache.has(cacheKey)) {
      const cacheEntry = this.dataCache.get(cacheKey);
      if (cacheEntry && cacheEntry.expiredAt > Date.now()) {
        return cacheEntry.data;
      }
    }

    if (this.requestStatus.has(cacheKey)) {
      const request = this.requestStatus.get(cacheKey);
      if (request) {
        return request.promise;
      }
    }

    const promise = getMemberNetworkAPI(params).then((response) => {
      const data = response.data;
      this.dataCache.set(cacheKey, { data, expiredAt: Date.now() + EXPIRED_TIME });
      this.requestStatus.delete(cacheKey);
      return data;
    });

    this.requestStatus.set(cacheKey, { promise, expiredAt: Date.now() + EXPIRED_TIME });
    return promise;
  }

  isLoading(id: number): boolean {
    const cacheKey = JSON.stringify({ id });
    return this.requestStatus.has(cacheKey);
  }

  reset() {
    this.dataCache.clear();
    this.requestStatus.clear();
  }
}

function useTransform() {
  const [transform, setTransform] = useState({
    scale: 1,
    x: 0,
    y: 0,
  });

  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      if (e.shiftKey) {
        const delta = -e.deltaY;
        const zoomFactor = 0.001;
        const newScale = Math.min(Math.max(0.1, transform.scale + delta * zoomFactor), 4); // 限制缩放范围在 0.5 到 2 之间

        // 获取容器的位置信息
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          // 计算鼠标相对于容器左上角的坐标
          const offsetX = e.clientX - rect.left;
          const offsetY = e.clientY - rect.top;

          // 计算缩放前鼠标相对于内容的位置
          const contentX = (offsetX - transform.x) / transform.scale;
          const contentY = (offsetY - transform.y) / transform.scale;

          setTransform((prevTransform) => ({
            scale: newScale,
            x: offsetX - contentX * newScale,
            y: offsetY - contentY * newScale,
          }));
        }
      }
      // 未按下 Ctrl 键时，允许默认的滚动行为
    },
    [transform]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
      e.preventDefault();
    },
    [transform]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging.current) {
        setTransform((prevTransform) => ({
          ...prevTransform,
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        }));
      }
    },
    [transform]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      isDragging.current = true;
      dragStart.current = {
        x: e.touches[0].clientX - transform.x,
        y: e.touches[0].clientY - transform.y,
      };
      e.preventDefault();
    },
    [transform]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (isDragging.current) {
        setTransform((prevTransform) => ({
          ...prevTransform,

          x: e.touches[0].clientX - dragStart.current.x,
          y: e.touches[0].clientY - dragStart.current.y,
        }));
      }
    },
    [transform]
  );

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);
  const debounceChangeTransform = useRef(debounce(setTransform, 100));
  // 返回一个对象，包含所有的处理函数和状态
  return {
    transform,
    isDragging,
    containerRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    // setTransform: debounceChangeTransform.current,
    setTransform,
  };
}
export function OrganizationalChartView() {
  const theme = useTheme();
  const [mapData, setMapData] = useState(new Map());
  const [treeData, setTreeData] = useState<typeof INITIAL_ROOT_NODE>(INITIAL_ROOT_NODE);
  const [rootId, setRootId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const filtersForEdit = useSetState({ address: '', id: '' });
  const [mutationObserverTggerCount, setMutationObserverTggerCount] = useState(0);
  const {
    transform,
    containerRef,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    setTransform,
  } = useTransform();
  const nodeManager = useMemo(() => new NodeManager(), []);

  const fetchNodes = useCallback(
    async function fetchNodes(parentId: number) {
      setIsLoading(true);
      try {
        const params = {
          parent_id: parentId,
          page: PAGINATION.page,
          page_size: PAGINATION.pageSize,
        };
        const data = await nodeManager.fetchNode(params);
        console.log(`Fetched nodes for parent ${parentId}:`, data.list);
        updateSreenNodes(data, parentId);
      } catch (error) {
        console.error('Failed to fetch nodes:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [nodeManager]
  );

  function updateSreenNodes(data: any, parentId: number) {
    console.log('Updating screen nodes...',data);
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
      console.log(`Building tree for parent ${parentId}...`,nodes);
      return nodes.map((node: any) => ({
        ...node,
        children: buildTree(node.id).length > 0 ? buildTree(node.id) : null,
      }));
    };
    setTreeData((prev) => ({
      ...prev,
      children: buildTree(),
    }));
  }

  async function handleSearch() {
    console.log('Searching nodes...');
    // dataCache.clear();
    const node = await getRootNode({
      address: filtersForEdit.state.address,
      id: filtersForEdit.state.address ? undefined : 1,
    });

    console.log("查出来的父级节点",node)
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
      const res = await getMemberNetworkAPI({ ...params, page: PAGINATION.page, page_size: 1 });
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
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }


  function resetCanvas() {
    const container = containerRef.current as HTMLElement;
    console.log('Satrt Resetting canvas...');
    const [node] = Array.from(container.querySelectorAll('.org-node')).filter((el_node) => {
      const nodeId = parseInt(el_node.getAttribute('data-id') || '0', 10);
      return nodeId === rootId;
    });
    console.log('find node:', node);
    if (!node) return;
    const treeRootWrapper = node.parentElement as HTMLDivElement; // 这是 node 卡片的包裹元素
    const treeRootWrapperParent = treeRootWrapper.parentElement as HTMLLIElement; // 这是 OrganizationalChart 组件的根元素
    // 计算视口的宽度中点
    const viewPortWidthMiddle = container.offsetWidth / 2;
    // 计算视口的高度中点
    const viewPortHeightMiddle = container.offsetHeight / 2;
    // 计算内容宽度
    const contentWidth = treeRootWrapperParent.offsetWidth * transform.scale;

    // 更新 transform 状态以居中组织结构图视图
    setTransform((perv) => ({
      scale: perv.scale,
      x: viewPortWidthMiddle - contentWidth / 2,
      y: viewPortHeightMiddle - treeRootWrapper.offsetHeight / 1.2,
    }));
  }

  // 监听根节点卡片包裹元素的父级节点宽高变化
  useEffect(() => {
    const container = containerRef.current as HTMLElement;
    const treeRootWrapper = container.querySelector('.org-node')!.parentElement as HTMLDivElement;
    const treeRootWrapperParent = treeRootWrapper.parentElement as HTMLLIElement;
    const observer = new MutationObserver((event) => {
      // console.log('MutationObserver:', event);
      // 处理 DOM 变化的逻辑
      if (event.length > 1) {
        if (event.find((e) => e.type === 'attributes')) {
          setMutationObserverTggerCount((prev) => prev + 1);
        }
      }
    });
    observer.observe(treeRootWrapperParent, {
      attributes: true, // 监听属性变化
      childList: true, // 监听子节点变化
      subtree: true, // 监听整个子树的变化
    });
    return () => {
      observer.disconnect();
    };
  }, [rootId]);

  // useEffect(initRootNode, []);

  useEffect(resetCanvas, [rootId]);

  useEffect(generateTreeData, [mapData]);

  useEffect(() => {
    const container = containerRef.current as HTMLElement;
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleNodeIds = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => parseInt(entry.target.getAttribute('data-id') || '0', 10))
          .filter((id) => id > 0);
        console.log('visibleNodeIds:', visibleNodeIds);
        // 处理可见节点的业务逻辑
        visibleNodeIds.forEach((nodeId) => {
          if (!mapData.has(nodeId)) {
            fetchNodes(nodeId);
          }
        });
      },
      {
        root: container,
        rootMargin: '0px',
        threshold: 0.1,
      }
    );

    const nodes = container.querySelectorAll('.org-node');
    nodes.forEach((node) => observer.observe(node));

    return () => {
      nodes.forEach((node) => observer.unobserve(node));
    };
  }, [mapData, transform.scale, isDragging.current, fetchNodes]);

  const renderNode = useCallback((props: NodeProps) => {
    const loading = nodeManager.isLoading(parseInt((props.id ?? '0').toString(), 10));
    console.log('renderNode:', props);
    return (
      <StandardNode
        {...props}
        loading={loading}
        sx={{
          width: 300,
          opacity: loading ? 0.6 : 1,
        }}
      />
    );
  },[nodeManager]);

  return (
    <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="网体查询"
        links={[
          { name: '会员' },
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
              // setRootId(Number(e.target.value));
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
        <Button variant="contained" onClick={resetCanvas} sx={{ minWidth: 120 }}>
          聚焦根节点
        </Button>
      </Stack>

      <ComponentBlock
        title="标准网体(Shift + 滚轮缩放)"
        sx={{
          flexGrow: 1,
          '& .header-action': {
            display: 'flex',
            alignItems: 'center',
          },
          paddingBottom: theme.spacing(0),
          paddingLeft: theme.spacing(0),
          paddingRight: theme.spacing(0),
          paddingTop: theme.spacing(1.5),
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: 590,
            overflow: 'hidden',
            position: 'relative',
            cursor: isDragging.current ? 'grabbing' : 'grab',
            userSelect: 'none',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div
            style={{
              transition: 'transform 60sm ease',
              // border: '1px solid red',
              position: 'relative',
              width: '100%',
              height: '100%',
              transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
              transformOrigin: '0 0',
            }}
          >
            {/* @ts-ignore */}
            <OrganizationalChart lineHeight="40px" data={treeData} nodeItem={renderNode} />
          </div>
        </div>
      </ComponentBlock>
    </DashboardContent>
  );
}
