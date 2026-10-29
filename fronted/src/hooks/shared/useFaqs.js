import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks.js';
import {
  selectFaqs,
  fetchFaqsThunk,
  createFaqThunk,
  updateFaqThunk,
  deleteFaqThunk,
} from '../../store/slices/shared/faqSlice.js';

/** FAQs — role-based. loadFaqs(roleCode) returns that role's + global FAQs. */
export const useFaqs = () => {
  const dispatch = useAppDispatch();
  const faqs = useAppSelector(selectFaqs);

  const loadFaqs = useCallback((roleCode) => dispatch(fetchFaqsThunk(roleCode)).unwrap(), [dispatch]);
  const createFaq = useCallback((data) => dispatch(createFaqThunk(data)).unwrap(), [dispatch]);
  const updateFaq = useCallback((id, data) => dispatch(updateFaqThunk({ id, data })).unwrap(), [dispatch]);
  const deleteFaq = useCallback((id) => dispatch(deleteFaqThunk(id)).unwrap(), [dispatch]);

  return { faqs, loadFaqs, createFaq, updateFaq, deleteFaq };
};

export default useFaqs;
