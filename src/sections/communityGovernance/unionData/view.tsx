import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { throttle, debounce, map } from 'lodash-es';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { DatePicker } from '@mui/x-date-pickers';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';

import dayjs from 'dayjs';

import type { IDatePickerControl } from 'src/types/common';
import { fDateRangeShortLabel } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';

import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import {
  getUnionListAPI,
  getCommunityListAPI,
  setTeamRemarkAPI,
  MemberListData,
  getMemberCommunityKspSubAPI,
  getMemberCommunityStakeSubAPI,
} from 'src/api/user';
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
const INITIAL_ROOT_NODE = { member_id: 0, address: '', parent_id: 0, children: [] };
// 获取当天的 0 时0秒的时间戳
const getTodayStartTimestamp = () => dayjs().unix();

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

    const promise = getMemberCommunityKspSubAPI(params).then((response) => {
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

export function UnionDataView() {
  const theme = useTheme();

  const openDateRange = useBoolean();
  const [unionList, setUnionList] = useState<any[]>([]);
  const [editingNode, setEditingNode] = useState<NodeProps | null>(null);
  const [remarkInput, setRemarkInput] = useState('');
  const [mapData, setMapData] = useState(new Map());
  const [treeData, setTreeData] = useState<typeof INITIAL_ROOT_NODE>(INITIAL_ROOT_NODE);
  const [rootId, setRootId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [mutationObserverTggerCount, setMutationObserverTggerCount] = useState(0);
  // 用户最后一次有效的日期范围 - 参考会员列表实现方式
  const [lastValidDateRange, setLastValidDateRange] = useState<{
    start?: IDatePickerControl;
    end?: IDatePickerControl;
  }>({});
  const filtersForEdit = useSetState<{
    union_id: number | null;
    community_id: number | null;
    address: string;
    date: number;
    id: string;
    created_at_start?: IDatePickerControl;
    created_at_end?: IDatePickerControl;
  }>({
    union_id: null,
    community_id: null,
    address: '',
    date: getTodayStartTimestamp(),
    id: '',
    created_at_start: null,
    created_at_end: null,
  });
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
    async function _fetchNodes(parentId: number) {
      setIsLoading(true);
      try {
        const params = {
     
          page: PAGINATION.page,
          page_size: PAGINATION.pageSize,
          parent_id: parentId,
          created_at_start: filtersForEdit.state.created_at_start ? 
            dayjs(filtersForEdit.state.created_at_start).unix()  : undefined,
          created_at_end: filtersForEdit.state.created_at_end ? 
            dayjs(filtersForEdit.state.created_at_end).unix()  : undefined,
        };
        console.log('Fetching nodes with params:', params);
        const data = await nodeManager.fetchNode(params);
        console.log(`Fetched nodes for parent ${parentId}:`, data.list);

        if (!data.list) return;

        data.list = data.list?.map((item: any) => {
          item.member_id = item.id;
          return item;
        });
        updateSreenNodes(data, parentId);
      } catch (error) {
        console.error('Failed to fetch nodes:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [nodeManager, filtersForEdit.state.date, filtersForEdit.state.created_at_start, filtersForEdit.state.created_at_end]
  );

  function updateSreenNodes(data: any, parentId: number) {
    console.log('Updating screen nodes...');
    setMapData((prev) => {
      const newMap = new Map(prev);
      newMap.set(
        parentId,
        data.list?.map((item: any) => {
          item.parent_id = parentId;
          return item;
        })
      );
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
        id: node.member_id || node.id,
        children: buildTree(node.id).length > 0 ? buildTree(node.id) : null,
      }));
    };

    setTreeData((prev) => ({
      ...prev,
      children: buildTree(),
    }));
    console.log('Generated tree data:', treeData);
  }

  async function getRootNode() {
    try {
      const res = await getMemberCommunityKspSubAPI({
        page: 1,
        page_size: 999,
        address: filtersForEdit.state.address,
        created_at_start: filtersForEdit.state.created_at_start ? 
          dayjs(filtersForEdit.state.created_at_start).startOf('day').unix() : undefined,
        created_at_end: filtersForEdit.state.created_at_end ? 
          dayjs(filtersForEdit.state.created_at_end).endOf('day').unix() : undefined,
      });
      const data = res.data;
      if (res.code === 0 && Array.isArray(data.list) && data.list.length > 0) {
        data.list = data.list.map((item: any) => {
          item.id = item.member_id;
          return item;
        });
        setUnionList(data.list);
        if (!filtersForEdit.state.id) {
          filtersForEdit.setState({ id: data.list[0].member_id });
          return data.list[0];
        }
        return data.list.find((item: any) => item.member_id === Number(filtersForEdit.state.id));
      }
    } catch (error) {
      console.error('Failed to fetch node by address:', error);
      return null;
    }
  }

  function initRootNode() {
    console.log('Initializing root node...');
    setIsLoading(true);
    return getRootNode()
      .then((node) => {
        if (node) {
          console.log('initRootNode:', node);
          setTreeData({ ...node, children: [] });
          setRootId(node.member_id);
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

  // 处理搜索地址
  const handleSearchAddress = useCallback(async () => {
    /**
     * 需要同时调用
     * 1. getUnionListAPI
     * 2. getCommunityListAPI
     */

    console.log("搜索时间",filtersForEdit.state.created_at_start, filtersForEdit.state.created_at_end)
    setIsLoading(true);
    const params = {
      page: PAGINATION.page,
      page_size: PAGINATION.pageSize,
      address: filtersForEdit.state.address,
      created_at_start: filtersForEdit.state.created_at_start ? 
        dayjs(filtersForEdit.state.created_at_start).unix() : undefined,
      created_at_end: filtersForEdit.state.created_at_end ? 
        dayjs(filtersForEdit.state.created_at_end).unix() : undefined,
    };
    console.log('Search address with params:', params);
    const result = await Promise.allSettled([getMemberCommunityKspSubAPI(params)]);
    setIsLoading(false);
    let node: any;
    for (let index = 0; index < result.length; index++) {
      const r = result[index];
      if (r.status === 'fulfilled') {
        if (r.value.code === 0) {
          if (r.value.data && r.value.data.list.length > 0) {
            node = r.value.data.list[0];
            node.member_id = node.id;

            const data = r.value.data;

            console.log('handleSearchAddress data:', data);

            if (data.list && Array.isArray(data.list) && data.list.length > 0) {
              data.list = data.list.map((item: any) => {
                item.member_id = item.id;
                return item;
              });
              setUnionList(data.list);
              if (!filtersForEdit.state.id) {
                filtersForEdit.setState({ id: data.list[0].member_id });
              }
              // return data.list.find((item: any) => item.member_id === Number(filtersForEdit.state.id));
            }

            break;
          }
        }
      }
    }

    if (node) {
      console.log('handleSearchAddress node:', node);
      // 地址搜索时只更新rootId
      setRootId(node.member_id);
      setMapData(new Map());
      setTreeData({ ...node, children: [] });
      fetchNodes(node.member_id);
    }
  }, [filtersForEdit.state,fetchNodes]);

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

  useEffect(() => {
    // 只有在没有地址搜索时才初始化根节点
    if (!filtersForEdit.state.address) {
      nodeManager.reset();
      setMapData(new Map());
      setTreeData(INITIAL_ROOT_NODE);
      // initRootNode();
    }
  }, [filtersForEdit.state.date, filtersForEdit.state.id, rootId, filtersForEdit.state.address]);

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

  const renderNode = useCallback(
    (props: NodeProps) => {
      console.log('Rendering node:', props);

      const loading = nodeManager.isLoading(parseInt((props.id ?? '0').toString(), 10));
      return (
        <StandardNode
          {...props}
          loading={loading}
          depth={props.depth}
          sx={{
            width: 300,
            opacity: loading ? 0.6 : 1,
          }}
          onEdit={() => {
            setEditingNode(props);
            setRemarkInput(props.team_remark || '');
          }}
        />
      );
    },
    [nodeManager]
  );

  // 处理日期范围选择 - 遵循会员列表的实现方式
  const handleApplyDateRange = (start: IDatePickerControl, end: IDatePickerControl) => {
    // 父组件接收到用户选择的数据
    filtersForEdit.setState({ created_at_start: start, created_at_end: end });
    if (start && end) {
      console.log('Selected start date:', start.format('YYYY-MM-DD'));
      console.log('Selected end date:', end.format('YYYY-MM-DD'));
      
      setMapData(new Map());
      setTreeData(INITIAL_ROOT_NODE);

      resetCanvas();
      // 不再直接调用handleSearchAddress，由useEffect监听状态变化后调用
    }
  };
  
  // 监听日期范围状态变化，当状态更新后自动触发搜索
  useEffect(() => {
    if (filtersForEdit.state.created_at_start && filtersForEdit.state.created_at_end) {
      console.log('日期状态已更新，触发搜索:', 
        filtersForEdit.state.created_at_start.format('YYYY-MM-DD'),
        filtersForEdit.state.created_at_end.format('YYYY-MM-DD'));
      handleSearchAddress();
    }
  }, [filtersForEdit.state.created_at_start, filtersForEdit.state.created_at_end, handleSearchAddress]);
  
  // 检查日期错误 - 确保开始日期不晚于结束日期
  const dateError = filtersForEdit.state.created_at_start && filtersForEdit.state.created_at_end ?
    dayjs(filtersForEdit.state.created_at_start).isAfter(dayjs(filtersForEdit.state.created_at_end)) : false;

  return (
    <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="公会出入金"
        links={[
          { name: '控制台', href: paths.dashboard.root },
          { name: '社区治理', href: paths.dashboard.communityGovernance.root },
          { name: '公会出入金' },
        ]}
        sx={{ mb: { xs: 2, md: 5 } }}
      />

      <Stack
        spacing={2}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ mb: 4 }}
      >
         <FormControl sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
          <Button
            color="inherit"
            onClick={openDateRange.onTrue}
            endIcon={<Iconify icon="eva:calendar-fill" sx={{ ml: -0.5 }} />}
          >
            {!!filtersForEdit.state.created_at_start && !!filtersForEdit.state.created_at_end
              ? `${dayjs(filtersForEdit.state.created_at_start).format('YYYY-MM-DD')} ~ ${dayjs(filtersForEdit.state.created_at_end).format('YYYY-MM-DD')}`
              : '选择日期范围'}
          </Button>
        </FormControl>

        <FormControl sx={{ flex: 1, maxWidth: 300 }}>
          <Select
            disabled={isLoading || !!filtersForEdit.state.address}
            value={filtersForEdit.state.id}
            onChange={(e) => {
              const member_id = Number(e.target.value);
              // 清空地址搜索
              filtersForEdit.setState({
                id: member_id.toString(),
                address: '',
              });
              setRootId(member_id);
            }}
          >
            {unionList.map((item) => (
              <MenuItem key={item.member_id} value={item.member_id}>
                {/* @ts-ignore */}
                {`${item.address}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          disabled={isLoading}
          variant="contained"
          onClick={resetCanvas}
          sx={{ minWidth: 120 }}
        >
          {isLoading ? '加载中...' : '聚焦根节点'}
        </Button>
      </Stack>

      <Stack
        spacing={2}
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        sx={{ mb: 4 }}
      >
        <FormControl sx={{ width: 400 }}>
          <TextField
            placeholder="请输入要搜索的地址"
            value={filtersForEdit.state.address}
            onChange={(e) => {
              filtersForEdit.setState({ address: e.target.value });
            }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => {
                    filtersForEdit.setState({ address: '' });
                  }}
                >
                  <Iconify icon="eva:close-fill" sx={{ color: 'text.disabled' }} />
                </IconButton>
              ),
            }}
          />
        </FormControl>
        
  

        <Button
          disabled={isLoading}
          variant="contained"
          onClick={handleSearchAddress}
          sx={{ minWidth: 120 }}
        >
          {isLoading ? '加载中...' : '搜索地址'}
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

      {/* 日期范围选择器对话框 */}
      <CustomDateRangePicker
        variant="input"
        open={openDateRange.value}
        onClose={openDateRange.onFalse}
        startDate={filtersForEdit.state.created_at_start ? dayjs(filtersForEdit.state.created_at_start) : dayjs().startOf('day')}
        endDate={filtersForEdit.state.created_at_end ? dayjs(filtersForEdit.state.created_at_end) : dayjs().endOf('day')}
        onApply={handleApplyDateRange}
        error={dateError}
        title="选择日期范围"
      />

      <Dialog open={!!editingNode} onClose={() => setEditingNode(null)}>
        <DialogTitle>编辑节点备注</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            value={remarkInput}
            onChange={(e) => setRemarkInput(e.target.value)}
            sx={{ mt: 2, width: 400 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingNode(null)}>取消</Button>
          <Button
            onClick={async () => {
              if (editingNode) {
                try {
                  editingNode.remark = remarkInput;
                  console.log(mapData, editingNode);
                  mapData.get(editingNode.parent_id!).forEach((item: any) => {
                    if (item.member_id === editingNode.member_id) {
                      item.team_remark = remarkInput;
                    }
                  });
                  const newMapdata = new Map(mapData);
                  setMapData(newMapdata);
                  setEditingNode(null);
                  // 后续调整
                  await setTeamRemarkAPI({
                    member_id: editingNode.member_id!,
                    remark: remarkInput,
                  });
                  toast.success('备注更新成功!');
                } catch (error) {
                  toast.error('更新失败，请重试');
                }
              }
            }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
