export const getKycStatus = async (token: string) => {
  try {
    const response = await fetch('http://localhost:3500/api/student/kyc-status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch KYC status.');
    }
    return await response.json();
  } catch (error) {
    console.error('Get KYC Status API error:', error);
    throw error;
  }
};


export const uploadKycData = async (formData: FormData, token: string) => {
  try {
    const response = await fetch('http://localhost:3500/api/student/kyc-upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong during KYC upload.');
    }
    return await response.json();
  } catch (error) {
    console.error('KYC Upload API error:', error);
    throw error;
  }
};

export const loginUser = async (credentials: any) => {
  try {
    const response = await fetch('http://localhost:3500/api/student/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong during login.');
    }

    return await response.json();
  } catch (error) {
    console.error('Login API error:', error);
    throw error;
  }
};

export const signupUser = async (formData: any) => {
  try {
    const response = await fetch('http://localhost:3500/api/student/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong during signup.');
    }

    return await response.json();
  } catch (error) {
    console.error('Signup API error:', error);
    throw error;
  }
};

export const getStudentProfile = async (token: string) => {
  try {
    const response = await fetch('http://localhost:3500/api/student/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch profile data.');
    }

    return await response.json();
  } catch (error) {
    console.error('Get Profile API error:', error);
    throw error;
  }
};

export const updateStudentProfile = async (token: string, profileData: {
  firstName: string;
  lastName: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}) => {
  try {
    const response = await fetch('http://localhost:3500/api/student/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile.');
    }
    return await response.json();
  } catch (error) {
    console.error('Update Profile API error:', error);
    throw error;
  }
};

export const getStudentCourses = async (token: string, params?: {
  category?: string;
  courseType?: 'online' | 'offline';
  level?: 'beginner' | 'intermediate' | 'advanced';
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.courseType) queryParams.append('courseType', params.courseType);
    if (params?.level) queryParams.append('level', params.level);
    
    const url = `http://localhost:3500/api/student/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch courses.');
    }
    return await response.json();
  } catch (error) {
    console.error('Get Courses API error:', error);
    throw error;
  }
};

export const getStudentCertificates = async (token: string) => {
  try {
    const response = await fetch('http://localhost:3500/api/student/certificates', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch certificates.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get Certificates API error:', error);
    throw error;
  }
};

export const getStudentMarksheets = async (token: string) => {
  try {
    const response = await fetch('http://localhost:3500/api/student/marksheets', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch marksheets.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get Marksheets API error:', error);
    throw error;
  }
};

export const getStudentEnrollments = async (token: string) => {
  try {
    const response = await fetch('http://localhost:3500/api/student/enrollments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch enrollments.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get Enrollments API error:', error);
    throw error;
  }
};

// Society Member API Functions
export const loginSocietyMember = async (credentials: { email?: string; password: string; memberId: string; accountNumber?: string }) => {
  try {
    const response = await fetch('http://localhost:3500/api/society-member/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong during login.');
    }

    return await response.json();
  } catch (error) {
    console.error('Society Member Login API error:', error);
    throw error;
  }
};

export const signupSocietyMember = async (formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  password: string;
  agentCode?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}) => {
  try {
    const response = await fetch('http://localhost:3500/api/society-member/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong during signup.');
    }

    return await response.json();
  } catch (error) {
    console.error('Society Member Signup API error:', error);
    throw error;
  }
};

export const getSocietyMemberKycStatus = async (token: string) => {
  try {
    const response = await fetch('http://localhost:3500/api/society-member/kyc-status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch KYC status.');
    }
    return await response.json();
  } catch (error) {
    console.error('Get Society Member KYC Status API error:', error);
    throw error;
  }
};

export const uploadSocietyMemberKycData = async (formData: FormData, token: string) => {
  try {
    const response = await fetch('http://localhost:3500/api/society-member/kyc-upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong during KYC upload.');
    }
    return await response.json();
  } catch (error) {
    console.error('Society Member KYC Upload API error:', error);
    throw error;
  }
};

export const submitLoanApplication = async (loanData: any, token: string) => {
  try {
    const response = await fetch('http://localhost:3500/api/loans/apply', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loanData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit loan application.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Loan Application API error:', error);
    throw error;
  }
};

export const uploadBankDocument = async (formData: FormData, token: string) => {
  try {
    const response = await fetch('http://localhost:3500/api/society-member/upload-bank-document', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload bank document.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Bank Document Upload API error:', error);
    throw error;
  }
};

export const getBankDocuments = async (token: string) => {
  try {
    const response = await fetch('http://localhost:3500/api/society-member/bank-documents', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch bank documents.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get Bank Documents API error:', error);
    throw error;
  }
};

export const getLoanPenaltyDetails = async (loanId: string, token: string) => {
  try {
    const response = await fetch(`http://localhost:3500/api/loans/${loanId}/penalty-details`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch penalty details.');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Get Loan Penalty Details API error:', error);
    throw error;
  }
};
