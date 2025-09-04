import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { toast } from 'sonner';
import LoadingButton from '@mui/lab/LoadingButton';

import {
  createNotice,
  getNoticeList,
  getNoticeDetail,
  updateNotice,
  NoticeCreateRequest,
  NoticeUpdateRequest,
  ModelsNoticeContent,
} from 'src/api/announcement';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormControlLabel, IconButton, TextField, Typography } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import DOMPurify from 'dompurify';

// 类型定义
type Language = 
  | 'en'  // 英语
  | 'fr'  // 法语
  | 'ja'  // 日语
  | 'kr'  // 韩语
  | 'tr'  // 繁体中文
  | 'vi'  // 越南语
  | 'ar'  // 阿拉伯语
  | 'ge'  // 德语
  | 'sp'  // 西班牙语
  | 'ru'  // 俄语
  | 'in'; // 印尼语

type LocalizedContent = {
  [key in Language]: string;
};

type LanguageOption = {
  value: Language;
  label: string;
  required?: boolean;
};

type LanguageGroup = {
  name: string;
  languages: Language[];
};

// 常量定义
const emptyLocalizedContent: LocalizedContent = {
  en: '',
  fr: '',
  ja: '',
  kr: '',
  tr: '',
  vi: '',
  ar: '',
  ge: '',
  sp: '',
  ru: '',
  in: '',
};

// 公告数据类型
type Announcement = {
  id: number;
  title: LocalizedContent;
  content: LocalizedContent;
  status: boolean;
  start_at: number;
  end_at: number;
  push_count: number;
  type: number;
};

// 表单数据类型
type AnnouncementFormData = Omit<Announcement, 'id'>;

// 时间戳工具函数
const toMilliseconds = (seconds: number) => seconds * 1000;
const toSeconds = (milliseconds: number) => Math.floor(milliseconds / 1000);
const getCurrentSeconds = () => Math.floor(Date.now() / 1000);

// 表单默认值
const defaultFormData: AnnouncementFormData = {
  title: { ...emptyLocalizedContent },
  content: { ...emptyLocalizedContent },
  status: true,
  start_at: getCurrentSeconds(), // 使用秒级时间戳
  end_at: getCurrentSeconds() + 7 * 24 * 60 * 60, // 7天后,使用秒级时间戳
  push_count: 1,
  type: 1,
};

// 语言配置
const languageOptions: LanguageOption[] = [
  { value: 'tr', label: '繁體中文 (Traditional Chinese)', required: true },
  { value: 'en', label: 'English (英语)', required: true },
  { value: 'fr', label: 'Français (法语)', required: true },
  { value: 'ja', label: '日本語 (日语)', required: true },
  { value: 'kr', label: '한국어 (韩语)', required: true },
  { value: 'vi', label: 'Tiếng Việt (越南语)', required: true },
  { value: 'ar', label: 'العربية (阿拉伯语)', required: true },
  { value: 'ge', label: 'Deutsch (德语)', required: true },
  { value: 'sp', label: 'Español (西班牙语)', required: true },
  { value: 'ru', label: 'Русский (俄语)', required: true },
  { value: 'in', label: 'Bahasa Indonesia (印尼语)', required: true },
];

// 语言分组配置
const languageGroups: LanguageGroup[] = [
  {
    name: '中文',
    languages: ['tr'],
  },
  {
    name: '东亚',
    languages: ['ja', 'kr'],
  },
  {
    name: '东南亚',
    languages: ['vi', 'in'],
  },
  {
    name: '欧洲',
    languages: ['en', 'fr', 'ge', 'sp', 'ru'],
  },
  {
    name: '其他',
    languages: ['ar'],
  },
];

// ----------------------------------------------------------------------

export function AnnouncementControlView() {
  const theme = useTheme();

  // loading状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 分页参数
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 当前选中的语言组和语言
  const [currentGroup, setCurrentGroup] = useState<string>('中文');
  const [currentLang, setCurrentLang] = useState<keyof LocalizedContent>('tr');

  // 列表数据
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // 获取公告列表
  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getNoticeList({
        page: page + 1,
        page_size: pageSize,
      });

      if (response.data?.list) {
        // 转换数据格式
        const convertedAnnouncements = response.data.list.map((notice): Announcement => {
          // 将notice_contents转换为LocalizedContent格式
          const title: LocalizedContent = { ...emptyLocalizedContent };
          const content: LocalizedContent = { ...emptyLocalizedContent };

          notice.notice_contents?.forEach((item) => {
            if (item.language && item.language in title) {
              title[item.language as keyof LocalizedContent] = item.title || '';
              content[item.language as keyof LocalizedContent] = item.content || '';
            }
          });

          return {
            id: notice.id || 0,
            title,
            content,
            status: notice.status === 1,
            start_at: notice.start_at!, // 后端返回的已经是秒级时间戳
            end_at: notice.end_at!,     // 后端返回的已经是秒级时间戳
            push_count: notice.push_count || 1,
            type: notice.type || 1,
          };
        });

        setAnnouncements(convertedAnnouncements);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('获取公告列表失败:', error);
      toast.error('获取公告列表失败');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  // 首次加载和分页变化时获取数据
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  // 表单数据
  const [formData, setFormData] = useState<AnnouncementFormData>(defaultFormData);

  // 编辑的公告ID
  const [editId, setEditId] = useState<number | null>(null);

  // 表单弹窗控制
  const formDialog = useBoolean();

  // 表格列定义
  const columns: GridColDef<Announcement, any, any>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
    },
    {
      field: 'title',
      headerName: '标题',
      flex: 1,
      renderCell: (params) => (
        <div
          className='h-full'
          dangerouslySetInnerHTML={renderHtml(params.row.title.tr || '')}
        />
      ),
    },
    {
      field: 'content',
      headerName: '内容',
      flex: 2,
      renderCell: (params) => (
        <div className='h-full' dangerouslySetInnerHTML={renderHtml(params.row.content.tr || '')} />
      ),
    },
    {
      field: 'status',
      headerName: '状态',
      width: 120,
      renderCell: (params) => (
        <Label color={params.row.status ? 'success' : 'error'}>
          {params.row.status ? '启用' : '禁用'}
        </Label>
      ),
    },
    {
      field: 'start_at',
      headerName: '开始时间',
      width: 180,
      renderCell: (params) => new Date(toMilliseconds(params.row.start_at)).toLocaleString(),
    },
    {
      field: 'end_at',
      headerName: '结束时间',
      width: 180,
      renderCell: (params) => new Date(toMilliseconds(params.row.end_at)).toLocaleString(),
    },
    {
      field: 'push_count',
      headerName: '推送次数',
      width: 120,
    },
    {
      field: 'type',
      headerName: '类型',
      width: 120,
      renderCell: (params) => (
        <Label color={params.row.type === 1 ? 'primary' : 'warning'}>
          {params.row.type === 1 ? '全局' : '个人'}
        </Label>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '操作',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<Iconify icon="solar:pen-bold" />}
          label="编辑"
          onClick={() => {
            setEditId(params.row.id);
            setFormData(params.row);
            formDialog.onTrue();
          }}
        />,
      ],
    },
  ];

  // 处理编辑
  const handleEdit = (announcement: Announcement) => {
    // 从API获取完整的公告信息
    const fetchNoticeDetail = async () => {
      try {
        setIsLoading(true);
        const response = await getNoticeDetail({
          id: announcement.id,
        });

        if (response.data) {
          const notice = response.data;
          setFormData({
            title: announcement.title,
            content: announcement.content,
            status: notice.status === 1,
            start_at: notice.start_at, // 后端返回的已经是秒级时间戳
            end_at: notice.end_at,     // 后端返回的已经是秒级时间戳
            push_count: notice.push_count,
            type: notice.type,
          });
          setEditId(announcement.id);
          setOriginalContents(notice.notice_contents || []);
          formDialog.onTrue();
        }
      } catch (error) {
        console.error('获取公告详情失败:', error);
        toast.error('获取公告详情失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNoticeDetail();
  };

  // 转换公告内容为API格式
  const convertNoticeContents = (
    title: LocalizedContent,
    content: LocalizedContent,
    originalContents?: ModelsNoticeContent[]
  ): ModelsNoticeContent[] => Object.entries(title).map(([lang, title]) => {
    const originalContent = originalContents?.find((item) => item.language === lang);
    return {
      language: lang,
      title,
      content: content[lang as keyof LocalizedContent],
      ...(originalContent?.id ? { id: originalContent.id } : {}),
    };
  });

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      // 验证必填语言
      const emptyFields: { lang: string; field: string }[] = [];
      
      languageOptions.forEach((lang) => {
        if (lang.required) {
          if (!formData.title[lang.value]?.trim()) {
            emptyFields.push({ 
              lang: lang.label,
              field: '标题'
            });
          }
          if (!formData.content[lang.value]?.trim()) {
            emptyFields.push({ 
              lang: lang.label,
              field: '内容'
            });
          }
        }
      });

      if (emptyFields.length > 0) {
        const message = emptyFields
          .map(({ lang, field }) => `${lang}: ${field}`)
          .join('\n');
        
        toast.error(`以下必填项未填写:\n${message}`);
        return;
      }

      setIsSubmitting(true);

      // 添加调试日志
      console.log('Form Data:', {
        title: formData.title,
        content: formData.content
      });
      console.log('Original Contents:', originalContents);

      // 转换数据格式
      const noticeContents = convertNoticeContents(
        formData.title,
        formData.content,
        editId ? originalContents : undefined
      );

      // 添加转换后的数据日志
      console.log('Converted Notice Contents:', noticeContents);

      if (editId) {
        // 更新公告
        const updateData: NoticeUpdateRequest = {
          id: editId,
          notice_contents: noticeContents,
          status: formData.status ? 1 : 2,
          start_at: formData.start_at, // 已经是秒级时间戳
          end_at: formData.end_at,     // 已经是秒级时间戳
        };
        await updateNotice(updateData);
      } else {
        // 创建公告
        const createData: NoticeCreateRequest = {
          notice_contents: noticeContents,
          status: formData.status ? 1 : 2,
          type: formData.type,
          start_at: formData.start_at, // 已经是秒级时间戳
          end_at: formData.end_at,     // 已经是秒级时间戳
          push_count: formData.push_count,
        };
        await createNotice(createData);
      }

      // 重新获取列表
      await fetchAnnouncements();

      // 成功后关闭表单
      handleClose();
      toast.success(editId ? '公告已更新' : '公告已创建');
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('操作失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 重置表单状态
  const resetForm = useCallback(() => {
    setFormData(defaultFormData);
    setEditId(null);
    setOriginalContents([]);
  }, []);

  // 处理表单关闭
  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    resetForm();
    formDialog.onFalse();
  }, [isSubmitting, formDialog, resetForm]);

  // 处理新建公告
  const handleCreate = () => {
    resetForm();
    formDialog.onTrue();
  };

  // 处理语言切换
  const handleLangChange = (_: React.SyntheticEvent, newValue: string) => {
    setCurrentLang(newValue as keyof LocalizedContent);
  };

  // 获取当前组的语言选项
  const getCurrentGroupLanguages = useCallback(() => {
    const group = languageGroups.find((g) => g.name === currentGroup);
    if (!group) return [];
    return languageOptions.filter((lang) => group.languages.includes(lang.value));
  }, [currentGroup]);

  // 复制其他语言内容
  const handleCopyContent = (sourceLang: keyof LocalizedContent) => {
    setFormData({
      ...formData,
      title: {
        ...formData.title,
        [currentLang]: formData.title[sourceLang],
      },
      content: {
        ...formData.content,
        [currentLang]: formData.content[sourceLang],
      },
    });
  };

  // 渲染HTML内容
  const renderHtml = (html: string) => ({
    __html: DOMPurify.sanitize(html),
  });

  // 处理富文本内容变化
  const handleContentChange = (lang: string, value: string) => {
    console.log('handleContentChange', lang, value);
    setFormData((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [lang]: value,
      },
    }));
  };

  // 处理标题变更
  const handleTitleChange = (lang: string, value: string) => {
    console.log('handleTitleChange', lang, value);
    setFormData((prev) => ({
      ...prev,
      title: {
        ...prev.title,
        [lang]: value,
      },
    }));
  };

  // 保存原始的notice_contents用于更新
  const [originalContents, setOriginalContents] = useState<ModelsNoticeContent[]>([]);

  return (
    <>
      <Box
        sx={{
          p: theme.spacing(3),
        }}
      >
        <CustomBreadcrumbs
          heading="公告管理"
          links={[{ name: '首页' }, { name: '公告管理' }]}
          sx={{ mb: 3 }}
          action={
            <Button
              variant="contained"
              onClick={handleCreate}
            >
              新增公告
            </Button>
          }
        />

        <Card>
          <DataGrid<Announcement>
            rows={announcements}
            columns={columns}
            rowCount={total}
            loading={isLoading}
            pageSizeOptions={[10, 20, 50]}
            paginationModel={{ page, pageSize }}
            paginationMode="server"
            onPaginationModelChange={({ page: newPage, pageSize: newPageSize }) => {
              handlePageChange(newPage);
              if (newPageSize !== pageSize) {
                handlePageSizeChange(newPageSize);
              }
            }}
            disableRowSelectionOnClick
            sx={{ minHeight: 400 }}
          />
        </Card>
      </Box>

      {/* 新增/编辑公告弹窗 */}
      <Dialog
        fullWidth
        maxWidth="lg"
        open={formDialog.value}
        onClose={handleClose}
      >
        <DialogTitle>{editId ? '编辑公告' : '新增公告'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {/* 语言组切换 */}
            <Tabs
              value={currentGroup}
              onChange={(e, value) => {
                setCurrentGroup(value);
                const groupLangs = languageGroups.find((g) => g.name === value)?.languages || [];
                setCurrentLang(groupLangs[0]);
              }}
              sx={{ mb: 2 }}
            >
              {languageGroups.map((group) => (
                <Tab
                  key={group.name}
                  value={group.name}
                  label={group.name}
                />
              ))}
            </Tabs>

            {/* 语言切换 */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Tabs
                value={currentLang}
                onChange={(e, value) => setCurrentLang(value)}
                sx={{ mb: 3, flex: 1 }}
              >
                {getCurrentGroupLanguages().map((lang) => {
                  const hasContent =
                    formData.title[lang.value]?.trim() !== '' ||
                    formData.content[lang.value]?.trim() !== '';
                  return (
                    <Tab
                      key={lang.value}
                      value={lang.value}
                      label={
                        <span>
                          {lang.label}
                          {lang.required && ' *'}
                          {hasContent && ' ✓'}
                        </span>
                      }
                    />
                  );
                })}
              </Tabs>

              {/* 复制按钮 */}
              {/* {currentLang !== 'tr' && (
                <Tooltip title="从繁体中文复制">
                  <IconButton
                    size="small"
                    onClick={() => handleCopyContent('tr')}
                    disabled={isSubmitting}
                  >
                    <Iconify icon="material-symbols:content-copy" />
                  </IconButton>
                </Tooltip>
              )} */}
            </Stack>

            {/* 当前语言的输入框 */}
            <Box sx={{ mb: 3 }}>
              {/* 标题富文本编辑器 */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    color: (theme) =>
                      languageOptions.find((l) => l.value === currentLang)?.required &&
                      !formData.title[currentLang as keyof LocalizedContent]?.trim()
                        ? theme.palette.error.main
                        : 'inherit',
                  }}
                >
                  {languageOptions.find((l) => l.value === currentLang)?.label}标题
                  {languageOptions.find((l) => l.value === currentLang)?.required && (
                    <Typography
                      component="span"
                      sx={{ color: 'error.main', ml: 0.5 }}
                    >
                      *
                    </Typography>
                  )}
                </Typography>
                <Box sx={{ '.ql-container': { minHeight: '100px' } }}>
                  <ReactQuill
                    theme="snow"
                    key={currentLang}
                    value={formData.title[currentLang as keyof LocalizedContent] || ''}
                    onChange={(value) => handleTitleChange(currentLang, value)}
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'color': [] }],
                      ],
                    }}
                  />
                </Box>
                {languageOptions.find((l) => l.value === currentLang)?.required &&
                  !formData.title[currentLang as keyof LocalizedContent]?.trim() && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'error.main', mt: 1, display: 'block' }}
                    >
                      请输入标题
                    </Typography>
                  )}
              </Box>

              {/* 内容富文本编辑器 */}
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 2,
                    color: (theme) =>
                      languageOptions.find((l) => l.value === currentLang)?.required &&
                      !formData.content[currentLang as keyof LocalizedContent]?.trim()
                        ? theme.palette.error.main
                        : 'inherit',
                  }}
                >
                  {languageOptions.find((l) => l.value === currentLang)?.label}内容
                  {languageOptions.find((l) => l.value === currentLang)?.required && (
                    <Typography
                      component="span"
                      sx={{ color: 'error.main', ml: 0.5 }}
                    >
                      *
                    </Typography>
                  )}
                </Typography>
                <Box sx={{ '.ql-container': { minHeight: '200px' } }}>
                  <ReactQuill
                    theme="snow"
                    key={currentLang}
                    value={formData.content[currentLang] || ''}
                    onChange={(value) => handleContentChange(currentLang, value)}
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote', 'code-block'],
                        [{ 'header': 1 }, { 'header': 2 }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'script': 'sub'}, { 'script': 'super' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        [{ 'direction': 'rtl' }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'font': [] }],
                        [{ 'align': [] }],
                        ['clean'],
                        ['link', 'image', 'video']
                      ],
                    }}
                  />
                </Box>
                {languageOptions.find((l) => l.value === currentLang)?.required &&
                  !formData.content[currentLang]?.trim() && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'error.main', mt: 1, display: 'block' }}
                    >
                      请输入内容
                    </Typography>
                  )}
              </Box>
            </Box>
            {/* 通用设置 */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                  disabled={isSubmitting}
                />
              }
              label="启用状态"
            />
            <TextField
              label="开始时间"
              type="datetime-local"
              value={new Date(toMilliseconds(formData.start_at)).toISOString().slice(0, 16)}
              onChange={(e) =>
                setFormData({ ...formData, start_at: toSeconds(new Date(e.target.value).getTime()) })
              }
              disabled={isSubmitting}
            />
            <TextField
              label="结束时间"
              type="datetime-local"
              value={new Date(toMilliseconds(formData.end_at)).toISOString().slice(0, 16)}
              onChange={(e) =>
                setFormData({ ...formData, end_at: toSeconds(new Date(e.target.value).getTime()) })
              }
              disabled={isSubmitting}
            />
            <TextField
              label="推送次数"
              type="number"
              value={formData.push_count}
              onChange={(e) => setFormData({ ...formData, push_count: Number(e.target.value) })}
              disabled={isSubmitting || Boolean(editId)}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.type === 1}
                  onChange={(e) => setFormData({ ...formData, type: e.target.checked ? 1 : 2 })}
                  disabled={isSubmitting || Boolean(editId)}
                />
              }
              label="是否全局"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            取消
          </Button>
          <LoadingButton onClick={handleSubmit} variant="contained" loading={isSubmitting}>
            确定
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
