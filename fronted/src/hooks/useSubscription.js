import { useState, useCallback } from 'react';
import { billingService } from '../api/services/billing.service.js';

export const useSubscription = () => {
  const [plans, setPlans] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billingService.getPlans();
      setPlans(data || []);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await billingService.getSubscription();
      setSubscription(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = useCallback(async (data) => {
    return await billingService.createSubscriptionOrder(data);
  }, []);

  const confirmSubscription = useCallback(async (data) => {
    return await billingService.confirmSubscription(data);
  }, []);

  const verifySession = useCallback(async (data) => {
    return await billingService.verifySession(data);
  }, []);

  const checkPaymentStatus = useCallback(async (data = {}) => {
    return await billingService.checkPaymentStatus(data);
  }, []);

  return {
    plans,
    subscription,
    loading,
    error,
    loadPlans,
    loadSubscription,
    createOrder,
    confirmSubscription,
    verifySession,
    checkPaymentStatus,
  };
};

export default useSubscription;
