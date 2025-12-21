import { apiClient } from '@/lib/api';

export interface PaymentInitiationResponse {
  success: boolean;
  message: string;
  data: {
    checkout_url: string;
    payment_reference: string;
    enrollment_id: number;
    tutorial_id: number;
    amount: number;
    currency: string;
  };
}

export interface PaymentVerificationResponse {
  success: boolean;
  data: {
    payment: {
      id: number;
      user_id: number;
      tutorial_id: number;
      enrollment_id: number;
      amount: number;
      currency: string;
      chapa_reference: string;
      payment_method: string;
      status: string;
      completed_at: string | null;
      created_at: string;
      updated_at: string;
    };
    tutorial: {
      id: number;
      title: string;
      description: string;
      price: number;
      is_free: boolean;
    };
    enrollment: {
      id: number;
      user_id: number;
      tutorial_id: number;
      status: string;
      activated_at: string | null;
    };
  };
}

export interface PaymentHistoryResponse {
  success: boolean;
  data: {
    payments: Array<{
      id: number;
      amount: number;
      currency: string;
      status: string;
      chapa_reference: string;
      created_at: string;
      completed_at: string | null;
      tutorial: {
        id: number;
        title: string;
        image: string;
      };
      enrollment: {
        id: number;
        status: string;
      } | null;
    }>;
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
}

export interface TutorialEnrollmentStatus {
  is_enrolled: boolean;
  enrollment_status?: string;
  enrollment_id?: number;
  payment_status?: string;
  payment_reference?: string;
}

/**
 * Initialize payment for tutorial enrollment
 */
export const initiatePayment = async (tutorialId: number, returnUrl?: string): Promise<PaymentInitiationResponse> => {
  const response = await apiClient.post(`/payments/tutorials/${tutorialId}/enroll`, {
    return_url: returnUrl,
  });
  return response.data;
};

/**
 * Verify payment status
 */
export const verifyPayment = async (paymentReference: string): Promise<PaymentVerificationResponse> => {
  const response = await apiClient.get('/payments/verify', {
    params: { payment_reference: paymentReference }
  });
  return response.data;
};

/**
 * Get payment details
 */
export const getPaymentDetails = async (paymentId: number) => {
  const response = await apiClient.get(`/payments/${paymentId}`);
  return response.data;
};

/**
 * Get user's payment history
 */
export const getPaymentHistory = async (page: number = 1, perPage: number = 10): Promise<PaymentHistoryResponse> => {
  const response = await apiClient.get('/payments/history', {
    params: { page, per_page: perPage }
  });
  return response.data;
};

/**
 * Check if user is enrolled in a tutorial
 */
export const checkEnrollmentStatus = async (tutorialId: number): Promise<TutorialEnrollmentStatus> => {
  try {
    // First check if tutorial is free
    const tutorialResponse = await apiClient.get(`/tutorials/${tutorialId}`);
    const tutorial = tutorialResponse.data;
    
    if (tutorial.data.is_free) {
      // For free tutorials, we can enroll directly
      const enrollmentResponse = await apiClient.post(`/enrollments`, {
        tutorial_id: tutorialId
      });
      
      return {
        is_enrolled: true,
        enrollment_status: 'active',
        enrollment_id: enrollmentResponse.data.data.id,
      };
    }
    
    // Check existing enrollment
    const enrollmentResponse = await apiClient.get(`/enrollments/check`, {
      params: { tutorial_id: tutorialId }
    });
    
    return enrollmentResponse.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { is_enrolled: false };
    }
    throw error;
  }
};

/**
 * Get enrollment by ID
 */
export const getEnrollment = async (enrollmentId: number) => {
  const response = await apiClient.get(`/enrollments/${enrollmentId}`);
  return response.data;
};