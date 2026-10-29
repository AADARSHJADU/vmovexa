import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectContentPages,
  selectContentList,
  fetchContentPageThunk,
  fetchContentListThunk,
  createContentPageThunk,
  updateContentPageThunk,
  publishContentPageThunk,
} from '../../store/slices/shared/contentSlice.js';

/** Content pages (Terms/Privacy/Help). Read for all roles, manage for SuperAdmin. */
export const useContent = () => {
  const dispatch = useAppDispatch();
  const pages = useAppSelector(selectContentPages);
  const list = useAppSelector(selectContentList);
  const status = useAppSelector((state) => state.content?.status || 'idle');
  const error = useAppSelector((state) => state.content?.error || null);

  const loadPage = useCallback((type, role) => {
    return dispatch(fetchContentPageThunk(role ? { type, role } : type)).unwrap().catch(() => null);
  }, [dispatch]);

  const loadList = useCallback((params = {}) => dispatch(fetchContentListThunk(params)).unwrap(), [dispatch]);
  const createPage = useCallback((data) => dispatch(createContentPageThunk(data)).unwrap(), [dispatch]);
  const updatePage = useCallback((id, data) => dispatch(updateContentPageThunk({ id, data })).unwrap(), [dispatch]);
  const publishPage = useCallback((id) => dispatch(publishContentPageThunk(id)).unwrap(), [dispatch]);

  const getPage = useCallback((type, role) => {
    if (role && pages[`${type}_${role}`]) return pages[`${type}_${role}`];
    return pages[type] || null;
  }, [pages]);

  return { pages, list, status, error, loadPage, loadList, createPage, updatePage, publishPage, getPage };
};

export default useContent;
