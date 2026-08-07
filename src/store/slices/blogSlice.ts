import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Blog } from '@/data/models/Blog';
import api from '@/services/api';

interface BlogState {
  items: Blog[];
  loading: boolean;
  error: string | null;
  selectedBlog: Blog | null;
}

interface BlogFilter {
  status?: 'published' | 'draft';
  slug?: string;
}

interface BlogParams {
  fields?: string;
  filter?: BlogFilter;
  sort?: string[];
  limit?: number;
}

const initialState: BlogState = {
  items: [],
  loading: false,
  error: null,
  selectedBlog: null,
};

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (params?: BlogParams) => {
    const response = await api.getBlogs(params);
    return response.data as Blog[];
  }
);

export const fetchBlogBySlug = createAsyncThunk(
  'blogs/fetchBlogBySlug',
  async (slug: string) => {
    const response = await api.getBlogs({
      fields: '*,cover_image.data.full_url',
      filter: {
        status: 'published',
        slug: slug
      }
    });
    return response.data[0] as Blog;
  }
);

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    setSelectedBlog: (state, action) => {
      state.selectedBlog = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch blogs';
      })
      .addCase(fetchBlogBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBlog = action.payload;
      })
      .addCase(fetchBlogBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch blog';
      });
  },
});

export const { setSelectedBlog, clearError } = blogSlice.actions;
export default blogSlice.reducer; 