import React, { useMemo, useCallback, useState, useEffect, useRef, CSSProperties } from 'react';
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
const INITIAL_ROOT_NODE = { id: 0, address: '', parent_id: 0, children: [], details: {} };

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
    // 将 __v 仅用于缓存键，避免污染真实 API 参数
    const { __v, ...apiParams } = params || {};
    const cacheKey = JSON.stringify({ ...apiParams, __v });
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

    const promise = getMemberNetworkAPI(apiParams).then((response) => {
      const data = response.data;
      this.dataCache.set(cacheKey, { data, expiredAt: Date.now() + EXPIRED_TIME });
      this.requestStatus.delete(cacheKey);
      return data;
    });

    this.requestStatus.set(cacheKey, { promise, expiredAt: Date.now() + EXPIRED_TIME });
    return promise;
  }

  isLoading(parentId: number, version?: number): boolean {
    const cacheKey = JSON.stringify({ parent_id: parentId, page: PAGINATION.page, page_size: PAGINATION.pageSize, __v: version });
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
  const rafIdRef = useRef<number | null>(null);

  const setTransformRaf = useCallback((updater: (prev: typeof transform) => typeof transform) => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
    }
    rafIdRef.current = requestAnimationFrame(() => {
      setTransform((prev) => updater(prev));
      rafIdRef.current = null;
    });
  }, []);

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
        const nextX = e.clientX - dragStart.current.x;
        const nextY = e.clientY - dragStart.current.y;
        setTransformRaf((prevTransform) => ({
          ...prevTransform,
          x: nextX,
          y: nextY,
        }));
      }
    },
    [setTransformRaf]
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
        const nextX = e.touches[0].clientX - dragStart.current.x;
        const nextY = e.touches[0].clientY - dragStart.current.y;
        setTransformRaf((prevTransform) => ({
          ...prevTransform,
          x: nextX,
          y: nextY,
        }));
      }
    },
    [setTransformRaf]
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
  // 请求版本号：每次搜索/初始化都自增，用于隔离缓存与忽略过期响应
  const requestVersionRef = useRef(0);
  // IntersectionObserver 管理（避免在缩放/拖拽时频繁重建）
  const observerRef = useRef<IntersectionObserver | null>(null);
  // 记录已 observe 的具体元素，避免 DOM 重建后因复用 id 而错过新元素
  const observedElementsRef = useRef<WeakSet<Element>>(new WeakSet());
  const mapDataRef = useRef(mapData);
  useEffect(() => {
    mapDataRef.current = mapData;
  }, [mapData]);

  // NOTE: 可见性检查逻辑将放在 fetchNodes 定义之后

  // 绑定容器内新出现的 .org-node 到 observer
  const observeNewNodes = useCallback(() => {
    const container = containerRef.current as HTMLElement;
    const observer = observerRef.current;
    if (!container || !observer) return;
    const nodes = container.querySelectorAll('.org-node');
    nodes.forEach((node) => {
      if (!observedElementsRef.current.has(node)) {
        observer.observe(node);
        observedElementsRef.current.add(node);
      }
    });
  }, [containerRef]);

  const fetchNodes = useCallback(
    async function fetchNodes(parentId: number) {
      setIsLoading(true);
      try {
        const currentVersion = requestVersionRef.current;
        const params = {
          parent_id: parentId,
          page: PAGINATION.page,
          page_size: PAGINATION.pageSize,
          __v: currentVersion,
        };
        const data = await nodeManager.fetchNode(params);
        // 忽略来自旧版本的迟到响应
        if (currentVersion !== requestVersionRef.current) return;
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

  // 基于 boundingClientRect 的可见性检查（用于 transform 平移/缩放场景下触发懒加载）
  const checkVisibleAndFetch = useCallback(() => {
    const container = containerRef.current as HTMLElement;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const nodes = container.querySelectorAll('.org-node');
    const visibleNodeIds: number[] = [];
    nodes.forEach((node) => {
      const rect = (node as HTMLElement).getBoundingClientRect();
      const intersectX = Math.max(0, Math.min(containerRect.right, rect.right) - Math.max(containerRect.left, rect.left));
      const intersectY = Math.max(0, Math.min(containerRect.bottom, rect.bottom) - Math.max(containerRect.top, rect.top));
      const intersectArea = intersectX * intersectY;
      const nodeArea = rect.width * rect.height;
      const ratio = nodeArea > 0 ? intersectArea / nodeArea : 0;
      if (ratio >= 0.1) {
        const id = parseInt((node as HTMLElement).getAttribute('data-id') || '0', 10);
        if (id > 0) visibleNodeIds.push(id);
      }
    });
    visibleNodeIds.forEach((nodeId) => {
      if (!mapDataRef.current.has(nodeId)) {
        fetchNodes(nodeId);
      }
    });
  }, [fetchNodes]);

  const debouncedCheckVisibleAndFetch = useRef(debounce(() => {
    checkVisibleAndFetch();
  }, 120));

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
      return nodes.map((node: any) => {
        const child = buildTree(node.id);
        return {
          ...node,
          children: child.length > 0 ? child : null,
        };
      });
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
      // 新一轮搜索：重置缓存与数据，并自增版本号
      requestVersionRef.current += 1;
      nodeManager.reset();
      setMapData(new Map());
      setTreeData({
        details: node,
        id: Number((node as any).id),
        address: (node as any).address ?? '',
        parent_id: Number((node as any).parent_id ?? 0),
        children: [],
      });
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
          requestVersionRef.current += 1;
          nodeManager.reset();
          setMapData(new Map());
          setTreeData({
            details: node,
            id: Number((node as any).id),
            address: (node as any).address ?? '',
            parent_id: Number((node as any).parent_id ?? 0),
            children: [],
          });
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
    if (!container) return;
    const firstNode = container.querySelector('.org-node') as HTMLElement | null;
    if (!firstNode || !firstNode.parentElement || !firstNode.parentElement.parentElement) return;
    const treeRootWrapper = firstNode.parentElement as HTMLDivElement;
    const treeRootWrapperParent = treeRootWrapper.parentElement as HTMLLIElement;
    const observer = new MutationObserver((event) => {
      // console.log('MutationObserver:', event);
      // 处理 DOM 变化的逻辑
      if (event.length > 1) {
        if (event.find((e) => e.type === 'attributes')) {
          setMutationObserverTggerCount((prev) => prev + 1);
        }
      }
      // 子树结构变化后，尝试绑定新节点并触发一次可见性检查
      observeNewNodes();
      debouncedCheckVisibleAndFetch.current();
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

  // 在 transform 变更（平移/缩放）后，进行一次节流的可见性检查
  useEffect(() => {
    debouncedCheckVisibleAndFetch.current();
  }, [transform]);

  // 创建单例 IntersectionObserver（仅依赖 fetchNodes 的稳定引用）
  useEffect(() => {
    const container = containerRef.current as HTMLElement;
    if (!container) return;
    // 先断开可能存在的旧 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observedElementsRef.current = new WeakSet();
    }
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visibleNodeIds = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => parseInt(entry.target.getAttribute('data-id') || '0', 10))
          .filter((id) => id > 0);
        // 可见节点触发懒加载（基于最新 mapDataRef）
        visibleNodeIds.forEach((nodeId) => {
          if (!mapDataRef.current.has(nodeId)) {
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

    // 创建后立即绑定当前已有的节点
    observeNewNodes();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observedElementsRef.current = new WeakSet();
      }
    };
  }, [fetchNodes, observeNewNodes]);

  // 当 mapData 变化时，扫描并绑定新的 .org-node（减少重复绑定）
  useEffect(() => {
    observeNewNodes();
  }, [mapData, observeNewNodes]);

  const renderNode = useCallback((props: NodeProps) => {
    const loading = nodeManager.isLoading(parseInt((props.id ?? '0').toString(), 10), requestVersionRef.current);
    console.log('renderNode:', props);
    const isTopMember = props.id === props?.details?.is_top_member;

    const isCommunityNode = props?.details?.type === 'community';
    /**
     * 1. 如果是社区节点，需要一个特别的外观样式
     * 2. 如果是顶级会员，需要一个特别的外观样式
     */
    const sx = {
      width: 300,
      opacity: loading ? 0.6 : 1,
    } as CSSProperties;
    if (isCommunityNode) {
      sx.backgroundColor = 'primary.lighter';
    }
    if (isTopMember) {
      sx.backgroundColor = 'primary.main';
    }
    return (
      <StandardNode
        {...props}
        loading={loading}
        sx={sx}
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
